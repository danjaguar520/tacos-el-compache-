import type { GeneratedContent } from "@/lib/factory/ai/types";

interface Props {
  nombre:  string;
  content: GeneratedContent;
}

/** Renders a close approximation of the Nosotros page using theme CSS variables. */
export function PreviewNosotros({ nombre, content }: Props) {
  const nos = content.nosotros;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100">
      {/* Hero dark */}
      <div className="bg-frijol px-5 py-8 text-center text-crema">
        <p className="text-xs font-semibold uppercase tracking-widest text-naranja">{nos.seccionLabel}</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">{nos.heroTitulo}</h1>
        <p className="mx-auto mt-2 max-w-sm text-xs opacity-75">{content.descripcion}</p>
      </div>

      <div className="p-4 space-y-5">
        {/* Relato */}
        <div className="space-y-3 text-sm text-frijol/80">
          <p><strong className="font-bold text-chile">{nombre}</strong> {nos.relato[0]}</p>
          <p>{nos.relato[1]}</p>
        </div>

        {/* Proceso */}
        <div>
          <h2 className="text-base font-bold text-frijol mb-3">{nos.procesoTitulo}</h2>
          <div className="grid grid-cols-3 gap-2">
            {nos.proceso.map((p) => (
              <div key={p.titulo} className="rounded-xl bg-crema p-3 shadow-sm ring-1 ring-barro/10">
                <div className="text-2xl">{p.emoji}</div>
                <p className="mt-1.5 text-xs font-bold text-chile">{p.titulo}</p>
                <p className="mt-1 text-[10px] text-frijol/70 line-clamp-3">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Valores */}
        <div className="rounded-2xl bg-maiz/40 p-4">
          <h2 className="text-sm font-bold text-frijol mb-2">{nos.valoresTitulo}</h2>
          <ul className="space-y-2">
            {nos.valores.map(([titulo, desc]) => (
              <li key={titulo} className="flex gap-2 text-xs">
                <span className="mt-0.5 text-chile">●</span>
                <span><strong className="text-frijol">{titulo}.</strong>{" "}<span className="text-frijol/70">{desc}</span></span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="font-bold text-frijol">{nos.ctaTitulo}</p>
          <div className="mt-3 flex justify-center gap-2">
            <button className="rounded-full bg-chile px-4 py-2 text-xs font-bold text-crema">Ver el menú</button>
            <button className="rounded-full bg-maiz px-4 py-2 text-xs font-bold text-frijol">Visítanos</button>
          </div>
        </div>
      </div>
    </div>
  );
}
