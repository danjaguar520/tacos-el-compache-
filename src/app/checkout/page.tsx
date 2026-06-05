"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";
import { formatMXN } from "@/lib/format";
import { business } from "@/config/business";
import type { DeliveryMethod } from "@/types";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotalCents());
  const mounted = useHydrated();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<DeliveryMethod>("recoger");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const envio = method === "domicilio" ? business.costoEnvioCents : 0;
  const canSubmit = useMemo(
    () => name.trim().length > 1 && phone.trim().length >= 7 && items.length > 0,
    [name, phone, items.length],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          notes: notes.trim(),
          delivery_method: method,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo procesar el pedido.");

      // Guardamos la última orden para mostrarla en la confirmación (modo demo).
      try {
        sessionStorage.setItem(
          `${business.slug}-last-order`,
          JSON.stringify({
            orderId: data.orderId,
            name: name.trim(),
            method,
            items,
            subtotalCents: subtotal,
            envioCents: envio,
            totalCents: subtotal + envio,
          }),
        );
      } catch {
        /* sessionStorage no disponible */
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
      setLoading(false);
    }
  }

  if (!mounted) return <div className="mx-auto max-w-3xl px-4 py-10" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-display text-2xl font-bold text-frijol">
          No hay nada que pagar
        </p>
        <Link
          href="/menu"
          className="mt-5 inline-flex rounded-full bg-chile px-6 py-3 font-semibold text-crema"
        >
          Ver el menú
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <Link href="/carrito" className="text-sm font-semibold text-frijol/60 hover:text-chile">
        ← Volver al carrito
      </Link>
      <h1 className="mt-2 font-display text-4xl font-bold text-chile">Finaliza tu pedido</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Datos */}
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10">
          <Field label="Nombre" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿A nombre de quién?"
              className={inputClass}
              required
            />
          </Field>
          <Field label="Teléfono" required>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10 dígitos"
              className={inputClass}
              required
            />
          </Field>
          <Field label="Notas del pedido">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. sin cebolla, salsa aparte, etc."
              rows={2}
              className={inputClass}
            />
          </Field>
        </div>

        {/* Método de entrega */}
        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10">
          <p className="mb-3 font-display text-lg font-bold text-frijol">¿Cómo lo quieres?</p>
          <div className="grid grid-cols-2 gap-3">
            <MethodOption
              active={method === "recoger"}
              onClick={() => setMethod("recoger")}
              emoji="🏪"
              title="Recoger"
              sub="En sucursal"
            />
            <MethodOption
              active={method === "domicilio"}
              onClick={() => setMethod("domicilio")}
              emoji="🛵"
              title="A domicilio"
              sub={`+ ${formatMXN(business.costoEnvioCents)}`}
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-suave)] ring-1 ring-barro/10">
          <p className="mb-3 font-display text-lg font-bold text-frijol">Resumen</p>
          <ul className="mb-3 space-y-1.5 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between text-frijol/75">
                <span>{i.quantity}× {i.name}</span>
                <span>{formatMXN(i.price_cents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <CartSummary subtotalCents={subtotal} envioCents={envio} />
        </div>

        {error && (
          <p className="rounded-xl bg-chile/10 px-4 py-3 text-sm font-medium text-chile">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={!canSubmit || loading}>
          {loading ? "Procesando…" : `Confirmar y pagar · ${formatMXN(subtotal + envio)}`}
        </Button>
        <p className="pb-10 text-center text-xs text-frijol/45">
          Pago seguro procesado por Mercado Pago.
        </p>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-barro/20 bg-crema/50 px-4 py-3 text-frijol outline-none placeholder:text-frijol/35 focus:border-chile focus:ring-2 focus:ring-chile/20";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-frijol">
        {label} {required && <span className="text-chile">*</span>}
      </span>
      {children}
    </label>
  );
}

function MethodOption({
  active,
  onClick,
  emoji,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 text-left transition ${
        active
          ? "border-chile bg-chile/5"
          : "border-barro/15 bg-crema/40 hover:border-barro/40"
      }`}
    >
      <div className="text-2xl">{emoji}</div>
      <p className="mt-1 font-bold text-frijol">{title}</p>
      <p className="text-xs text-frijol/55">{sub}</p>
    </button>
  );
}
