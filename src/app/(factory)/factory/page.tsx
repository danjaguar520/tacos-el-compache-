import Link from "next/link";
import { redirect } from "next/navigation";
import { isFactoryConfigured, isFactoryAuthenticated } from "@/lib/factory-auth";
import { FactoryWelcomeResume } from "@/components/factory/FactoryWelcomeResume";
import { FactoryLogoutButton } from "@/components/factory/FactoryLogoutButton";

export default async function FactoryWelcomePage() {
  if (isFactoryConfigured() && !(await isFactoryAuthenticated())) {
    redirect("/factory/login");
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      {isFactoryConfigured() && (
        <div className="absolute right-4 top-4">
          <FactoryLogoutButton />
        </div>
      )}
      <div className="w-full max-w-2xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
          <span>🏪</span> Lok&apos;al Business Factory v1
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl font-bold leading-tight text-gray-900">
          Crea el sitio web de tu<br />
          <span className="text-blue-600">negocio local</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-gray-500">
          Responde 8 preguntas. Claude genera el contenido personalizado.
          Descarga los archivos listos para Vercel.
        </p>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <span>✨ Contenido con IA</span>
          <span>⏱ Menos de 10 minutos</span>
          <span>📦 Archivos listos para deploy</span>
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link
            href="/factory/crear"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            Crear mi negocio →
          </Link>
        </div>

        {/* Resume draft banner (client component) */}
        <FactoryWelcomeResume />
      </div>
    </main>
  );
}
