import "server-only";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

/**
 * Integración con Mercado Pago Checkout Pro.
 * Toda la lógica de pagos vive aquí; el resto de la app no sabe si está
 * en modo real o simulado.
 *
 * Si MP_ACCESS_TOKEN no está configurado → MODO SIMULADO:
 *   el pedido se marca como pagado y se redirige directo a /checkout/success.
 */

const accessToken = process.env.MP_ACCESS_TOKEN;

export function isMercadoPagoConfigured(): boolean {
  return Boolean(accessToken && !accessToken.startsWith("__"));
}

function client(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: accessToken! });
}

export interface PreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number; // en pesos (no centavos)
  currency_id: "MXN";
}

/**
 * Crea una preferencia de pago y devuelve el id y la URL de redirección.
 */
export async function createPreference(params: {
  orderId: string;
  items: PreferenceItem[];
  shippingCost: number; // pesos
  payer: { name: string; phone: string };
  baseUrl: string;
}): Promise<{ preferenceId: string; initPoint: string }> {
  const pref = new Preference(client());

  // Mercado Pago rechaza `auto_return` y `notification_url` con URLs de
  // localhost. En local los omitimos (el usuario regresa con un botón); en
  // producción (dominio público) se activan automáticamente.
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(
    params.baseUrl,
  );

  const result = await pref.create({
    body: {
      items: params.items,
      shipments:
        params.shippingCost > 0
          ? { cost: params.shippingCost, mode: "not_specified" }
          : undefined,
      payer: { name: params.payer.name },
      external_reference: params.orderId,
      back_urls: {
        success: `${params.baseUrl}/checkout/success?order=${params.orderId}`,
        pending: `${params.baseUrl}/checkout/pending?order=${params.orderId}`,
        failure: `${params.baseUrl}/checkout/failure?order=${params.orderId}`,
      },
      ...(isLocal
        ? {}
        : {
            auto_return: "approved",
            notification_url: `${params.baseUrl}/api/webhooks/mercadopago`,
          }),
      statement_descriptor: "EL COMPACHE",
    },
  });

  const initPoint = result.init_point ?? result.sandbox_init_point;
  if (!result.id || !initPoint) {
    throw new Error("Mercado Pago no devolvió una preferencia válida");
  }
  return { preferenceId: String(result.id), initPoint };
}

/** Consulta el detalle de un pago por id (usado en el webhook). */
export async function getPayment(paymentId: string) {
  const payment = new Payment(client());
  return payment.get({ id: paymentId });
}
