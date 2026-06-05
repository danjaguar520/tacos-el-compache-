"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { business } from "@/config/business";

/** Barra de navegación inferior fija (mobile-first). */
export function BottomNav() {
  const pathname = usePathname();
  const count = useCart((s) => s.count());
  const mounted = useHydrated();

  // Oculta la barra en el flujo de pago para máxima concentración.
  if (pathname.startsWith("/checkout")) return null;

  const items = [
    { href: "/", label: "Inicio", icon: HomeIcon },
    { href: "/menu", label: business.nav.catalogoLabel, icon: MenuIcon },
    { href: "/carrito", label: "Carrito", icon: CartIcon, badge: mounted ? count : 0 },
    { href: "/ubicacion", label: "Ubicación", icon: PinIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-barro/15 bg-crema/95 backdrop-blur sm:hidden">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-semibold ${
                  active ? "text-chile" : "text-frijol/55"
                }`}
              >
                <span className="relative">
                  <Icon active={active} />
                  {badge ? (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-chile px-1 text-[0.6rem] font-bold text-crema">
                      {badge}
                    </span>
                  ) : null}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div style={{ height: "env(safe-area-inset-bottom)" }} />
    </nav>
  );
}

type IconProps = { active?: boolean };
const stroke = (active?: boolean) => (active ? 2.1 : 1.7);

function HomeIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 11l8-7 8 7M6 10v9h12v-9" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MenuIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" />
    </svg>
  );
}
function CartIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 4h12" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.3" fill="currentColor" />
      <circle cx="17" cy="20" r="1.3" fill="currentColor" />
    </svg>
  );
}
function PinIcon({ active }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" stroke="currentColor" strokeWidth={stroke(active)} strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth={stroke(active)} />
    </svg>
  );
}
