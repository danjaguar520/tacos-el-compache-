/** Lok'al Business Factory v1 — Type contracts */

/**
 * FUENTE CANÓNICA — Lok'al Business Factory (sprint 6D-C.1).
 * Este árbol (src/lib/factory/) es la fuente de la verdad, integrada al
 * wizard web. scripts/create-business/ mantiene una copia espejo con
 * imports relativos (compatible con tsx, que no resuelve alias @/ — ver
 * REPORTE 6D-C.1-PRECHECK). Todo cambio futuro se aplica primero aquí y
 * se replica manualmente en el espejo hasta que 6D-C (fase de diseño)
 * resuelva la consolidación definitiva.
 */

export type BusinessType =
  | "restaurante"
  | "sushi"
  | "cafeteria"
  | "barberia"
  | "estetica"
  | "servicios"
  | "otro";

export type FontStyle = "fraunces" | "cormorant";
export type LogoType  = "text" | "image";

export type ThemePreset =
  | "warm-mexican"
  | "cool-japanese"
  | "rich-coffee"
  | "classic-barber"
  | "elegant-rose"
  | "professional-blue";

// ─── Input from the CLI ───────────────────────────────────────────

export interface HorarioBloque {
  dias:  string;
  horas: string;
}

export interface Producto {
  nombre:      string;
  precio:      number;   // in pesos (converted to cents on output)
  descripcion: string;
}

export interface Categoria {
  nombre:    string;
  slug:      string;
  productos: Producto[];
}

export interface BusinessInput {
  // Identity
  nombre:      string;
  slug:        string;
  tipo:        BusinessType;
  lema:        string;
  descripcion: string;
  logoLinea1:  string;
  logoLinea2:  string;
  emoji:       string;
  logoType:    LogoType;

  // Contact
  telefono:  string;
  whatsapp:  string;

  // Address
  calle:    string;
  colonia:  string;
  ciudad:   string;
  cp:       string;
  lat:      number | null;
  lng:      number | null;

  // Hours
  horario: HorarioBloque[];

  // Delivery
  costoEnvioPesos: number;
  zonaCobertura:   string;

  // Catalog
  categorias: Categoria[];

  // Visual
  themePreset:  ThemePreset;
  primaryHex:   string | null;   // override the preset's primary color
  fontStyle:    FontStyle;

  // Payments
  mpDescriptor: string;
}

// ─── Theme colors (mirrors theme.ts structure) ───────────────────

export interface ThemeColors {
  primary:     string;
  primaryDark: string;
  fg:          string;
  bg:          string;
  border:      string;
  secondary:   string;
  accent:      string;
  success:     string;
}

// ─── Type-based defaults ──────────────────────────────────────────

export interface ValorProp {
  emoji:  string;
  titulo: string;
  sub:    string;
}

export interface ProcesoStep {
  emoji:  string;
  titulo: string;
  texto:  string;
}

export interface TypeDefaults {
  emoji:              string;
  fontStyle:          FontStyle;
  themePreset:        ThemePreset;
  lemaTpl:            string;
  descripcionTpl:     string;
  menuEtiqueta:       string;
  menuSubtitulo:      string;
  footerSloganTpl:    string;   // {nombre} is replaced at generation time
  carritoVacio:       string;
  ubicacionSub:       string;
  itemNombre:         string;
  catalogoLabel:      string;
  nosotrosLabel:      string;
  nosotrosHeroTitulo: string;
  relatoTpl:          [string, string]; // {nombre} and {ciudad} replaced
  procesoTitulo:      string;
  proceso:            ProcesoStep[];
  valoresTitulo:      string;
  valores:            ValorProp[];
  valoresMarca:       [string, string][];
  ctaHomeTitulo:      string;
  ctaHomeTpl:         string;
  ctaBoton:           string;
  nosotrosCtaTitulo:  string;
}

// ─── Generated file contents ──────────────────────────────────────

export interface GeneratedOutput {
  businessTs:  string;
  themeTs:     string;
  seedSql:     string;
  envTemplate: string;
  onboarding:  string;
  outputDir:   string;
  slug:        string;
}
