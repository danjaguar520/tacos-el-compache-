"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";
import { sumCents } from "@/lib/format";
import { business } from "@/config/business";

interface CartState {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  /** Cantidad total de piezas (para el badge). */
  count: () => number;
  /** Subtotal en centavos. */
  subtotalCents: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price_cents: product.price_cents,
                image_url: product.image_url,
                quantity: qty,
              },
            ],
          };
        }),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: qty } : i,
                ),
        })),

      increment: (productId) => get().setQty(productId, qtyOf(get().items, productId) + 1),
      decrement: (productId) => get().setQty(productId, qtyOf(get().items, productId) - 1),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotalCents: () => sumCents(get().items),
    }),
    {
      name: `${business.slug}-cart`,
    },
  ),
);

function qtyOf(items: CartItem[], productId: string): number {
  return items.find((i) => i.productId === productId)?.quantity ?? 0;
}
