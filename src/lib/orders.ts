import "server-only";
import { randomUUID } from "crypto";
import type { CheckoutPayload, Order, OrderStatus } from "@/types";
import { getVerifiedProduct } from "@/lib/menu";
import { getAdminClient, isSupabaseWritable } from "@/lib/supabase/server";
import {
  isMercadoPagoConfigured,
  createPreference,
  type PreferenceItem,
} from "@/lib/mercadopago";
import { resolveBusinessId, scopedInsert } from "@/lib/db-helpers";

export interface CreateOrderResult {
  orderId: string;
  /** A dónde debe redirigir el cliente (Mercado Pago o /checkout/success). */
  redirectUrl: string;
  /** true si se usó el flujo simulado (sin cobro real). */
  simulated: boolean;
}

/** Business-specific settings resolved by the checkout route handler. */
export interface OrderBusinessContext {
  /** URL-safe slug for the business (e.g. "compache"). */
  slug:            string;
  /** True when config came from DB; false when using static fallback. */
  fromDB:          boolean;
  /** Costo de envío a domicilio en centavos. */
  costoEnvioCents: number;
  /** Descriptor que aparece en el extracto bancario del cliente. */
  mpDescriptor:    string;
}

/**
 * Verifica el carrito contra la fuente de verdad, persiste el pedido y prepara
 * el pago. NO confía en los precios enviados por el cliente.
 *
 * businessCtx is resolved by the calling route handler from getBusinessContext().
 * When omitted (legacy callers / tests) falls back to the static business config.
 */
export async function createOrder(
  payload:      CheckoutPayload,
  baseUrl:      string,
  businessCtx?: OrderBusinessContext,
): Promise<CreateOrderResult> {
  if (!payload.items?.length) {
    throw new Error("El carrito está vacío.");
  }

  // Resolve business_id for multi-tenant DB writes.
  // resolveBusinessId() handles missing table gracefully (returns null).
  const admin = getAdminClient();
  let businessId: string | null = null;

  if (admin && businessCtx?.slug) {
    businessId = await resolveBusinessId(admin, businessCtx.slug);
  }

  // Static fallback values when businessCtx is not provided.
  const { business: staticBusiness } = await import("@/config/business");
  const costoEnvioCents = businessCtx?.costoEnvioCents ?? staticBusiness.costoEnvioCents;
  const mpDescriptor    = businessCtx?.mpDescriptor    ?? staticBusiness.mpDescriptor;

  // 1) Verificar productos y recalcular precios en el servidor.
  const lines: {
    product_id: string;
    product_name: string;
    unit_price_cents: number;
    quantity: number;
  }[] = [];

  for (const item of payload.items) {
    // Pass businessId so the lookup is scoped to this tenant's catalog.
    // null → legacy mode (no cross-tenant risk: only one business exists).
    const product = await getVerifiedProduct(item.productId, businessId);
    if (!product) {
      throw new Error(`Producto no disponible: ${item.productId}`);
    }
    const quantity = Math.max(1, Math.floor(item.quantity));
    lines.push({
      product_id: product.id,
      product_name: product.name,
      unit_price_cents: product.price_cents,
      quantity,
    });
  }

  const subtotalCents = lines.reduce(
    (acc, l) => acc + l.unit_price_cents * l.quantity,
    0,
  );
  const shippingCents =
    payload.delivery_method === "domicilio" ? costoEnvioCents : 0;
  const totalCents = subtotalCents + shippingCents;

  // 2) Persistir el pedido (status pendiente) si Supabase está disponible.
  let orderId: string = randomUUID();

  if (admin) {
    const orderRow = {
      customer_name:   payload.customer_name,
      customer_phone:  payload.customer_phone,
      notes:           payload.notes || null,
      delivery_method: payload.delivery_method,
      status:          "pendiente",
      subtotal_cents:  subtotalCents,
      total_cents:     totalCents,
    };

    // Use scopedInsert when we have a businessId; fall back to plain insert otherwise.
    const insertQuery = businessId
      ? scopedInsert(admin, "orders", businessId, orderRow)
      : admin.from("orders").insert(orderRow);

    const { data: order, error } = await insertQuery.select("id").single();

    if (error || !order) {
      throw new Error(`No se pudo crear el pedido: ${error?.message ?? "desconocido"}`);
    }
    orderId = (order as { id: string }).id;

    const itemRows = lines.map((l) => ({ ...l, order_id: orderId }));
    const { error: itemsError } = businessId
      ? await scopedInsert(admin, "order_items", businessId, itemRows)
      : await admin.from("order_items").insert(itemRows);

    if (itemsError) {
      throw new Error(`No se pudieron guardar los productos: ${itemsError.message}`);
    }
  }

  // 3) Pago: real (Mercado Pago) o simulado.
  if (isMercadoPagoConfigured()) {
    const items: PreferenceItem[] = lines.map((l) => ({
      id: l.product_id,
      title: l.product_name,
      quantity: l.quantity,
      unit_price: l.unit_price_cents / 100,
      currency_id: "MXN",
    }));

    const { preferenceId, initPoint } = await createPreference({
      orderId,
      items,
      shippingCost: shippingCents / 100,
      payer: { name: payload.customer_name, phone: payload.customer_phone },
      baseUrl,
      mpDescriptor,
    });

    if (admin) {
      await admin
        .from("orders")
        .update({ mp_preference_id: preferenceId })
        .eq("id", orderId);
    }

    return { orderId, redirectUrl: initPoint, simulated: false };
  }

  // Modo simulado: marcar como pagado y redirigir a confirmación.
  if (admin) {
    await admin.from("orders").update({ status: "pagado" }).eq("id", orderId);

    const paymentRow = {
      order_id:    orderId,
      provider:    "simulado",
      status:      "approved",
      amount_cents: totalCents,
    };
    if (businessId) {
      await scopedInsert(admin, "payments", businessId, paymentRow);
    } else {
      await admin.from("payments").insert(paymentRow);
    }
  }

  return {
    orderId,
    redirectUrl: `${baseUrl}/checkout/success?order=${orderId}&demo=1`,
    simulated: true,
  };
}

/** Mapea el estado de un pago de Mercado Pago al estado interno del pedido. */
export function mapPaymentStatus(mpStatus: string): OrderStatus {
  switch (mpStatus) {
    case "approved":
      return "pagado";
    case "pending":
    case "in_process":
    case "authorized":
      return "pendiente";
    case "rejected":
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "cancelado";
    default:
      return "pendiente";
  }
}

/**
 * Obtiene un pedido con sus líneas (para la página de confirmación).
 *
 * businessId — when provided, restricts the lookup to that tenant's orders.
 * Pass null/undefined in legacy mode (pre-migration or static fallback).
 * This mirrors the pattern used in getVerifiedProduct().
 */
export async function getOrder(orderId: string, businessId?: string | null): Promise<Order | null> {
  if (!isSupabaseWritable()) return null;
  const admin = getAdminClient();
  if (!admin) return null;

  let query = admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId);

  if (businessId) {
    query = query.eq("business_id", businessId) as typeof query;
  }

  const { data } = await query.maybeSingle();

  return (data as Order) ?? null;
}
