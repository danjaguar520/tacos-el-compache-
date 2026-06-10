import { isFactoryConfigured, isFactoryAuthenticated } from "@/lib/factory-auth";
import { getAdminClient } from "@/lib/supabase/server";
import { draftToDbConfig } from "@/lib/factory/normalizer";
import type { FactoryDraft } from "@/lib/factory/json-types";
import type { Categoria, Producto } from "@/lib/factory/types";

// ── Validation helpers ────────────────────────────────────────────────────────

function validateCategorias(categorias: Categoria[]): string | null {
  for (let ci = 0; ci < categorias.length; ci++) {
    const cat = categorias[ci]!;
    if (!cat.nombre?.trim()) {
      return `categorias[${ci}].nombre is required`;
    }
    if (!cat.slug?.trim()) {
      return `categorias[${ci}].slug is required`;
    }
    if (!cat.productos || cat.productos.length === 0) {
      return `categorias[${ci}] ("${cat.slug}") must have at least one product`;
    }
    const productError = validateProductos(cat.productos, ci);
    if (productError) return productError;
  }
  return null;
}

function validateProductos(productos: Producto[], ci: number): string | null {
  for (let pi = 0; pi < productos.length; pi++) {
    const p = productos[pi]!;
    if (!p.nombre?.trim()) {
      return `categorias[${ci}].productos[${pi}].nombre is required`;
    }
    if (typeof p.precio !== "number" || p.precio < 0) {
      return `categorias[${ci}].productos[${pi}].precio must be a non-negative number`;
    }
  }
  return null;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  // ── V1: Auth ──────────────────────────────────────────────────────────────
  if (isFactoryConfigured() && !(await isFactoryAuthenticated())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // ── V2: Parse body ────────────────────────────────────────────────────────
  let rawBody: Record<string, unknown>;
  let draft: FactoryDraft;
  try {
    rawBody = (await req.json()) as Record<string, unknown>;
    draft = rawBody as unknown as FactoryDraft;
  } catch {
    return Response.json(
      { error: "validation", details: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // ── V3: Slug format ───────────────────────────────────────────────────────
  const slug = draft.slug ?? "";
  if (!/^[a-z0-9][a-z0-9-]{0,29}$/.test(slug)) {
    return Response.json(
      { error: "validation", details: `Invalid slug format: "${slug}"` },
      { status: 400 },
    );
  }

  // ── V4: nombre ────────────────────────────────────────────────────────────
  if (!draft.businessConfig?.nombre?.trim()) {
    return Response.json(
      { error: "validation", details: "businessConfig.nombre is required" },
      { status: 400 },
    );
  }

  // ── V5: categorias not empty ──────────────────────────────────────────────
  const categorias = draft.businessConfig?.categorias;
  if (!categorias || categorias.length === 0) {
    return Response.json(
      { error: "validation", details: "At least one category is required" },
      { status: 400 },
    );
  }

  // ── V5+: per-category / per-product validation ────────────────────────────
  const catError = validateCategorias(categorias);
  if (catError) {
    return Response.json({ error: "validation", details: catError }, { status: 400 });
  }

  // ── V6: Supabase admin client ─────────────────────────────────────────────
  const admin = getAdminClient();
  if (!admin) {
    return Response.json(
      { error: "publish_failed", details: "DB client not configured" },
      { status: 500 },
    );
  }

  // ── V7: Slug uniqueness (any active status) ───────────────────────────────
  // Pre-check before hitting the DB UNIQUE constraint — gives an explicit 409.
  const { data: existing } = await admin
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return Response.json({ error: "slug_taken", slug }, { status: 409 });
  }

  // ── V8: Normalize draft → DbBusinessConfig ────────────────────────────────
  let dbConfig;
  try {
    const assetUrls = rawBody.assetUrls as
      | { banner_url?: string; logo_url?: string }
      | undefined;
    dbConfig = draftToDbConfig(draft, assetUrls);
  } catch (err) {
    const details = err instanceof Error ? err.message : "normalization error";
    return Response.json({ error: "publish_failed", details }, { status: 500 });
  }

  // ── V9: INSERT businesses (active=false — not live until activated) ───────
  const { data: bizRow, error: bizErr } = await admin
    .from("businesses")
    .insert({
      slug,
      name:   draft.businessConfig.nombre,
      config: dbConfig,
      theme:  draft.themeConfig ?? {},
      dna:    draft.generatedContent?.businessDNA ?? null,
      active: false,
    })
    .select("id")
    .single();

  if (bizErr || !bizRow) {
    console.error("[factory/publish] INSERT businesses:", bizErr?.message);
    return Response.json(
      {
        error:   "publish_failed",
        details: bizErr?.message ?? "insert businesses failed",
      },
      { status: 500 },
    );
  }

  const businessId = (bizRow as { id: string }).id;

  // ── V10: INSERT categories + products, then activate ─────────────────────
  try {
    for (let ci = 0; ci < categorias.length; ci++) {
      const cat = categorias[ci]!;

      const { data: catRow, error: catErr } = await admin
        .from("categories")
        .insert({
          name:        cat.nombre,
          slug:        cat.slug,
          sort_order:  ci,
          business_id: businessId,
        })
        .select("id")
        .single();

      if (catErr || !catRow) {
        throw new Error(catErr?.message ?? `insert category "${cat.slug}" failed`);
      }

      const categoryId = (catRow as { id: string }).id;

      const { error: prodErr } = await admin
        .from("products")
        .insert(
          cat.productos.map((p, pi) => ({
            category_id:  categoryId,
            name:         p.nombre,
            description:  p.descripcion ?? "",
            price_cents:  Math.round(p.precio * 100),
            available:    true,
            sort_order:   pi,
            business_id:  businessId,
          })),
        );

      if (prodErr) {
        throw new Error(`insert products for "${cat.slug}": ${prodErr.message}`);
      }
    }

    // Activate: marks the business as live
    const { error: activateErr } = await admin
      .from("businesses")
      .update({ active: true, updated_at: new Date().toISOString() })
      .eq("id", businessId);

    if (activateErr) {
      throw new Error(`activate business: ${activateErr.message}`);
    }

    return Response.json({ success: true, slug, businessId }, { status: 200 });

  } catch (err) {
    // ── ROLLBACK: delete businesses row (CASCADE cleans categories + products) ──
    await admin.from("businesses").delete().eq("id", businessId);

    const details = err instanceof Error ? err.message : "unknown publish error";
    console.error("[factory/publish] ROLLBACK:", details);
    return Response.json({ error: "publish_failed", details }, { status: 500 });
  }
}
