import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chile";

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
} as const;

const variants: Record<Variant, string> = {
  primary: "bg-chile text-crema shadow-[var(--shadow-suave)] hover:bg-chile-700",
  secondary: "bg-maiz text-frijol hover:brightness-95",
  ghost: "bg-transparent text-chile hover:bg-chile/10",
  whatsapp: "bg-epazote text-crema hover:brightness-95",
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
