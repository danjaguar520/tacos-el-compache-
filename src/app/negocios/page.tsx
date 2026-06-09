import { getAdminClient } from "@/lib/supabase/server";
import { BusinessCard } from "@/components/marketplace/BusinessCard";
import { ButtonLink } from "@/components/ui/Button";
import { HowItWorks } from "@/components/marketplace/HowItWorks";
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

const OWNER_BENEFITS = [
  "Tu página web con menú en línea",
  "Aparece en este marketplace",
  "Acepta pedidos por WhatsApp y web",
  "Gratis para siempre — sin tarjeta de crédito",
] as const;

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
  const count      = businesses.length;

  return (
    <div>
      {/* Hero */}
      <section className="bg-textura-oscura px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-bold text-crema sm:text-5xl">
          Negocios locales con menú y pedidos online
        </h1>
        <p className="mx-auto mt-4 max-w-md text-crema/70">
          Cada negocio tiene su propia página — menú real, horarios directos
          y pedidos por WhatsApp. Sin intermediarios.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="#negocios" variant="secondary">
            Explorar negocios ↓
          </ButtonLink>
          <ButtonLink href="/factory">
            Publicar el mío →
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-crema/40">
          {count >= 5
            ? `🏪 ${count} negocios activos en la plataforma`
            : "Los primeros negocios ya están en la plataforma."}
        </p>
      </section>

      <HowItWorks />

      {/* Owner CTA — before grid for mobile visibility */}
      <section className="border-y border-barro/15 bg-maiz/30 px-4 py-12 text-center">
        <h2 className="font-display text-2xl font-bold text-frijol">
          ¿Listo para publicar tu negocio?
        </h2>
        <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm text-frijol/70">
          {OWNER_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2">
              <span className="font-bold text-epazote" aria-hidden>✓</span>
              {benefit}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <ButtonLink href="/factory">
            Crear mi página gratis →
          </ButtonLink>
        </div>
      </section>

      {/* Grid */}
      <section id="negocios" className="mx-auto max-w-4xl px-4 py-10">
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
          <>
            <h2 className="mb-6 font-display text-xl font-bold text-frijol">
              Negocios en la plataforma
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((biz) => (
                <BusinessCard key={biz.slug} {...biz} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
