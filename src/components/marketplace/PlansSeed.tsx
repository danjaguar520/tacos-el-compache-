import { ButtonLink } from "@/components/ui/Button";

interface Plan {
  id:        string;
  name:      string;
  icon:      string;
  prelude?:  string;
  features:  readonly string[];
  badge:     string;
  highlight: boolean;
}

const PLANS: readonly Plan[] = [
  {
    id:        "free",
    name:      "Gratis",
    icon:      "🆓",
    features:  ["Página propia", "Menú en línea", "Pedidos WhatsApp", "Horarios", "En marketplace"],
    badge:     "Para siempre",
    highlight: true,
  },
  {
    id:        "starter",
    name:      "Starter",
    icon:      "⭐",
    prelude:   "Todo lo de Gratis, más:",
    features:  ["Dominio propio", "Analíticas básicas", "Más visibilidad"],
    badge:     "Próximamente",
    highlight: false,
  },
  {
    id:        "pro",
    name:      "Pro",
    icon:      "✦",
    prelude:   "Todo lo de Starter, más:",
    features:  ["Pedidos web", "Estadísticas avanzadas", "Prioridad"],
    badge:     "Próximamente",
    highlight: false,
  },
];

export function PlansSeed() {
  return (
    <section className="bg-maiz/20 px-4 py-14">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center font-display text-2xl font-bold text-frijol">
          Comienza gratis, crece cuando quieras
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-chile/30 bg-crema"
                  : "border-barro/15 bg-transparent"
              }`}
            >
              <div className="text-center">
                <span className="text-3xl">{plan.icon}</span>
                <p className="mt-2 font-display text-lg font-bold text-frijol">
                  {plan.name}
                </p>
              </div>
              {plan.prelude && (
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-barro/70">
                  {plan.prelude}
                </p>
              )}
              <ul className="mt-3 flex-1 space-y-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-frijol/70">
                    <span
                      className={plan.highlight ? "text-epazote" : "text-barro/50"}
                      aria-hidden
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-center">
                {plan.highlight ? (
                  <span className="text-sm font-semibold text-epazote">{plan.badge}</span>
                ) : (
                  <span className="inline-block rounded-full bg-barro/10 px-3 py-1 text-xs text-barro/60">
                    {plan.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/factory">
            Empieza gratis — sin tarjeta de crédito →
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
