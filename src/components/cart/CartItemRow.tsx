"use client";

import type { CartItem } from "@/types";
import { formatMXN } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { ProductImage } from "@/components/menu/ProductImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

/** Línea de un producto dentro del carrito. */
export function CartItemRow({ item }: { item: CartItem }) {
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);

  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10">
      <ProductImage
        src={item.image_url}
        alt={item.name}
        className="h-16 w-16 shrink-0 rounded-xl"
      />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight text-frijol">
            {item.name}
          </h3>
          <button
            onClick={() => remove(item.productId)}
            aria-label={`Eliminar ${item.name}`}
            className="text-frijol/40 hover:text-chile"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-frijol/55">{formatMXN(item.price_cents)} c/u</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantityStepper
            value={item.quantity}
            onIncrement={() => increment(item.productId)}
            onDecrement={() => decrement(item.productId)}
          />
          <span className="font-display text-lg font-bold text-chile">
            {formatMXN(item.price_cents * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
