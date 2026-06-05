import Link from "next/link";
import { business } from "@/config/business";

export function Logo({
  size = "md",
  asLink = true,
}: {
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
}) {
  const scale =
    size === "lg"
      ? "text-2xl sm:text-3xl"
      : size === "sm"
        ? "text-sm"
        : "text-lg";

  const inner = (
    <span className="inline-flex items-center gap-2">
      <span
        className="grid place-items-center rounded-full bg-naranja shadow-[var(--shadow-tarjeta)]"
        style={{
          width: size === "lg" ? 44 : size === "sm" ? 26 : 34,
          height: size === "lg" ? 44 : size === "sm" ? 26 : 34,
        }}
        aria-hidden
      >
        <span className="text-base leading-none">{business.emoji}</span>
      </span>
      <span className="leading-none">
        <span
          className={`font-display font-bold uppercase tracking-wide text-chile ${scale}`}
        >
          {business.logoLinea1}
        </span>
        <span className="block text-[0.6em] font-semibold uppercase tracking-[0.18em] text-barro">
          {business.logoLinea2}
        </span>
      </span>
    </span>
  );

  if (!asLink) return inner;

  return (
    <Link href="/" aria-label={`Inicio — ${business.nombre}`}>
      {inner}
    </Link>
  );
}
