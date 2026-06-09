import { getAdminClient } from "@/lib/supabase/server";
import { BusinessCard } from "@/components/marketplace/BusinessCard";
import { ButtonLink } from "@/components/ui/Button";
import type { MarketplaceBiz } from "@/components/marketplace/BusinessCard";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawBusiness {
  slug:          string;
  name:          string;
  plan:          string;
  custom_domain: string | null;
  config:        Record<string, unknown> | null;
  theme:         Record<string, unknown> | null;
  dna:           Record<string, unknown> | null;
}

const PLAN_ORDER: Record<string, number> = { pro: 0, starter: 1, free: 2 };

// ── Data layer ────────────────────────────────────────────────────────────────

function toMarketplaceBiz(row: RawBusiness): MarketplaceBiz {
  const cfg    = row.config ?? {};
  const colors = ((row.theme ?? {}).colors as Record<string, string> | undefined) ?? {};
  const dir    = (cfg.direccion as Record<string, string> | undefined) ?? {};
  const dna    = row.dna ?? {};

  return {
    slug:         row.slug,
    name:         row.name,
    plan:         (row.plan as MarketplaceBiz["plan"]) ?? "free",
    customDomain: row.custom_domain,
    emoji:        (cfg.emoji    as string | undefined) ?? "🏪",
    lema:         (cfg.lema     as string | undefined) ?? "",
    ciudad:       dir.ciudad ?? "",
    archetype:    (dna.archetype as string | undefined) ?? null,
    primaryColor: colors.primary ?? "#8b2e1d",
  };
}

async function getActiveBusinesses(): Promise<MarketplaceBiz[]> {
  const admin = getAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("businesses")
    .select("slug, name, plan, custom_domain, config, theme, dna")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as RawBusiness[])
    .map(toMarketplaceBiz)
    .sort((a, b) => (PLAN_ORDER[a.plan] ?? 2) - (PLAN_ORDER[b.plan] ?? 2));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function NegociosPage() {
  const businesses = await getActiveBusinesses();

  return (
    <div>
      {/* Hero */}
      <section className="bg-textura-oscura px-4 py-14 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-naranja">
          Plataforma Lok&apos;al
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-crema sm:text-5xl">
          Negocios locales cerca de ti
        </h1>
        <p className="mx-auto mt-3 max-w-md text-crema/70">
          Restaurantes, cafés, barberías y más — negocios reales, personas reales.
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        {businesses.length === 0 ? (
          <div className="py-20 text-center text-frijol/50">
            <p className="text-5xl">🏪</p>
            <p className="mt-4 font-display text-xl font-semibold text-frijol/60">
              Próximamente más negocios
            </p>
            <p className="mt-1 text-sm">
              Los primeros negocios están llegando a la plataforma.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((biz) => (
              <BusinessCard key={biz.slug} {...biz} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-barro/15 bg-maiz/30 px-4 py-12 text-center">
        <h2 className="font-display text-2xl font-bold text-frijol">
          ¿Tienes un negocio?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-frijol/70">
          Crea la página de tu negocio gratis en menos de 10 minutos con el asistente de Lok&apos;al.
        </p>
        <div className="mt-6">
          <ButtonLink href="/factory">
            Crear mi negocio gratis →
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
