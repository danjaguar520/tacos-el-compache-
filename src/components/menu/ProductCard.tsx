import type { Product } from "@/types";
import { formatMXN } from "@/lib/format";
import { ProductImage } from "@/components/menu/ProductImage";
import { AddToCartButton } from "@/components/menu/AddToCartButton";

/** Tarjeta de producto del menú. */
export function ProductCard({ product }: { product: Product }) {
  const emoji = product.category_slug === "aguas-y-refrescos" ? "🥤" : "🌮";

  return (
    <article className="flex overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/10">
      <ProductImage
        src={product.image_url}
        alt={product.name}
        emoji={emoji}
        className="h-auto w-28 shrink-0 sm:w-32"
      />
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="font-display text-lg font-bold leading-tight text-frijol">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-frijol/65">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-xl font-bold text-chile">
            {formatMXN(product.price_cents)}
          </span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
