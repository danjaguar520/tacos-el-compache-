import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CartBadge } from "@/components/layout/CartBadge";
import { getBusiness } from "@/lib/business-context";

/** Encabezado superior. Logo + acceso rápido al carrito. */
export async function Header() {
  const business = await getBusiness();

  return (
    <header className="sticky top-0 z-40 border-b border-barro/15 bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Logo size="md" />

        <nav className="flex items-center gap-1">
          <Link
            href="/menu"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-frijol/80 hover:text-chile sm:inline-block"
          >
            {business.nav.catalogoLabel}
          </Link>
          <Link
            href="/nosotros"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-frijol/80 hover:text-chile sm:inline-block"
          >
            {business.nav.nosotrosLabel}
          </Link>
          <Link
            href="/carrito"
            aria-label="Ver carrito"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-maiz text-frijol hover:brightness-95"
          >
            <CartIcon />
            <CartBadge />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 4h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}
