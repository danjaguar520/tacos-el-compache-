import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { business } from "@/config/business";

export const metadata: Metadata = {
  title: "¿Quiénes Somos?",
  description: business.nosotros.metaDescription,
};

export default function NosotrosPage() {
  const { nosotros } = business;

  return (
    <div>
      {/* Encabezado */}
      <section className="bg-frijol px-4 py-14 text-center text-crema">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-naranja">
          {nosotros.seccionLabel}
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl font-display text-5xl font-bold leading-tight">
          {nosotros.heroTitulo}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-crema/80">{business.descripcion}</p>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        {/* Relato */}
        <section className="mt-10 space-y-4 text-frijol/80">
          <p>
            <span className="font-display text-2xl font-bold text-chile">
              {business.nombre}
            </span>{" "}
            {nosotros.relato[0]}
          </p>
          {nosotros.relato.slice(1).map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
        </section>

        {/* Proceso */}
        <section className="mt-10">
          <h2 className="font-display text-3xl font-bold text-frijol">
            {nosotros.procesoTitulo}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {nosotros.proceso.map((p) => (
              <div
                key={p.titulo}
                className="rounded-2xl bg-white p-5 shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10"
              >
                <div className="text-3xl">{p.emoji}</div>
                <h3 className="mt-2 font-display text-xl font-bold text-chile">
                  {p.titulo}
                </h3>
                <p className="mt-1 text-sm text-frijol/70">{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Valores */}
        <section className="mt-10 rounded-3xl bg-maiz/50 p-7 ring-1 ring-barro/15">
          <h2 className="font-display text-2xl font-bold text-frijol">
            {nosotros.valoresTitulo}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {nosotros.valores.map(([titulo, descripcion]) => (
              <li key={titulo} className="flex gap-3">
                <span className="mt-1 text-chile">●</span>
                <span>
                  <span className="font-semibold text-frijol">{titulo}.</span>{" "}
                  <span className="text-frijol/70">{descripcion}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="my-12 text-center">
          <p className="font-display text-2xl font-bold text-frijol">
            {nosotros.ctaTitulo}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/menu" size="lg">
              Ver el menú
            </ButtonLink>
            <ButtonLink href="/ubicacion" variant="secondary" size="lg">
              Visítanos
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
