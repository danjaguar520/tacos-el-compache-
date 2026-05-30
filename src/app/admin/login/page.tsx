import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminConfigured, isAuthenticated } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Acceso · Panel" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Si el panel está abierto (sin contraseña) o ya hay sesión, entra directo.
  if (!isAdminConfigured() || (await isAuthenticated())) {
    redirect("/admin/pedidos");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="rounded-3xl bg-white p-7 shadow-[var(--shadow-suave)] ring-1 ring-barro/10">
        <h1 className="font-display text-3xl font-bold text-chile">Panel de pedidos</h1>
        <p className="mt-1 text-sm text-frijol/60">Acceso de administrador.</p>
        <LoginForm />
      </div>
    </div>
  );
}
