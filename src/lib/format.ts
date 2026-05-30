/** Utilidades de formato. Fuente única para precios en MXN. */

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Convierte centavos a texto de moneda. 3500 -> "$35". */
export function formatMXN(cents: number): string {
  return mxn.format(cents / 100);
}

/** Suma el subtotal (en centavos) de una lista de líneas del carrito. */
export function sumCents(
  items: { price_cents: number; quantity: number }[],
): number {
  return items.reduce((acc, i) => acc + i.price_cents * i.quantity, 0);
}
