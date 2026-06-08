import type { GeneratedContent } from "@/lib/factory/ai/types";
import type { Categoria } from "@/lib/factory/types";

interface Props {
  content:    GeneratedContent;
  categorias: Categoria[];
}

/** Renders a close approximation of the Menu page using theme CSS variables. */
export function PreviewMenu({ content, categorias }: Props) {
  const firstCat = categorias[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100">
      {/* Header */}
      <div className="px-4 py-5 text-center border-b border-barro/10">
        <p className="text-xs font-semibold uppercase tracking-widest text-barro">{content.menuEtiqueta}</p>
        <h1 className="mt-1 text-2xl font-bold text-chile">Nuestro Menú</h1>
        <p className="mx-auto mt-1 max-w-sm text-xs text-frijol/60">{content.menuSubtitulo}</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto px-3 py-2">
        {categorias.map((c) => (
          <button key={c.slug}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              c === firstCat
                ? "bg-chile text-crema"
                : "bg-crema text-frijol ring-1 ring-barro/15"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {/* Products from first category */}
      <div className="space-y-2 px-3 pb-4">
        {(firstCat?.productos ?? []).slice(0, 4).map((p) => (
          <div key={p.nombre} className="flex items-center justify-between rounded-xl bg-crema p-3 shadow-sm ring-1 ring-barro/10">
            <div className="flex gap-3 items-center">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-barro to-chile grid place-items-center text-crema text-lg">
                {content.valores[0]?.emoji ?? "🍽️"}
              </div>
              <div>
                <p className="text-sm font-semibold text-frijol">{p.nombre}</p>
                <p className="text-xs text-frijol/50 line-clamp-1">
                  {p.descripcion || content.productDescriptions[p.nombre] || content.menuSubtitulo.slice(0, 40)}
                </p>
                <p className="mt-1 font-bold text-chile text-sm">${p.precio}</p>
              </div>
            </div>
            <button className="rounded-full bg-chile px-3 py-1.5 text-xs font-bold text-crema shadow">
              + Agregar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
