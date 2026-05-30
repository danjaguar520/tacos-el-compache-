import type { Metadata } from "next";
import { fetchMenu } from "@/lib/menu";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { ProductCard } from "@/components/menu/ProductCard";

export const metadata: Metadata = {
  title: "Menú",
  description: "Tacos de guisos preparados a diario y aguas frescas naturales.",
};

export default async function MenuPage() {
  const { categories, products, source } = await fetchMenu();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <header className="text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-barro">
          Hoy +10 guisos distintos
        </p>
        <h1 className="font-display text-4xl font-bold text-chile">Nuestro Menú</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-frijol/65">
          Hechos a fuego lento en cazuela de barro. Elige tus favoritos y agrégalos al carrito.
        </p>
      </header>

      <CategoryTabs categories={categories} />

      <div className="space-y-10 pb-12">
        {categories.map((category) => {
          const items = products.filter((p) => p.category_slug === category.slug);
          if (items.length === 0) return null;
          return (
            <section key={category.id} id={`cat-${category.slug}`} className="scroll-mt-28">
              <h2 className="mb-3 font-display text-2xl font-bold text-frijol">
                {category.name}
              </h2>
              <div className="grid gap-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {source === "static" && (
        <p className="mb-10 text-center text-xs text-frijol/40">
          Mostrando menú de demostración. Configura Supabase para administrarlo en vivo.
        </p>
      )}
    </div>
  );
}
