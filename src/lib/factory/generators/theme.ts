import type { BusinessInput, ThemeColors } from "@/lib/factory/types";
import { THEME_PRESETS } from "@/lib/factory/derivations";
import { derivePalette } from "@/lib/factory/colors";

export function generateThemeTs(input: BusinessInput, colors: ThemeColors): string {
  const presetName = input.themePreset;
  const hasCustom  = input.primaryHex !== null;

  const colorSource = hasCustom
    ? `paleta derivada de color personalizado ${input.primaryHex}`
    : `paleta preset: ${presetName}`;

  return `/**
 * Visual theme — ${input.nombre}
 *
 * Generado por Lok'al Business Factory v1
 * Fecha: ${new Date().toISOString().slice(0, 10)}
 * Origen de colores: ${colorSource}
 *
 * Para cambiar colores, edita los 8 valores hex en colors.
 * Para cambiar tipografía, cambia fonts.display.
 * Consulta globals.css para ver la tabla de alias internos.
 */
export const theme = {

  colors: {
    /** Color principal — botones, headings, precios, nav activo. */
    primary:     "${colors.primary}",  // → --color-chile
    /** Versión oscura del primary — hover, profundidad de sombras. */
    primaryDark: "${colors.primaryDark}",  // → --color-chile-700
    /** Foreground — texto general y fondos oscuros (footer, hero). */
    fg:          "${colors.fg}",  // → --color-frijol
    /** Background — fondo de página y tarjetas claras. */
    bg:          "${colors.bg}",  // → --color-crema
    /** Border — bordes, rings y divisores sutiles. */
    border:      "${colors.border}",  // → --color-barro
    /** Secondary — botón secundario, tints de tarjetas. */
    secondary:   "${colors.secondary}",  // → --color-maiz
    /** Accent — círculo del logo, etiquetas de sección. */
    accent:      "${colors.accent}",  // → --color-naranja
    /** Success — estados de confirmación ("Agregado"). */
    success:     "${colors.success}",  // → --color-epazote
  },

  fonts: {
    /**
     * Tipografía para headings (h1–h3, precios, nombres de productos).
     * Ambas opciones están pre-cargadas — no requiere cambio en build.
     *   "fraunces"  → cálida, editorial, artesanal
     *   "cormorant" → elegante, clásica, refinada
     */
    display: "${input.fontStyle}" as "fraunces" | "cormorant",
  },

  logo: {
    /**
     * "text"  → renderiza logoLinea1 + logoLinea2 de business.ts
     * "image" → renderiza public/images/logo.png
     */
    type: "${input.logoType}" as "text" | "image",
  },

} as const;
`;
}

/** Resolve the final ThemeColors for a business input. */
export function resolveColors(input: BusinessInput): ThemeColors {
  if (input.primaryHex) {
    return derivePalette(input.primaryHex);
  }
  return { ...THEME_PRESETS[input.themePreset] };
}
