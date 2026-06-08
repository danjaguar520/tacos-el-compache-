import type { BusinessInput, TypeDefaults } from "@/lib/factory/types";
import type { ManualFactualData, GeneratedContent, BusinessDNA } from "@/lib/factory/ai/types";

// ─── Core merge — produces the two objects generators need ────────

export interface MergeResult {
  /** Complete BusinessInput: manual data + lema/descripcion from Claude. */
  businessInput: BusinessInput;
  /**
   * TypeDefaults overridden with Claude's content.
   * Passed to generateBusinessTs() in place of TIPO_DEFAULTS[tipo].
   */
  defaults: TypeDefaults;
}

/**
 * Merges factual data + Claude's generated content into the two objects
 * consumed by the Sprint 5A generators (businessInput + defaults).
 *
 * Mode Factory contract:
 *   ANY source → ManualFactualData + GeneratedContent → this function → generators
 */
export function mergeInputs(
  manual:      ManualFactualData,
  generated:   GeneratedContent,
  baseDefaults: TypeDefaults,
): MergeResult {

  // BusinessInput: manual data + lema + descripcion + enriched catalog
  const businessInput: BusinessInput = {
    nombre:          manual.nombre,
    slug:            manual.slug,
    tipo:            manual.tipo,
    lema:            generated.lema,
    descripcion:     generated.descripcion,
    logoLinea1:      manual.logoLinea1,
    logoLinea2:      manual.logoLinea2,
    emoji:           manual.emoji,
    logoType:        manual.logoType,
    telefono:        manual.telefono,
    whatsapp:        manual.whatsapp,
    calle:           manual.calle,
    colonia:         manual.colonia,
    ciudad:          manual.ciudad,
    cp:              manual.cp,
    lat:             manual.lat,
    lng:             manual.lng,
    horario:         manual.horario,
    costoEnvioPesos: manual.costoEnvioPesos,
    zonaCobertura:   manual.zonaCobertura,
    themePreset:     manual.themePreset,
    primaryHex:      manual.primaryHex,
    fontStyle:       manual.fontStyle,
    mpDescriptor:    manual.mpDescriptor,
    // Enrich product descriptions from Claude
    categorias: manual.categorias.map((cat) => ({
      ...cat,
      productos: cat.productos.map((p) => ({
        ...p,
        descripcion: p.descripcion || generated.productDescriptions[p.nombre] || "",
      })),
    })),
  };

  // TypeDefaults: base defaults overridden field-by-field with Claude's content.
  // Template fields (lemaTpl, ctaHomeTpl, relatoTpl) receive the already-expanded
  // strings from Claude. The generators call interpolate() on them, but since
  // Claude's output has no {nombre}/{ciudad} placeholders, interpolate() is a no-op.
  const defaults: TypeDefaults = {
    ...baseDefaults,
    menuEtiqueta:       generated.menuEtiqueta,
    menuSubtitulo:      generated.menuSubtitulo,
    footerSloganTpl:    generated.footerSlogan,
    carritoVacio:       generated.ui.carritoVacio,
    ubicacionSub:       generated.ui.ubicacionSub,
    itemNombre:         generated.itemNombre,
    valores:            generated.valores as TypeDefaults["valores"],
    ctaHomeTitulo:      generated.ctaHome.titulo,
    ctaHomeTpl:         generated.ctaHome.texto,
    ctaBoton:           generated.ctaHome.boton,
    lemaTpl:            generated.lema,
    descripcionTpl:     generated.descripcion,
    nosotrosHeroTitulo: generated.nosotros.heroTitulo,
    relatoTpl:          [...generated.nosotros.relato] as [string, string],
    procesoTitulo:      generated.nosotros.procesoTitulo,
    proceso:            generated.nosotros.proceso as TypeDefaults["proceso"],
    valoresTitulo:      generated.nosotros.valoresTitulo,
    valoresMarca:       generated.nosotros.valores as [string, string][],
    nosotrosCtaTitulo:  generated.nosotros.ctaTitulo,
  };

  return { businessInput, defaults };
}

// ─── business-dna.json builder ────────────────────────────────────

export interface BusinessDNAFile {
  schemaVersion: "1.0";
  generatedAt:   string;
  businessSlug:  string;
  businessName:  string;
  model:         string;
  fromFallback:  boolean;
  businessDNA:   BusinessDNA;
}

export function buildDNAFile(
  slug:         string,
  nombre:       string,
  dna:          BusinessDNA,
  model:        string,
  fromFallback: boolean,
): BusinessDNAFile {
  return {
    schemaVersion: "1.0",
    generatedAt:   new Date().toISOString(),
    businessSlug:  slug,
    businessName:  nombre,
    model,
    fromFallback,
    businessDNA:   dna,
  };
}

// ─── Preview table for operator review ───────────────────────────

export function buildPreviewTable(generated: GeneratedContent): string {
  const row = (label: string, value: string): string => {
    const v = value.length > 55 ? value.slice(0, 52) + "…" : value;
    return `  ${label.padEnd(22)} │ ${v}`;
  };

  return [
    "─".repeat(82),
    "  Campo                 │ Contenido generado",
    "─".repeat(82),
    row("lema",                 generated.lema),
    row("descripcion",          generated.descripcion),
    row("menuEtiqueta",         generated.menuEtiqueta),
    row("ctaHome.titulo",       generated.ctaHome.titulo),
    row("nosotros.heroTitulo",  generated.nosotros.heroTitulo),
    row("nosotros.relato[0]",   generated.nosotros.relato[0]),
    row("nosotros.relato[1]",   generated.nosotros.relato[1]),
    row("DNA.archetype",        generated.businessDNA.archetype),
    row("DNA.tone",             generated.businessDNA.tone),
    row("DNA.differentiation",  generated.businessDNA.differentiation),
    row("DNA.keywords",         generated.businessDNA.keywords.join(", ")),
    "─".repeat(82),
  ].join("\n");
}
