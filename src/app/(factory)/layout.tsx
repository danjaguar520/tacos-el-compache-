import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lok'al Business Factory",
  description: "Crea el sitio web de tu negocio local en 10 minutos.",
};

/** Isolated layout for the factory — no business site Header/Footer. */
export default function FactoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f5f7fa] font-sans antialiased">
      {children}
    </div>
  );
}
