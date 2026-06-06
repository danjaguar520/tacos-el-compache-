import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { getBusiness } from "@/lib/business-context";

export const metadata: Metadata = {
  title: "Ubicación",
  description: "Encuéntranos, conoce nuestro horario y pide por WhatsApp.",
};

export default async function UbicacionPage() {
  const business = await getBusiness();

  // URL helpers derived from dynamic business data
  const addr      = `${business.direccion.calle}, ${business.direccion.colonia}, ${business.direccion.ciudad}, ${business.direccion.cp}`;
  const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&z=16&output=embed`;
  const mapsDir   = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
  const whatsapp  = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent("¡Hola! Me gustaría hacer un pedido 🌮")}`;
  const telHref   = `tel:${business.telefono.replace(/\s/g, "")}`;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold text-chile">Visítanos</h1>
        <p className="mt-2 text-sm text-frijol/65">
          {business.ui.ubicacionSub}
        </p>
      </header>

      {/* Mapa */}
      <div className="mt-6 overflow-hidden rounded-3xl shadow-[var(--shadow-suave)] ring-1 ring-barro/15">
        <iframe
          title="Mapa de ubicación"
          src={mapsEmbed}
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
          <p className="mt-2 text-frijol/75">{addr}</p>
          <ButtonLink
            href={mapsDir}
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
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            size="lg"
            className="flex-1"
          >
            WhatsApp
          </ButtonLink>
          <ButtonLink
            href={telHref}
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
