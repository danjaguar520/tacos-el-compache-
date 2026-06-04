import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,box-shadow,background-color] duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chile";

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
} as const;

const variants: Record<Variant, string> = {
  primary:
    "bg-chile text-crema shadow-[var(--shadow-btn-chile)] hover:bg-chile-700 hover:-translate-y-px hover:shadow-[var(--shadow-btn-chile-hover)] active:translate-y-px active:shadow-[var(--shadow-btn-chile-active)]",
  secondary:
    "bg-maiz text-frijol shadow-[var(--shadow-btn-maiz)] hover:brightness-95 hover:-translate-y-px hover:shadow-[var(--shadow-btn-maiz-hover)] active:translate-y-px active:shadow-[var(--shadow-btn-maiz-active)]",
  ghost: "bg-transparent text-chile hover:bg-chile/10 hover:-translate-y-px active:translate-y-px",
  whatsapp:
    "bg-epazote text-crema shadow-[0_4px_0_0_#3d5c2e,0_6px_16px_-4px_rgb(90_122_69_/_0.35)] hover:brightness-95 hover:-translate-y-px active:translate-y-px active:shadow-none",
};

function classes(variant: Variant, size: keyof typeof sizes, extra?: string) {
  return `${base} ${sizes[size]} ${variants[variant]} ${extra ?? ""}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: {
  variant?: Variant;
  size?: keyof typeof sizes;
  children: ReactNode;
} & ComponentProps<"button">) {
  return (
    <button className={classes(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: {
  variant?: Variant;
  size?: keyof typeof sizes;
  children: ReactNode;
} & ComponentProps<typeof Link>) {
  return (
    <Link className={classes(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
