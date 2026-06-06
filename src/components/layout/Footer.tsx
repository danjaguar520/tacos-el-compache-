import Link from "next/link";
import { getBusiness } from "@/lib/business-context";

/** Pie de página cálido con franja de marca. */
export async function Footer() {
  const business = await getBusiness();

  return (
    <footer className="mt-16 bg-textura-oscura text-crema/90">
      <div className="bg-chile py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-crema">
        {business.footerSlogan}
      </div>

      <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-maiz">
            {business.nombre}
          </p>
          <p className="mt-2 text-sm text-crema/70">{business.lema}</p>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-maiz">Visítanos</p>
          <p className="mt-2 text-crema/70">{business.direccion.calle}</p>
          <p className="text-crema/70">
            {business.direccion.colonia}, {business.direccion.ciudad}
          </p>
          <p className="mt-2 text-crema/70">{business.telefono}</p>
        </div>

        <nav className="text-sm">
          <p className="font-semibold text-maiz">Explora</p>
          <ul className="mt-2 space-y-1.5">
            <li><Link href="/menu" className="text-crema/70 hover:text-maiz">{business.nav.catalogoLabel}</Link></li>
            <li><Link href="/nosotros" className="text-crema/70 hover:text-maiz">{business.nav.nosotrosLabel}</Link></li>
            <li><Link href="/ubicacion" className="text-crema/70 hover:text-maiz">Ubicación</Link></li>
            <li><Link href="/carrito" className="text-crema/70 hover:text-maiz">Carrito</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-crema/10 py-4 text-center text-xs text-crema/50">
        © {new Date().getFullYear()} {business.nombre}. Gracias por apoyar lo local y lo auténtico.
      </div>
    </footer>
  );
}
