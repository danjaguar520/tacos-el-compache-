"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart-store";

/** Botón "Agregar" con micro-confirmación visual. */
export function AddToCartButton({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  }

  return (
    <button
      onClick={handleAdd}
      aria-label={`Agregar ${product.name} al carrito`}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${
        added ? "bg-epazote text-crema" : "bg-chile text-crema hover:bg-chile-700"
      }`}
    >
      {added ? (
        <>
          <CheckIcon /> Agregado
        </>
      ) : (
        <>
          <PlusIcon /> Agregar
        </>
      )}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
