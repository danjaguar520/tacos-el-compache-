"use client";

/** Control de cantidad +/- con botones grandes para móvil. */
export function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  label = "Cantidad",
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  label?: string;
}) {
  return (
    <div
      className="inline-flex items-center rounded-full bg-maiz/60 ring-1 ring-barro/15"
      role="group"
      aria-label={label}
    >
      <button
        onClick={onDecrement}
        aria-label="Quitar uno"
        className="grid h-9 w-9 place-items-center rounded-full text-lg font-bold text-chile active:scale-90"
      >
        −
      </button>
      <span className="w-7 text-center text-sm font-bold tabular-nums text-frijol">
        {value}
      </span>
      <button
        onClick={onIncrement}
        aria-label="Agregar uno"
        className="grid h-9 w-9 place-items-center rounded-full text-lg font-bold text-chile active:scale-90"
      >
        +
      </button>
    </div>
  );
}
