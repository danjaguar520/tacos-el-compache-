import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Fraunces } from "next/font/google";
import "./globals.css";
import { BusinessSiteNav } from "@/components/layout/BusinessSiteNav";
import { Header }          from "@/components/layout/Header";
import { Footer }          from "@/components/layout/Footer";
import { getBusinessContext } from "@/lib/business-context";

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

// ── Dynamic metadata (reads business from DB or static fallback) ──────────────

export async function generateMetadata(): Promise<Metadata> {
  const { config: b } = await getBusinessContext();
  return {
    title: {
      default: `${b.nombre} — ${b.lema}`,
      template: `%s · ${b.nombre}`,
    },
    description: b.descripcion,
    openGraph: {
      title:       b.nombre,
      description: b.lema,
      type:        "website",
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { theme: t } = await getBusinessContext();
  return {
    themeColor:   t.colors.primary,
    width:        "device-width",
    initialScale: 1,
  };
}

// ── Root layout ───────────────────────────────────────────────────────────────

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { config: b, theme: t, fromDB, slug } = await getBusinessContext();

  // Map theme.fonts.display to the actual CSS variable font stack.
  // Both Fraunces and Cormorant are pre-loaded above — no build change needed.
  const displayFont =
    (t.fonts?.display ?? "fraunces") === "fraunces"
      ? "var(--font-fraunces), var(--font-cormorant), Georgia, serif"
      : "var(--font-cormorant), Georgia, serif";

  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable} ${fraunces.variable}`}
      data-business={slug}
      data-source={fromDB ? "db" : "static"}
    >
      {/*
        Theme adapter — maps semantic color names from theme config to the
        internal CSS token aliases used across all components.
        Sprint 5D-2: reads from DB when available, static file as fallback.

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
            --color-chile:     ${t.colors.primary};
            --color-chile-700: ${t.colors.primaryDark};
            --color-frijol:    ${t.colors.fg};
            --color-crema:     ${t.colors.bg};
            --color-barro:     ${t.colors.border};
            --color-maiz:      ${t.colors.secondary};
            --color-naranja:   ${t.colors.accent};
            --color-epazote:   ${t.colors.success};
            --font-display:    ${displayFont};
          }
        `}</style>
      </head>
      <body className="bg-textura min-h-dvh antialiased">
        <BusinessSiteNav header={<Header />} footer={<Footer />}>
          {children}
        </BusinessSiteNav>
      </body>
    </html>
  );
}
