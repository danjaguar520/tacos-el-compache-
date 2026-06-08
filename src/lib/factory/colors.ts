/**
 * HSL color utilities — no external dependencies.
 * Used to derive a full 8-color palette from a single primary hex.
 */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n     = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l   = (max + min) / 2;
  let   h   = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = h / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(p, q, hn + 1/3) * 255),
    Math.round(hue2rgb(p, q, hn)       * 255),
    Math.round(hue2rgb(p, q, hn - 1/3) * 255),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, Math.max(0, Math.min(1, s)), Math.max(0, Math.min(1, l)));
  return rgbToHex(r, g, b);
}

/** Darken a hex color by reducing lightness by `amount` (0–1). */
export function darken(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}

/** Lighten a hex color by increasing lightness by `amount` (0–1). */
export function lighten(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.min(1, l + amount));
}

/** Desaturate a hex color by reducing saturation by `factor` (0–1). */
export function desaturate(hex: string, factor: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s * (1 - factor), l);
}

/** Create a very light tint of a color (mix toward white). */
export function tint(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s * (1 - amount * 0.6), Math.min(1, l + amount * 0.6));
}

/** True if the hue is in the warm range (reds, oranges, yellows, warm purples). */
export function isWarm(hex: string): boolean {
  const [h] = hexToHsl(hex);
  return h < 60 || h > 300;
}

/**
 * Derive a full 8-color palette from a single primary hex.
 * Used when the operator provides a custom primary color.
 */
export function derivePalette(primaryHex: string): {
  primary:     string;
  primaryDark: string;
  fg:          string;
  bg:          string;
  border:      string;
  secondary:   string;
  accent:      string;
  success:     string;
} {
  const warm = isWarm(primaryHex);
  const [h, s, l] = hexToHsl(primaryHex);

  return {
    primary:     primaryHex,
    primaryDark: hslToHex(h, s, Math.max(0, l - 0.15)),
    fg:          warm ? "#1b1a19" : "#0f1923",
    bg:          warm ? "#f7f2ea" : "#f5f7fa",
    border:      hslToHex(h, s * 0.5, Math.min(0.72, l + 0.22)),
    secondary:   hslToHex(h, s * 0.18, Math.min(0.93, l + 0.42)),
    accent:      warm
                   ? hslToHex((h + 20) % 360, Math.min(1, s * 1.1), Math.min(0.6, l + 0.05))
                   : hslToHex((h + 165) % 360, s * 0.85, Math.min(0.55, l + 0.05)),
    success:     "#5a7a45",
  };
}

/** Validate that a string is a 6-digit hex color. */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}
