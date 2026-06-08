import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isFactoryConfigured, isFactoryAuthenticated } from "@/lib/factory-auth";
import { FactoryLoginForm } from "@/components/factory/FactoryLoginForm";

export const metadata: Metadata = { title: "Acceso · Lok'al Business Factory" };
export const dynamic = "force-dynamic";

export default async function FactoryLoginPage() {
  // Si el Factory está abierto (sin contraseña) o ya hay sesión, entra directo.
  if (!isFactoryConfigured() || (await isFactoryAuthenticated())) {
    redirect("/factory");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="rounded-3xl bg-white p-7 shadow-lg ring-1 ring-gray-100">
        <h1 className="font-display text-3xl font-bold text-gray-900">Lok&apos;al Business Factory</h1>
        <p className="mt-1 text-sm text-gray-500">Acceso restringido.</p>
        <FactoryLoginForm />
      </div>
    </div>
  );
}
