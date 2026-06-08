import type { GeneratedContent } from "@/lib/factory/ai/types";
import type { Categoria } from "@/lib/factory/types";

interface Props {
  nombre:    string;
  emoji:     string;
  lema:      string;
  content:   GeneratedContent;
  bannerUrl: string | null;
  categorias: Categoria[];
}

/** Renders a close approximation of the Home page using theme CSS variables. */
export function PreviewHome({ nombre, emoji, lema, content, bannerUrl, categorias }: Props) {
  const featured = categorias.flatMap((c) => c.productos).slice(0, 3);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100">
      {/* Hero */}
      <div className="relative bg-frijol" style={{ minHeight: 180 }}>
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt="Banner" className="w-full object-cover" style={{ height: 180 }} />
        ) : (
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[var(--color-frijol)] to-[var(--color-chile)]">
            <div className="text-center text-crema">
              <div className="text-4xl">{emoji}</div>
              <p className="mt-2 text-lg font-bold">{nombre}</p>
              <p className="text-sm opacity-70">{lema}</p>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-3 hidden justify-center gap-2 sm:flex">
          <button className="rounded-full bg-chile px-4 py-2 text-xs font-bold text-crema shadow">Ver menú</button>
          <button className="rounded-full bg-maiz px-4 py-2 text-xs font-bold text-frijol shadow">¿Cómo llegar?</button>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {content.valores.map((v) => (
          <div key={v.titulo} className="rounded-xl bg-crema p-3 text-center shadow-sm ring-1 ring-barro/10">
            <div className="text-xl">{v.emoji}</div>
            <p className="mt-1 text-xs font-bold text-chile">{v.titulo}</p>
            <p className="text-[10px] text-frijol/60">{v.sub}</p>
          </div>
        ))}
      </div>

      {/* Featured products */}
      {featured.length > 0 && (
        <div className="px-3 pb-3">
          <p className="mb-2 text-sm font-bold text-frijol">Los favoritos</p>
          <div className="space-y-2">
            {featured.map((p) => (
              <div key={p.nombre} className="flex items-center justify-between rounded-xl bg-crema p-3 shadow-sm ring-1 ring-barro/10">
                <div>
                  <p className="text-sm font-semibold text-frijol">{p.nombre}</p>
                  <p className="text-xs text-frijol/50 line-clamp-1">{p.descripcion || content.productDescriptions[p.nombre] || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-chile">${p.precio}</span>
                  <button className="rounded-full bg-chile px-3 py-1 text-xs font-bold text-crema">Agregar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="m-3 rounded-2xl bg-chile p-5 text-center text-crema">
        <p className="font-bold">{content.ctaHome.titulo}</p>
        <p className="mt-1 text-xs opacity-80 line-clamp-2">{content.ctaHome.texto}</p>
        <button className="mt-3 rounded-full bg-maiz px-5 py-2 text-xs font-bold text-frijol">{content.ctaHome.boton}</button>
      </div>
    </div>
  );
}
