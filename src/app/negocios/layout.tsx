import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Negocios — Lok'al",
  description: "Descubre los mejores negocios locales en tu ciudad.",
};

export default function NegociosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
