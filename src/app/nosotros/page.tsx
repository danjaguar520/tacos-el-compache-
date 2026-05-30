import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { business } from "@/config/business";

export const metadata: Metadata = {
  title: "¿Quiénes Somos?",
  description:
    "La historia de Tacos El Compache de Ah Mun: tradición familiar, guisos a fuego lento y el sabor de casa.",
};

const proceso = [
  {
    emoji: "🌅",
    titulo: "Antes del amanecer",
    texto:
      "Encendemos la lumbre y empezamos a guisar. Cada cazuela lleva su tiempo, sin prisas.",
  },
  {
    emoji: "🍲",
    titulo: "Más de 10 guisos",
    texto:
      "Birria, mole, tinga, chicharrón en salsa verde, rajas… recetas que pasaron de generación en generación.",
  },
  {
    emoji: "🫓",
    titulo: "Al momento",
    texto:
      "Calentamos la tortilla y servimos el taco recién hecho, como debe ser, con su salsa y limón.",
  },
];

export default function NosotrosPage() {
  return (
    <div>
      {/* Encabezado */}
      <section className="bg-frijol px-4 py-14 text-center text-crema">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-naranja">
          Nuestra historia
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl font-display text-5xl font-bold leading-tight">
          Cocinamos con amor, como en casa
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-crema/80">{business.descripcion}</p>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        {/* Relato */}
        <section className="prose-taqueria mt-10 space-y-4 text-frijol/80">
          <p>
            <span className="font-display text-2xl font-bold text-chile">
              {business.nombre}
            </span>{" "}
            nació de una idea sencilla: que cualquiera pudiera sentarse a comer
            unos tacos de guiso como los que se preparan en una cocina mexicana
            de verdad. Sin atajos, sin polvos, sin prisa.
          </p>
          <p>
            Todo se cocina a fuego lento en cazuelas de barro. Es la forma en que
            lo hacían nuestras abuelas y es la única manera de lograr ese sabor
            profundo, hogareño, que reconforta. Por eso cada día preparamos{" "}
            <strong className="text-frijol">+10 guisos distintos</strong>, frescos
            y hechos al momento.
          </p>
        </section>

        {/* Proceso */}
        <section className="mt-10">
          <h2 className="font-display text-3xl font-bold text-frijol">
            Así preparamos tus tacos
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {proceso.map((p) => (
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
            Lo que nos mueve
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Tradición", "Recetas de familia que respetamos al pie de la letra."],
              ["Frescura", "Guisado del día, nunca de ayer."],
              ["Cercanía", "Un trato cálido, como recibir visita en casa."],
              ["Autenticidad", "Sabor mexicano honesto, sin pretensiones."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1 text-chile">●</span>
                <span>
                  <span className="font-semibold text-frijol">{t}.</span>{" "}
                  <span className="text-frijol/70">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="my-12 text-center">
          <p className="font-display text-2xl font-bold text-frijol">
            ¿Listo para probarlos?
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
