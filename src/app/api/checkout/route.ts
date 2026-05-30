import { NextResponse } from "next/server";
import type { CheckoutPayload } from "@/types";
import { createOrder } from "@/lib/orders";

export const runtime = "nodejs";

/** Origen absoluto de la petición, para construir las URLs de retorno. */
function getBaseUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  let body: CheckoutPayload;
  try {
    body = (await req.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  // Validación mínima.
  if (!body.customer_name?.trim() || !body.customer_phone?.trim()) {
    return NextResponse.json(
      { error: "Nombre y teléfono son obligatorios." },
      { status: 400 },
    );
  }
  if (body.delivery_method !== "recoger" && body.delivery_method !== "domicilio") {
    return NextResponse.json({ error: "Método de entrega inválido." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }

  try {
    const result = await createOrder(body, getBaseUrl(req));
    return NextResponse.json(result);
  } catch (err) {
    console.error("[checkout] error:", err);
    const message = err instanceof Error ? err.message : "Error al procesar el pedido.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
