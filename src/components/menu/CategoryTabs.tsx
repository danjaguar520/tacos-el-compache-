"use client";

import type { Category } from "@/types";

/** Pestañas de categoría: scroll horizontal con anclas a cada sección. */
export function CategoryTabs({ categories }: { categories: Category[] }) {
  function scrollTo(slug: string) {
    document.getElementById(`cat-${slug}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="no-scrollbar sticky top-[57px] z-30 -mx-4 flex gap-2 overflow-x-auto bg-crema/95 px-4 py-3 backdrop-blur">
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => scrollTo(c.slug)}
          className="whitespace-nowrap rounded-full bg-crema px-4 py-2 text-sm font-semibold text-frijol shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/15 transition-[transform,box-shadow,background-color] duration-150 hover:bg-maiz hover:-translate-y-px hover:shadow-[var(--shadow-tarjeta-hover)] active:translate-y-px"
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
