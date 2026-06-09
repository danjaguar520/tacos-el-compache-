/**
 * Lok'al Business Factory — DB column type contracts
 *
 * DbBusinessConfig: the exact shape stored in businesses.config (JSONB).
 * Mirrors the runtime shape of typeof staticBusiness (src/config/business.ts).
 * Produced exclusively by draftToDbConfig() in normalizer.ts.
 *
 * Naming rationale: BusinessConfig in json-types.ts already means BusinessInput
 * (flat Factory input). DbBusinessConfig is the distinct post-normalization shape
 * that the runtime actually reads from the DB.
 */

import type { HorarioBloque } from "@/lib/factory/types";

// ─── Main contract ────────────────────────────────────────────────

export interface DbBusinessConfig {
  // ── Identity ───────────────────────────────────────────────────
  nombre:       string;
  slug:         string;
  lema:         string;
  descripcion:  string;
  logoLinea1:   string;
  logoLinea2:   string;
  emoji:        string;
  mpDescriptor: string;

  // ── Contact ────────────────────────────────────────────────────
  telefono: string;
  whatsapp: string;

  // ── Address (nested) ───────────────────────────────────────────
  // Runtime reads: business.direccion.calle / .colonia / .ciudad / .cp
  // BusinessInput stores these as flat fields — normalizer wraps them.
  direccion: {
    calle:   string;
    colonia: string;
    ciudad:  string;
    cp:      string;
  };

  // Runtime reads: business.coordenadas.lat / .lng
  // BusinessInput stores lat/lng as flat nullable fields.
  // Normalizer defaults null → 0 to keep the shape non-nullable.
  coordenadas: {
    lat: number;
    lng: number;
  };

  // ── Hours ──────────────────────────────────────────────────────
  horario: HorarioBloque[];

  // ── Delivery ──────────────────────────────────────────────────
  // Integer cents. BusinessInput.costoEnvioPesos (float) × 100 = this.
  costoEnvioCents: number;
  zonaCobertura:   string;

  // ── Catalog ────────────────────────────────────────────────────
  // Slug of the category featured on the home page.
  // Derived from categorias[0].slug — not stored separately in BusinessInput.
  categoriaDestacada: string;
  menuEtiqueta:       string;
  menuSubtitulo:      string;

  // ── Home page ─────────────────────────────────────────────────
  valores: Array<{
    emoji:  string;
    titulo: string;
    sub:    string;
  }>;

  ctaHome: {
    titulo: string;
    texto:  string;
    boton:  string;
  };

  // ── Order / cart copy ─────────────────────────────────────────
  itemNombre: string;

  // ── Navigation ────────────────────────────────────────────────
  nav: {
    catalogoLabel: string;
    nosotrosLabel: string;
  };

  // ── Footer ────────────────────────────────────────────────────
  footerSlogan: string;

  // ── UI copy ───────────────────────────────────────────────────
  ui: {
    carritoVacio: string;
    ubicacionSub: string;
  };

  // ── Nosotros page ─────────────────────────────────────────────
  nosotros: {
    metaDescription: string;
    seccionLabel:    string;
    heroTitulo:      string;
    relato:          [string, string];
    procesoTitulo:   string;
    proceso: Array<{
      emoji:  string;
      titulo: string;
      texto:  string;
    }>;
    valoresTitulo: string;
    // Exactly 4 brand-value pairs: [label, description]
    valores: [
      [string, string],
      [string, string],
      [string, string],
      [string, string],
    ];
    ctaTitulo: string;
  };

  // ── Assets ────────────────────────────────────────────────────
  // Public Storage URLs set at publish time. Absent on older configs.
  banner_url?: string;
  logo_url?:   string;
}
