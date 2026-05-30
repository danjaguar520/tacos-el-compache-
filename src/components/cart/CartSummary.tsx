import { formatMXN } from "@/lib/format";

/** Resumen de montos reutilizable (carrito y checkout). */
export function CartSummary({
  subtotalCents,
  envioCents = 0,
}: {
  subtotalCents: number;
  envioCents?: number;
}) {
  const total = subtotalCents + envioCents;
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-frijol/65">Subtotal</dt>
        <dd className="font-semibold text-frijol">{formatMXN(subtotalCents)}</dd>
      </div>
      {envioCents > 0 && (
        <div className="flex justify-between">
          <dt className="text-frijol/65">Envío a domicilio</dt>
          <dd className="font-semibold text-frijol">{formatMXN(envioCents)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-barro/15 pt-2">
        <dt className="font-display text-lg font-bold text-frijol">Total</dt>
        <dd className="font-display text-lg font-bold text-chile">{formatMXN(total)}</dd>
      </div>
    </dl>
  );
}
