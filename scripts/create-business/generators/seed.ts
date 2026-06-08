import type { BusinessInput } from "../types.js";

/** Escape a value for use inside a SQL single-quoted string. */
function sql(s: string): string {
  return s.replace(/'/g, "''");
}

export function generateSeedSql(input: BusinessInput): string {
  if (input.categorias.length === 0) {
    return `-- ${input.nombre} — Sin categorías definidas\n-- Agrega productos manualmente desde el panel de administración.\n`;
  }

  const lines: string[] = [];

  lines.push(`-- ============================================================`);
  lines.push(`-- ${input.nombre} — Catálogo inicial`);
  lines.push(`-- Generado por Lok'al Business Factory v1`);
  lines.push(`-- Fecha: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`-- `);
  lines.push(`-- Instrucciones:`);
  lines.push(`--   1. En Supabase SQL Editor, corre primero supabase/migrations/0001_init.sql`);
  lines.push(`--   2. Luego corre este archivo`);
  lines.push(`-- ============================================================`);
  lines.push(``);

  // ── Categories ──────────────────────────────────────────────────
  lines.push(`-- Categorías`);
  lines.push(`INSERT INTO public.categories (name, slug, sort_order) VALUES`);

  const catRows = input.categorias.map((cat, i) => {
    const comma = i < input.categorias.length - 1 ? "," : "";
    return `  ('${sql(cat.nombre)}', '${sql(cat.slug)}', ${i + 1})${comma}`;
  });

  lines.push(...catRows);
  lines.push(`ON CONFLICT (slug) DO UPDATE SET`);
  lines.push(`  name = EXCLUDED.name;`);
  lines.push(``);

  // ── Products per category ────────────────────────────────────────
  for (const cat of input.categorias) {
    if (cat.productos.length === 0) continue;

    lines.push(`-- Productos: ${cat.nombre}`);
    lines.push(`INSERT INTO public.products`);
    lines.push(`  (category_id, name, description, price_cents, sort_order, available)`);
    lines.push(`SELECT`);
    lines.push(`  cat.id,`);
    lines.push(`  prod.name,`);
    lines.push(`  prod.description,`);
    lines.push(`  prod.price_cents,`);
    lines.push(`  prod.sort_order,`);
    lines.push(`  true`);
    lines.push(`FROM (`);
    lines.push(`  VALUES`);

    const prodRows = cat.productos.map((p, i) => {
      const desc  = sql(p.descripcion || "");
      const name  = sql(p.nombre);
      const cents = Math.round(p.precio * 100);
      const comma = i < cat.productos.length - 1 ? "," : "";
      return `    ('${name}', '${desc}', ${cents}, ${i + 1})${comma}`;
    });

    lines.push(...prodRows);
    lines.push(`  ) AS prod(name, description, price_cents, sort_order)`);
    lines.push(`  CROSS JOIN (`);
    lines.push(`    SELECT id FROM public.categories WHERE slug = '${sql(cat.slug)}'`);
    lines.push(`  ) AS cat`);
    lines.push(`WHERE NOT EXISTS (`);
    lines.push(`  SELECT 1 FROM public.products p`);
    lines.push(`  JOIN public.categories c ON p.category_id = c.id`);
    lines.push(`  WHERE p.name = prod.name AND c.slug = '${sql(cat.slug)}'`);
    lines.push(`);`);
    lines.push(``);
  }

  // ── Summary comment ──────────────────────────────────────────────
  const totalProducts = input.categorias.reduce((n, c) => n + c.productos.length, 0);
  lines.push(`-- Resumen: ${input.categorias.length} categorías, ${totalProducts} productos.`);

  return lines.join("\n");
}
