import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Fraunces } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { business } from "@/config/business";
import { theme } from "@/config/theme";

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

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
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
  themeColor: theme.colors.primary,
  width: "device-width",
  initialScale: 1,
};

/** Maps theme.fonts.display to the loaded CSS variable font stack. */
const displayFont =
  theme.fonts.display === "fraunces"
    ? "var(--font-fraunces), var(--font-cormorant), Georgia, serif"
    : "var(--font-cormorant), Georgia, serif";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable} ${fraunces.variable}`}>
      {/*
        Theme adapter — maps semantic color names from theme.ts to the
        internal CSS token aliases used across all components.
        Changing theme.ts is sufficient to retheme the entire site.

        Internal alias → semantic role
        --color-chile   → primary      (buttons, headings, prices)
        --color-chile-700 → primaryDark (hover, shadow depth)
        --color-frijol  → fg           (text, dark backgrounds)
        --color-crema   → bg           (page surface, light cards)
        --color-barro   → border       (rings, dividers, labels)
        --color-maiz    → secondary    (secondary button, card tints)
        --color-naranja → accent       (logo circle, section labels)
        --color-epazote → success      (confirmation states)
      */}
      <head>
        <style>{`
          :root {
            --color-chile:     ${theme.colors.primary};
            --color-chile-700: ${theme.colors.primaryDark};
            --color-frijol:    ${theme.colors.fg};
            --color-crema:     ${theme.colors.bg};
            --color-barro:     ${theme.colors.border};
            --color-maiz:      ${theme.colors.secondary};
            --color-naranja:   ${theme.colors.accent};
            --color-epazote:   ${theme.colors.success};
            --font-display:    ${displayFont};
          }
        `}</style>
      </head>
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
