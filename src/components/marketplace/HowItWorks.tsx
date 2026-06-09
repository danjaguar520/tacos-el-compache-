import { ButtonLink } from "@/components/ui/Button";

const STEPS = [
  {
    number: "1",
    title: "Crea tu perfil en 10 min",
    description:
      "Tu nombre, menú, horarios y foto de portada. Sin código. Sin diseñador.",
  },
  {
    number: "2",
    title: "Publica tu página propia",
    description: "Tu negocio queda listo para compartir con clientes.",
  },
  {
    number: "3",
    title: "Apareces en el marketplace",
    description:
      "Clientes nuevos te descubren y tus pedidos llegan directo.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-crema px-4 py-14">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center font-display text-2xl font-bold text-frijol">
          ¿Cómo funciona Lok&apos;al?
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-chile font-display text-lg font-bold text-crema">
                {step.number}
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-frijol">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-frijol/70">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/factory">Publicar mi negocio gratis →</ButtonLink>
        </div>
      </div>
    </section>
  );
}
