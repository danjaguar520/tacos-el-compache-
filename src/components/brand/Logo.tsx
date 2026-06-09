import Link from "next/link";
import Image from "next/image";
import { getBusinessContext } from "@/lib/business-context";

const sizes = {
  sm: { container: 26, text: "text-sm",              imgSize: 80  },
  md: { container: 34, text: "text-lg",              imgSize: 120 },
  lg: { container: 44, text: "text-2xl sm:text-3xl", imgSize: 160 },
} as const;

export async function Logo({
  size = "md",
  asLink = true,
}: {
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
}) {
  const { container, text, imgSize } = sizes[size];
  const { config: b, theme: t } = await getBusinessContext();

  const inner =
    t.logo.type === "image" ? (
      // Image logo — requires public/images/logo.png
      <span className="inline-flex items-center">
        <Image
          src="/images/logo.png"
          alt={b.nombre}
          width={imgSize}
          height={container}
          className="object-contain"
          style={{ height: container, width: "auto" }}
        />
      </span>
    ) : (
      // Text logo — built from business.logoLinea1 + logoLinea2
      <span className="inline-flex items-center gap-2">
        <span
          className="grid place-items-center rounded-full bg-naranja shadow-[var(--shadow-tarjeta)]"
          style={{ width: container, height: container }}
          aria-hidden
        >
          <span className="text-base leading-none">{b.emoji}</span>
        </span>
        <span className="leading-none">
          <span className={`font-display font-bold uppercase tracking-wide text-chile ${text}`}>
            {b.logoLinea1}
          </span>
          <span className="block text-[0.6em] font-semibold uppercase tracking-[0.18em] text-barro">
            {b.logoLinea2}
          </span>
        </span>
      </span>
    );

  if (!asLink) return inner;

  return (
    <Link href="/" aria-label={`Inicio — ${b.nombre}`}>
      {inner}
    </Link>
  );
}
