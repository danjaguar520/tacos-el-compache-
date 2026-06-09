export interface MarketplaceBiz {
  slug:         string;
  name:         string;
  plan:         "free" | "starter" | "pro";
  customDomain: string | null;
  emoji:        string;
  lema:         string;
  ciudad:       string;
  archetype:    string | null;
  primaryColor: string;
}

const PLAN_BADGE: Record<MarketplaceBiz["plan"], { label: string; cls: string }> = {
  free:    { label: "Gratis",  cls: "bg-maiz/60 text-frijol/60" },
  starter: { label: "Starter", cls: "bg-barro/15 text-barro" },
  pro:     { label: "Pro ✦",   cls: "bg-naranja/20 text-naranja" },
};

function businessUrl(slug: string, customDomain: string | null): string {
  if (customDomain) return `https://${customDomain}`;
  return `https://${slug}.lok-al.mx`;
}

export function BusinessCard({
  slug, name, plan, customDomain, emoji, lema, ciudad, archetype, primaryColor,
}: MarketplaceBiz) {
  const badge = PLAN_BADGE[plan];
  const href  = businessUrl(slug, customDomain);
  const meta  = [archetype, ciudad].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-crema shadow-[var(--shadow-tarjeta)] ring-1 ring-barro/15 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-tarjeta-hover)]">
      <div
        className="flex h-20 items-center justify-center text-4xl"
        style={{ backgroundColor: `${primaryColor}22` }}
        aria-hidden
      >
        <span style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.15))" }}>{emoji}</span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-base font-bold leading-tight text-frijol">{name}</h2>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {meta && (
          <p className="text-xs text-barro">{meta}</p>
        )}

        <p className="line-clamp-2 flex-1 text-sm text-frijol/70">{lema}</p>

        <a
          href={href}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-chile px-4 py-2 text-sm font-semibold text-crema transition-[background-color,transform] duration-150 hover:bg-chile-700 hover:-translate-y-px active:translate-y-px"
        >
          Ver negocio →
        </a>
      </div>
    </article>
  );
}
