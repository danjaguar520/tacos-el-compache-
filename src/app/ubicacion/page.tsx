import type { Metadata } from "next";
import {
  business,
  direccionCompleta,
  mapsEmbedUrl,
  comoLlegarUrl,
  whatsappUrl,
} from "@/config/business";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Ubicación",
  description: "Encuéntranos, conoce nuestro horario y pide por WhatsApp.",
};

export default function UbicacionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold text-chile">Visítanos</h1>
        <p className="mt-2 text-sm text-frijol/65">
          Te esperamos con la cazuela lista.
        </p>
      </header>

      {/* Mapa */}
      <div className="mt-6 overflow-hidden rounded-3xl shadow-[var(--shadow-suave)] ring-1 ring-barro/15">
        <iframe
          title="Mapa de ubicación"
          src={mapsEmbedUrl()}
          width="100%"
          height="280"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block w-full border-0"
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {/* Dirección */}
        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-frijol">
            📍 Dirección
          </h2>
          <p className="mt-2 text-frijol/75">{direccionCompleta()}</p>
          <ButtonLink
            href={comoLlegarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full"
          >
            Cómo llegar
          </ButtonLink>
        </div>

        {/* Horario */}
        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-frijol">
            🕒 Horario
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {business.horario.map((h) => (
              <li key={h.dias} className="flex justify-between">
                <span className="text-frijol/65">{h.dias}</span>
                <span className="font-semibold text-frijol">{h.horas}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contacto */}
      <div className="mt-4 rounded-2xl bg-white p-5 shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10">
        <h2 className="font-display text-xl font-bold text-frijol">Contáctanos</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href={whatsappUrl("¡Hola! Me gustaría hacer un pedido 🌮")}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            size="lg"
            className="flex-1"
          >
            WhatsApp
          </ButtonLink>
          <ButtonLink
            href={`tel:${business.telefono.replace(/\s/g, "")}`}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Llamar {business.telefono}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
