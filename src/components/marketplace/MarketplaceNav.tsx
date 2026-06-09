import Link from "next/link";

export function MarketplaceNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-barro/15 bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-frijol">Lok&apos;al</span>
          <span className="hidden text-xs text-frijol/50 sm:inline">negocios locales</span>
        </div>
        <Link
          href="/factory"
          className="inline-flex items-center rounded-full bg-chile px-4 py-2 text-sm font-semibold text-crema transition-[background-color,transform] duration-150 hover:bg-chile-700 hover:-translate-y-px active:translate-y-px"
        >
          Publicar mi negocio →
        </Link>
      </div>
    </header>
  );
}
