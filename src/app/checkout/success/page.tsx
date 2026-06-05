"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatMXN } from "@/lib/format";
import { business, whatsappUrl } from "@/config/business";

interface LastOrder {
  orderId: string;
  name: string;
  method: string;
  items: { productId: string; name: string; quantity: number; price_cents: number }[];
  subtotalCents: number;
  envioCents: number;
  totalCents: number;
}

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("order") ?? "";
  const clear = useCart((s) => s.clear);
  const hydrated = useHydrated();

  // Lee el resumen guardado una sola vez (sin setState en efecto).
  const [order] = useState<LastOrder | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(`${business.slug}-last-order`);
      return raw ? (JSON.parse(raw) as LastOrder) : null;
    } catch {
      return null;
    }
  });

  // Pedido confirmado: vacía el carrito.
  useEffect(() => {
    clear();
  }, [clear]);

  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-epazote text-crema">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="mt-5 font-display text-4xl font-bold text-chile">¡Pedido confirmado!</h1>
      <p className="mt-2 text-frijol/70">
        Gracias{hydrated && order?.name ? `, ${order.name}` : ""}. Ya estamos preparando tus {business.itemNombre}. 🌮
      </p>
      {shortId && (
        <p className="mt-2 text-sm text-frijol/50">
          Folio del pedido: <span className="font-bold text-frijol">#{shortId}</span>
        </p>
      )}

      {hydrated && order && (
        <div className="mt-6 rounded-2xl bg-white p-5 text-left shadow-[var(--shadow-suave)] ring-1 ring-barro/10">
          <p className="mb-3 font-display text-lg font-bold text-frijol">Resumen</p>
          <ul className="space-y-1.5 text-sm">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between text-frijol/75">
                <span>{i.quantity}× {i.name}</span>
                <span>{formatMXN(i.price_cents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-barro/15 pt-3">
            <span className="font-display text-lg font-bold text-frijol">Total</span>
            <span className="font-display text-lg font-bold text-chile">
              {formatMXN(order.totalCents)}
            </span>
          </div>
          <p className="mt-3 text-xs text-frijol/50">
            Entrega: {order.method === "domicilio" ? "A domicilio" : "Recoger en sucursal"}
          </p>
        </div>
      )}

      <div className="mt-7 flex flex-col gap-3">
        <a
          href={whatsappUrl(`Hola, acabo de hacer el pedido #${shortId}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-full bg-epazote px-6 py-3.5 font-semibold text-crema hover:brightness-95"
        >
          Confirmar por WhatsApp
        </a>
        <Link
          href="/menu"
          className="inline-flex w-full items-center justify-center rounded-full bg-maiz px-6 py-3.5 font-semibold text-frijol hover:brightness-95"
        >
          Volver al menú
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-center text-frijol/50">Cargando…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
