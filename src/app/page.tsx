import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/menu/ProductCard";
import { fetchMenu } from "@/lib/menu";

const valores = [
  { emoji: "🍲", titulo: "+10 guisos", sub: "distintos cada día" },
  { emoji: "🔥", titulo: "Fuego lento", sub: "en cazuela de barro" },
  { emoji: "❤️", titulo: "Recetas", sub: "de familia" },
  { emoji: "🌮", titulo: "Al momento", sub: "tacos recién hechos" },
];

export default async function Home() {
  const { products } = await fetchMenu();
  const destacados = products
    .filter((p) => p.category_slug === "tacos-de-guisos")
    .slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-frijol">
        <div className="relative w-full">
          <Image
            src="/images/banner-hero.png"
            alt="Tacos El Compache de Ah Mun — Los mejores tacos de guisos en Playa del Carmen"
            width={2048}
            height={768}
            priority
            className="h-[56vw] max-h-[520px] min-h-[220px] w-full object-cover object-center"
          />
          {/* Desktop: overlay sobre el banner */}
          <div className="absolute inset-x-0 bottom-6 hidden justify-center gap-3 drop-shadow-lg sm:flex">
            <ButtonLink href="/menu" size="lg">Ver menú</ButtonLink>
            <ButtonLink href="/ubicacion" variant="secondary" size="lg">¿Cómo llegar?</ButtonLink>
          </div>
        </div>
        {/* Mobile: debajo del banner */}
        <div className="flex flex-wrap justify-center gap-3 px-4 py-5 sm:hidden">
          <ButtonLink href="/menu" size="lg">Ver menú</ButtonLink>
          <ButtonLink href="/ubicacion" variant="secondary" size="lg">¿Cómo llegar?</ButtonLink>
        </div>
      </section>

      {/* Propuesta de valor */}
      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {valores.map((v) => (
            <div
              key={v.titulo}
              className="rounded-2xl bg-crema p-4 text-center shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/15 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-tarjeta-hover)]"
            >
              <div className="text-2xl">{v.emoji}</div>
              <p className="mt-1.5 font-display text-base font-bold text-chile">{v.titulo}</p>
              <p className="text-xs text-frijol/60">{v.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-3xl px-4 pb-4">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold text-frijol">Los favoritos</h2>
          <ButtonLink href="/menu" variant="ghost">
            Ver todo →
          </ButtonLink>
        </div>
        <div className="grid gap-3">
          {destacados.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA tradición */}
      <section className="mx-auto mt-6 max-w-3xl px-4">
        <div className="rounded-3xl bg-chile px-6 py-10 text-center text-crema shadow-[var(--shadow-suave)]">
          <h2 className="font-display text-3xl font-bold">Tradición en cada taco</h2>
          <p className="mx-auto mt-2 max-w-md text-crema/85">
            Cocinamos como en casa, con recetas de familia y los guisos que reconforten el alma.
          </p>
          <div className="mt-6">
            <ButtonLink href="/nosotros" variant="secondary" size="lg">
              Conoce nuestra historia
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
