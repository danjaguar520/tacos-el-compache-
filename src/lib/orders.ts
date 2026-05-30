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
import { business } from "@/config/business";

export interface CreateOrderResult {
  orderId: string;
  /** A dónde debe redirigir el cliente (Mercado Pago o /checkout/success). */
  redirectUrl: string;
  /** true si se usó el flujo simulado (sin cobro real). */
  simulated: boolean;
}

/**
 * Verifica el carrito contra la fuente de verdad, persiste el pedido y prepara
 * el pago. NO confía en los precios enviados por el cliente.
 */
export async function createOrder(
  payload: CheckoutPayload,
  baseUrl: string,
): Promise<CreateOrderResult> {
  if (!payload.items?.length) {
    throw new Error("El carrito está vacío.");
  }

  // 1) Verificar productos y recalcular precios en el servidor.
  const lines: {
    product_id: string;
    product_name: string;
    unit_price_cents: number;
    quantity: number;
  }[] = [];

  for (const item of payload.items) {
    const product = await getVerifiedProduct(item.productId);
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
    payload.delivery_method === "domicilio" ? business.costoEnvioCents : 0;
  const totalCents = subtotalCents + shippingCents;

  // 2) Persistir el pedido (status pendiente) si Supabase está disponible.
  const admin = getAdminClient();
  let orderId: string = randomUUID();

  if (admin) {
    const { data: order, error } = await admin
      .from("orders")
      .insert({
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        notes: payload.notes || null,
        delivery_method: payload.delivery_method,
        status: "pendiente",
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
      })
      .select("id")
      .single();

    if (error || !order) {
      throw new Error(`No se pudo crear el pedido: ${error?.message ?? "desconocido"}`);
    }
    orderId = order.id as string;

    const { error: itemsError } = await admin.from("order_items").insert(
      lines.map((l) => ({ ...l, order_id: orderId })),
    );
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
    await admin.from("payments").insert({
      order_id: orderId,
      provider: "simulado",
      status: "approved",
      amount_cents: totalCents,
    });
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

/** Obtiene un pedido con sus líneas (para la página de confirmación). */
export async function getOrder(orderId: string): Promise<Order | null> {
  if (!isSupabaseWritable()) return null;
  const admin = getAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  return (data as Order) ?? null;
}
