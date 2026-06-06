"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";
import { sumCents } from "@/lib/format";

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

/**
 * Derives the tenant slug from the current hostname at runtime.
 * Multi-tenant: nakamura.lok-al.mx → "nakamura"
 * Single-tenant / dev: localhost, compache.lok-al.mx → "compache"
 *
 * Falls back to "compache" for SSR (window is undefined) and for
 * any hostname that doesn't match the multi-tenant pattern.
 */
function resolveCartSlug(): string {
  if (typeof window === "undefined") return "compache";
  const host = window.location.hostname;
  const LOKAL_DOMAIN = process.env.NEXT_PUBLIC_LOKAL_DOMAIN ?? "lok-al.mx";
  if (host.endsWith(`.${LOKAL_DOMAIN}`)) {
    const sub = host.slice(0, host.length - LOKAL_DOMAIN.length - 1);
    if (sub && /^[a-z0-9][a-z0-9-]{0,29}$/.test(sub)) return sub;
  }
  // Per-business deploy or dev fallback.
  return process.env.NEXT_PUBLIC_BUSINESS_SLUG ?? "compache";
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
      // Key is derived at runtime from the hostname so each tenant has its own
      // localStorage bucket. Falls back to "compache-cart" in dev / SSR.
      name: `${resolveCartSlug()}-cart`,
    },
  ),
);

function qtyOf(items: CartItem[], productId: string): number {
  return items.find((i) => i.productId === productId)?.quantity ?? 0;
}
