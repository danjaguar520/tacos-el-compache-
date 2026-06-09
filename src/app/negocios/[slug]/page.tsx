import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdminClient } from "@/lib/supabase/server";
import type { DbBusinessConfig } from "@/lib/factory/db-types";
import type { HorarioBloque } from "@/lib/factory/types";

// ── Types ─────────────────────────────────────────────────────────

type Params = Promise<{ slug: string }>;

interface BizRow {
  id:     string;
  slug:   string;
  name:   string;
  plan:   string;
  config: Record<string, unknown> | null;
  dna:    Record<string, unknown> | null;
}

interface RawCategory {
  id:         string;
  name:       string;
  sort_order: number;
}

interface RawProduct {
  id:          string;
  category_id: string;
  name:        string;
  description: string;
  price_cents: number;
}

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free:    { label: "Gratis",  cls: "bg-maiz/60 text-frijol/60" },
  starter: { label: "Starter", cls: "bg-barro/15 text-barro" },
  pro:     { label: "Pro ✦",   cls: "bg-naranja/20 text-naranja" },
};

function formatPrice(cents: number): string {
  const pesos = cents / 100;
  return `$${pesos % 1 === 0 ? String(pesos) : pesos.toFixed(2)}`;
}

// ── Metadata ──────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = getAdminClient();
  if (!admin) return {};
  const { data } = await admin
    .from("businesses")
    .select("name, config")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  if (!data) return {};
  const cfg = (data.config ?? {}) as Partial<DbBusinessConfig>;
  return {
    title: data.name,
    description: cfg.lema ?? undefined,
  };
}

// ── Page ──────────────────────────────────────────────────────────

export default async function BusinessProfilePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const admin = getAdminClient();
  if (!admin) return notFound();

  const { data: raw } = await admin
    .from("businesses")
    .select("id, slug, name, plan, config, dna")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!raw) return notFound();
  const biz = raw as BizRow;

  const cfg = (biz.config ?? {}) as Partial<DbBusinessConfig>;
  const dna = (biz.dna   ?? {}) as Record<string, unknown>;

  const [{ data: cats }, { data: prods }] = await Promise.all([
    admin
      .from("categories")
      .select("id, name, sort_order")
      .eq("business_id", biz.id)
      .order("sort_order"),
    admin
      .from("products")
      .select("id, category_id, name, description, price_cents")
      .eq("business_id", biz.id)
      .eq("available", true)
      .order("sort_order"),
  ]);

  const categories = (cats  ?? []) as RawCategory[];
  const products   = (prods ?? []) as RawProduct[];
  const badge      = PLAN_BADGE[biz.plan] ?? PLAN_BADGE.free;
  const horario    = (cfg.horario ?? []) as HorarioBloque[];
  const dir        = cfg.direccion;
  const archetype  = (dna.archetype as string | undefined) ?? null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">

      {/* Header */}
      <div className="flex items-start gap-4">
        <span className="text-5xl" aria-hidden>{cfg.emoji ?? "🏪"}</span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-frijol">{biz.name}</h1>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          {(archetype || dir?.ciudad) && (
            <p className="mt-1 text-sm text-barro">
              {[archetype, dir?.ciudad].filter(Boolean).join(" · ")}
            </p>
          )}
          {cfg.lema && <p className="mt-2 text-frijol/70">{cfg.lema}</p>}
        </div>
      </div>

      {/* Descripción */}
      {cfg.descripcion && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-frijol">Sobre nosotros</h2>
          <p className="mt-2 text-sm text-frijol/70">{cfg.descripcion}</p>
        </section>
      )}

      {/* Contacto */}
      {(cfg.whatsapp || cfg.telefono || dir?.ciudad) && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-frijol">Contacto</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-frijol/70">
            {dir?.ciudad && (
              <li>{dir.calle ? `${dir.calle}, ${dir.ciudad}` : dir.ciudad}</li>
            )}
            {cfg.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${cfg.whatsapp.replace(/\D/g, "")}`}
                  className="text-epazote underline underline-offset-2 hover:text-epazote/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp {cfg.whatsapp}
                </a>
              </li>
            )}
            {cfg.telefono && cfg.telefono !== cfg.whatsapp && (
              <li>Tel. {cfg.telefono}</li>
            )}
          </ul>
        </section>
      )}

      {/* Horario */}
      {horario.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-frijol">Horario</h2>
          <ul className="mt-2 space-y-1 text-sm text-frijol/70">
            {horario.map((h) => (
              <li key={`${h.dias}-${h.horas}`} className="flex justify-between gap-4">
                <span>{h.dias}</span>
                <span>{h.horas}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Menú */}
      {categories.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-frijol">Menú</h2>
          <div className="mt-4 space-y-8">
            {categories.map((cat) => {
              const catProds = products.filter((p) => p.category_id === cat.id);
              if (catProds.length === 0) return null;
              return (
                <div key={cat.id}>
                  <h3 className="font-display text-base font-semibold uppercase tracking-wide text-barro">
                    {cat.name}
                  </h3>
                  <ul className="mt-3 divide-y divide-barro/10">
                    {catProds.map((prod) => (
                      <li key={prod.id} className="flex items-start justify-between gap-4 py-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-frijol">{prod.name}</p>
                          {prod.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-frijol/50">
                              {prod.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-barro">
                          {formatPrice(prod.price_cents)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Back */}
      <div className="mt-12 border-t border-barro/15 pt-6 text-center">
        <Link href="/negocios" className="text-sm text-barro/70 hover:text-barro">
          ← Ver todos los negocios
        </Link>
      </div>

    </div>
  );
}
