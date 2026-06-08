import type { ThemeConfig } from "@/lib/factory/json-types";
import type { ThemeColors } from "@/lib/factory/types";
import { THEME_PRESETS } from "@/lib/factory/derivations";
import type { ThemePreset } from "@/lib/factory/types";

interface Props {
  theme:    Partial<ThemeConfig>;
  preset?:  ThemePreset;
  primary?: string | null;
  children: React.ReactNode;
}

/**
 * Injects theme CSS variables into a wrapper div so child components
 * that use --color-chile / --color-frijol etc. render with the new theme.
 * No global styles are changed — this is scoped to the wrapper subtree.
 */
export function ThemeWrapper({ theme, preset, primary, children }: Props) {
  const presetColors: ThemeColors = preset
    ? THEME_PRESETS[preset]
    : (theme.colors ?? THEME_PRESETS["professional-blue"]);

  const primary_   = primary ?? presetColors.primary;
  const colors     = { ...presetColors, ...(primary ? { primary: primary_ } : {}) };
  const fontDisplay = theme.fonts?.display === "cormorant"
    ? "var(--font-cormorant), Georgia, serif"
    : "var(--font-fraunces), var(--font-cormorant), Georgia, serif";

  return (
    <div
      style={{
        "--color-chile":     colors.primary,
        "--color-chile-700": colors.primaryDark,
        "--color-frijol":    colors.fg,
        "--color-crema":     colors.bg,
        "--color-barro":     colors.border,
        "--color-maiz":      colors.secondary,
        "--color-naranja":   colors.accent,
        "--color-epazote":   colors.success,
        "--font-display":    fontDisplay,
        // Keep base body styles consistent in the preview wrapper
        backgroundColor: colors.bg,
        color:           colors.fg,
        fontFamily:      "var(--font-sans, ui-sans-serif, sans-serif)",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
