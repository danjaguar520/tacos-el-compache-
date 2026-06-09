import Link from "next/link";

export function MarketplaceFooter() {
  return (
    <footer className="mt-16 bg-textura-oscura text-crema/90">
      <div className="bg-naranja/80 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-crema">
        Lok&apos;al — La plataforma de negocios locales
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-maiz">Lok&apos;al</p>
          <p className="mt-2 text-sm text-crema/70">
            Conectamos negocios locales con los clientes de su ciudad.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-maiz">Para negocios</p>
          <ul className="mt-2 space-y-1.5">
            <li>
              <Link href="/factory" className="text-crema/70 hover:text-maiz">
                Publicar mi negocio
              </Link>
            </li>
            <li>
              <Link href="/negocios" className="text-crema/70 hover:text-maiz">
                Ver el marketplace
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-maiz">Plataforma</p>
          <ul className="mt-2 space-y-1.5">
            <li><span className="text-crema/40">Términos (próximamente)</span></li>
            <li><span className="text-crema/40">Soporte (próximamente)</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-crema/10 py-4 text-center text-xs text-crema/50">
        © {new Date().getFullYear()} Lok&apos;al. Todos los derechos reservados.
      </div>
    </footer>
  );
}
