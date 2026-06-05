"use client";

import Link from "next/link";
import { business } from "@/config/business";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { ButtonLink } from "@/components/ui/Button";

export default function CarritoPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotalCents());
  const clear = useCart((s) => s.clear);

  // Evita parpadeo de hidratación: el store se rehidrata de localStorage.
  const mounted = useHydrated();

  if (!mounted) return <div className="mx-auto max-w-3xl px-4 py-10" />;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <h1 className="font-display text-4xl font-bold text-chile">Tu carrito</h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </div>

          <button
            onClick={clear}
            className="mt-4 text-sm font-semibold text-frijol/50 hover:text-chile"
          >
            Vaciar carrito
          </button>

          <div className="mt-6 rounded-2xl bg-crema p-5 shadow-[var(--shadow-suave)] ring-1 ring-barro/15">
            <CartSummary subtotalCents={subtotal} />
            <ButtonLink href="/checkout" size="lg" className="mt-5 w-full">
              Ir a pagar
            </ButtonLink>
            <p className="mt-3 text-center text-xs text-frijol/45">
              El envío (si aplica) se calcula en el siguiente paso.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="mt-10 rounded-3xl bg-crema p-10 text-center shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/15">
      <div className="text-5xl">🛒</div>
      <p className="mt-4 font-display text-2xl font-bold text-frijol">
        Tu carrito está vacío
      </p>
      <p className="mt-1 text-sm text-frijol/60">
        {business.ui.carritoVacio}
      </p>
      <Link
        href="/menu"
        className="mt-6 inline-flex rounded-full bg-chile px-6 py-3 font-semibold text-crema hover:bg-chile-700"
      >
        Ver el menú
      </Link>
    </div>
  );
}
