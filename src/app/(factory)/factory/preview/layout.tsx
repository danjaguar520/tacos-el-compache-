import { redirect } from "next/navigation";
import { isFactoryConfigured, isFactoryAuthenticated } from "@/lib/factory-auth";

/** Guard de sesión para /factory/preview — no envuelve /factory/login (segmento hermano). */
export default async function FactoryPreviewLayout({ children }: { children: React.ReactNode }) {
  if (isFactoryConfigured() && !(await isFactoryAuthenticated())) {
    redirect("/factory/login");
  }
  return <>{children}</>;
}
