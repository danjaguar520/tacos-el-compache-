import { NextResponse } from "next/server";
import { getPayment } from "@/lib/mercadopago";
import { mapPaymentStatus } from "@/lib/orders";
import { getAdminClient } from "@/lib/supabase/server";
import { scopedInsert } from "@/lib/db-helpers";

export const runtime = "nodejs";

/**
 * Webhook de Mercado Pago (IPN / Webhooks).
 * MP notifica cambios de pago; consultamos el pago, registramos el cobro y
 * actualizamos el estado del pedido. Siempre respondemos 200 para que MP no
 * reintente indefinidamente.
 *
 * Sprint 5D-4: Derivamos business_id consultando la orden por su id
 * (external_reference). Esto mantiene el aislamiento multi-tenant sin
 * necesidad de que MP envíe contexto adicional.
 */
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    let type = url.searchParams.get("type") ?? url.searchParams.get("topic");
    let paymentId =
      url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? undefined;

    // El cuerpo también puede traer la info.
    try {
      const body = await req.json();
      type = body?.type ?? body?.topic ?? type;
      paymentId = body?.data?.id ?? body?.resource ?? paymentId;
    } catch {
      /* sin cuerpo JSON: usamos los query params */
    }

    if (type !== "payment" || !paymentId) {
      return NextResponse.json({ received: true });
    }

    const payment = await getPayment(String(paymentId));
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    const status = payment.status ?? "pending";
    const admin = getAdminClient();

    if (admin) {
      // Derive business_id from the existing order row (multi-tenant safe lookup).
      const { data: orderRow } = await admin
        .from("orders")
        .select("business_id")
        .eq("id", orderId)
        .maybeSingle();

      const businessId = (orderRow as { business_id: string | null } | null)?.business_id ?? null;

      const paymentRow = {
        order_id:            orderId,
        provider:            "mercadopago",
        provider_payment_id: String(payment.id),
        status,
        amount_cents:        Math.round((payment.transaction_amount ?? 0) * 100),
        raw:                 payment as unknown as Record<string, unknown>,
      };

      if (businessId) {
        await scopedInsert(admin, "payments", businessId, paymentRow);
      } else {
        await admin.from("payments").insert(paymentRow);
      }

      // No explicit business_id filter here: orderId is our own UUID, generated
      // when the order was created and sent to MP as external_reference — MP
      // returns it verbatim, so this update can only ever target the single
      // order it already belongs to (the same one businessId was derived from
      // two queries above). There is no cross-tenant selection surface.
      await admin
        .from("orders")
        .update({ status: mapPaymentStatus(status), mp_payment_id: String(payment.id) })
        .eq("id", orderId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook Mercado Pago error:", err);
    // Responder 200 evita reintentos en bucle; el error queda en logs.
    return NextResponse.json({ received: true });
  }
}
