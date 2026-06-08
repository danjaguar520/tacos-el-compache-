/** Lok'al Business Factory v1 — Type contracts */

/**
 * COPIA ESPEJO de src/lib/factory/ — NO es la fuente canónica.
 * Existe porque tsx no resuelve el alias @/ (ver REPORTE 6D-C.1-PRECHECK).
 * Cualquier cambio debe aplicarse primero en src/lib/factory/ y
 * replicarse aquí manualmente. Pendiente: evaluar en una fase de diseño
 * posterior la extracción de una capa neutral compartida (Opción 3 del
 * precheck) que elimine esta duplicación de raíz.
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
