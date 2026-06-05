/**
 * Visual theme — Tacos El Compache de Ah Mun
 *
 * This is the ONLY file to change (alongside business.ts) to launch a new
 * business on the Lok'al template.
 *
 * Color names here (primary, fg, bg…) are semantic.
 * They map to internal CSS aliases — see globals.css for the mapping table.
 *
 * Onboarding a new business:
 *   1. Change the 8 hex values below to match the brand palette.
 *   2. Choose a display font.
 *   3. Set logo.type = "image" and place the logo at public/images/logo.png
 *      (optional — falls back to text logo from business.ts).
 */
export const theme = {

  colors: {
    /** Main action color — buttons, headings, prices, active nav. */
    primary:     "#8b2e1d",  // → --color-chile
    /** Darker shade of primary — hover states, button shadow depth. */
    primaryDark: "#6f2417",  // → --color-chile-700
    /** Foreground — body text and dark section backgrounds (footer, hero). */
    fg:          "#1b1a19",  // → --color-frijol
    /** Background — page surface and light cards. */
    bg:          "#f7f2ea",  // → --color-crema
    /** Border — subtle rings, dividers, secondary text labels. */
    border:      "#b35c2e",  // → --color-barro
    /** Secondary — secondary button background, card tints, hover fills. */
    secondary:   "#f4e3b2",  // → --color-maiz
    /** Accent — logo circle, small section labels, highlight decorations. */
    accent:      "#e8902a",  // → --color-naranja
    /** Success — confirmation states, "item added" feedback. */
    success:     "#5a7a45",  // → --color-epazote
  },

  fonts: {
    /**
     * Display font for headings (h1–h3, prices, product names).
     * Both options are pre-loaded — no build change needed when switching.
     *   "fraunces"  → warm, editorial, artisan feel (restaurants, cafés, taquerías)
     *   "cormorant" → elegant, classic, refined feel (fine dining, estética, spa)
     */
    display: "fraunces" as "fraunces" | "cormorant",
  },

  logo: {
    /**
     * "text"  → renders logoLinea1 + logoLinea2 from business.ts (default)
     * "image" → renders public/images/logo.png
     *           File must exist; falls back to text if image returns 404.
     */
    type: "text" as "text" | "image",
  },

} as const;
