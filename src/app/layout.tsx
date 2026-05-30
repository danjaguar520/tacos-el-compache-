import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { business } from "@/config/business";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${business.nombre} — ${business.lema}`,
    template: `%s · ${business.nombre}`,
  },
  description: business.descripcion,
  openGraph: {
    title: business.nombre,
    description: business.lema,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b2e1d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-textura min-h-dvh antialiased">
        <Header />
        {/* pb para que la barra inferior fija no tape el contenido en móvil */}
        <main className="pb-20 sm:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
