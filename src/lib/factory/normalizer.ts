/**
 * Lok'al Business Factory — FactoryDraft → DbBusinessConfig normalizer
 *
 * Converts the Factory wizard state into the JSONB object stored in
 * businesses.config. Resolves all shape mismatches identified in audit R1:
 *
 *   - Flat address fields (calle, colonia, ciudad, cp) → nested direccion object
 *   - Flat nullable lat/lng → nested coordenadas object (null → 0)
 *   - costoEnvioPesos (float pesos) → costoEnvioCents (integer cents, × 100)
 *   - categoriaDestacada derived from categorias[0].slug
 *   - GeneratedContent fields merged with TypeDefaults fallbacks
 *   - nav labels always from TypeDefaults (no AI override — structural UI labels)
 */

import type { FactoryDraft } from "@/lib/factory/json-types";
import type { DbBusinessConfig } from "@/lib/factory/db-types";
import { TIPO_DEFAULTS, interpolate } from "@/lib/factory/derivations";

export function draftToDbConfig(draft: FactoryDraft): DbBusinessConfig {
  const { businessConfig: bc, generatedContent: gc } = draft;
  const d  = TIPO_DEFAULTS[bc.tipo];
  const iv = { nombre: bc.nombre, ciudad: bc.ciudad, itemNombre: d.itemNombre };

  return {
    // ── Identity ───────────────────────────────────────────────────
    nombre:       bc.nombre,
    slug:         bc.slug,
    // AI may override lema/descripcion with more authentic copy
    lema:         gc?.lema        ?? bc.lema,
    descripcion:  gc?.descripcion ?? bc.descripcion,
    logoLinea1:   bc.logoLinea1,
    logoLinea2:   bc.logoLinea2,
    emoji:        bc.emoji,
    mpDescriptor: bc.mpDescriptor,

    // ── Contact ────────────────────────────────────────────────────
    telefono: bc.telefono,
    whatsapp: bc.whatsapp,

    // ── Address: flat → nested ─────────────────────────────────────
    direccion: {
      calle:   bc.calle,
      colonia: bc.colonia,
      ciudad:  bc.ciudad,
      cp:      bc.cp,
    },
    // null coordinates become 0 — owner can update via DB later
    coordenadas: {
      lat: bc.lat ?? 0,
      lng: bc.lng ?? 0,
    },

    // ── Hours ──────────────────────────────────────────────────────
    horario: bc.horario,

    // ── Delivery: pesos (float) → cents (integer) ──────────────────
    costoEnvioCents: Math.round(bc.costoEnvioPesos * 100),
    zonaCobertura:   bc.zonaCobertura,

    // ── Catalog ────────────────────────────────────────────────────
    categoriaDestacada: bc.categorias[0].slug,
    menuEtiqueta:       gc?.menuEtiqueta  ?? d.menuEtiqueta,
    menuSubtitulo:      gc?.menuSubtitulo ?? d.menuSubtitulo,

    // ── Home page ──────────────────────────────────────────────────
    valores: gc?.valores ?? d.valores,
    ctaHome: gc?.ctaHome ?? {
      titulo: d.ctaHomeTitulo,
      texto:  interpolate(d.ctaHomeTpl, iv),
      boton:  d.ctaBoton,
    },

    // ── Order / cart copy ─────────────────────────────────────────
    itemNombre: gc?.itemNombre ?? d.itemNombre,

    // ── Navigation: TypeDefaults only — no AI override ────────────
    nav: {
      catalogoLabel: d.catalogoLabel,
      nosotrosLabel: d.nosotrosLabel,
    },

    // ── Footer ─────────────────────────────────────────────────────
    footerSlogan: gc?.footerSlogan ?? interpolate(d.footerSloganTpl, iv),

    // ── UI copy ────────────────────────────────────────────────────
    ui: gc?.ui ?? {
      carritoVacio: d.carritoVacio,
      ubicacionSub: d.ubicacionSub,
    },

    // ── Nosotros ───────────────────────────────────────────────────
    nosotros: gc?.nosotros
      ? {
          metaDescription: gc.nosotros.metaDescription,
          seccionLabel:    gc.nosotros.seccionLabel,
          heroTitulo:      gc.nosotros.heroTitulo,
          relato:          gc.nosotros.relato,
          procesoTitulo:   gc.nosotros.procesoTitulo,
          proceso:         gc.nosotros.proceso,
          valoresTitulo:   gc.nosotros.valoresTitulo,
          valores:         gc.nosotros.valores,
          ctaTitulo:       gc.nosotros.ctaTitulo,
        }
      : {
          metaDescription: `La historia de ${bc.nombre}: ${d.nosotrosHeroTitulo.toLowerCase()}.`,
          seccionLabel:    d.nosotrosLabel,
          heroTitulo:      d.nosotrosHeroTitulo,
          relato: [
            interpolate(d.relatoTpl[0], iv),
            interpolate(d.relatoTpl[1], iv),
          ] as [string, string],
          procesoTitulo: d.procesoTitulo,
          proceso:       d.proceso,
          valoresTitulo: d.valoresTitulo,
          // TypeDefaults.valoresMarca is always 4 entries per type
          valores: d.valoresMarca as [
            [string, string],
            [string, string],
            [string, string],
            [string, string],
          ],
          ctaTitulo: d.nosotrosCtaTitulo,
        },
  };
}
