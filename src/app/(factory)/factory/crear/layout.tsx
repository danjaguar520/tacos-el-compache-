import { redirect } from "next/navigation";
import { isFactoryConfigured, isFactoryAuthenticated } from "@/lib/factory-auth";

/** Guard de sesión para /factory/crear — no envuelve /factory/login (segmento hermano). */
export default async function FactoryCrearLayout({ children }: { children: React.ReactNode }) {
  if (isFactoryConfigured() && !(await isFactoryAuthenticated())) {
    redirect("/factory/login");
  }
  return <>{children}</>;
}
