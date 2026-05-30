import { NextResponse } from "next/server";
import { getPayment } from "@/lib/mercadopago";
import { mapPaymentStatus } from "@/lib/orders";
import { getAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Webhook de Mercado Pago (IPN / Webhooks).
 * MP notifica cambios de pago; consultamos el pago, registramos el cobro y
 * actualizamos el estado del pedido. Siempre respondemos 200 para que MP no
 * reintente indefinidamente.
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
      await admin.from("payments").insert({
        order_id: orderId,
        provider: "mercadopago",
        provider_payment_id: String(payment.id),
        status,
        amount_cents: Math.round((payment.transaction_amount ?? 0) * 100),
        raw: payment as unknown as Record<string, unknown>,
      });

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
