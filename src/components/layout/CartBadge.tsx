"use client";

import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Conteo de piezas en el carrito. Usa `useHydrated` para mostrar el valor solo
 * tras la hidratación (el store se rehidrata de localStorage) y evitar desajustes.
 */
export function CartBadge() {
  const count = useCart((s) => s.count());
  const hydrated = useHydrated();

  if (!hydrated || count === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-chile px-1 text-[0.7rem] font-bold text-crema">
      {count}
    </span>
  );
}
