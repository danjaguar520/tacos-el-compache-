import type { BusinessInput, TypeDefaults } from "@/lib/factory/types";
import type { BusinessDNA } from "@/lib/factory/ai/types";
import { interpolate } from "@/lib/factory/derivations";

/** Escape a value for TypeScript string literal (double-quoted). */
function q(s: string): string {
  return JSON.stringify(s);
}

/** Format a 2-space indented array of objects. */
function arr(items: string[], indent = "  "): string {
  if (items.length === 0) return "[]";
  return `[\n${items.map((i) => `${indent}  ${i}`).join("\n")}\n${indent}]`;
}

export function generateBusinessTs(
  input: BusinessInput,
  d: TypeDefaults,
  dna?: BusinessDNA,
): string {
  const { nombre, slug, ciudad } = input;
  const iv = { nombre, ciudad, itemNombre: d.itemNombre };

  // Resolve category-dependent defaults
  const categoriaDestacada = input.categorias[0]?.slug ?? "sin-categoria";
  const footerSlogan = interpolate(d.footerSloganTpl, iv);
  const ctaTexto     = d.ctaHomeTpl.replace("{ciudad}", ciudad).replace("{nombre}", nombre);
  const relato0      = d.relatoTpl[0].replace("{nombre}", nombre).replace("{ciudad}", ciudad);
  const relato1      = d.relatoTpl[1].replace("{nombre}", nombre).replace("{ciudad}", ciudad);

  // Build horario entries
  const horarioLines = input.horario.map(
    (h) => `{ dias: ${q(h.dias)}, horas: ${q(h.horas)} },`,
  );

  // Build valores (home value props)
  const valoresLines = d.valores.map(
    (v) => `{ emoji: ${q(v.emoji)}, titulo: ${q(v.titulo)}, sub: ${q(v.sub)} },`,
  );

  // Build nosotros.proceso
  const procesoLines = d.proceso.map(
    (p) =>
      `{\n      emoji: ${q(p.emoji)},\n      titulo: ${q(p.titulo)},\n      texto: ${q(p.texto)},\n    },`,
  );

  // Build nosotros.valores (brand values bullets)
  const nosValoresLines = d.valoresMarca.map(
    ([t, desc]) => `[${q(interpolate(t, iv))}, ${q(interpolate(desc, iv))}],`,
  );

  // Coordinates — omit when null
  const coordsBlock = (input.lat !== null && input.lng !== null)
    ? `{ lat: ${input.lat}, lng: ${input.lng} }`
    : `{ lat: 0, lng: 0 } /* TODO: replace with real GPS coordinates */`;

  const dnaComment = dna
    ? `\n * businessDNA (Lok'al v1.0 — no modifiques este bloque manualmente):\n` +
      ` * ${JSON.stringify({ schemaVersion: "1.0", ...dna }, null, 2).split("\n").join("\n * ")}\n *`
    : "";

  return `/**
 * ${nombre} — Configuración del negocio
 *
 * Generado por Lok'al Business Factory v1
 * Fecha: ${new Date().toISOString().slice(0, 10)}
 * Tipo: ${input.tipo}
 *${dnaComment}
 * Para personalizar textos edita las secciones de este archivo.
 * Para cambiar colores, edita theme.ts.
 */

export const business = {
  nombre:      ${q(nombre)},
  lema:        ${q(input.lema)},
  descripcion: ${q(input.descripcion)},

  // --- Contacto ---
  telefono: ${q(input.telefono)},
  whatsapp: ${q(input.whatsapp)},

  // --- Ubicación ---
  direccion: {
    calle:   ${q(input.calle)},
    colonia: ${q(input.colonia)},
    ciudad:  ${q(input.ciudad)},
    cp:      ${q(input.cp)},
  },
  coordenadas: ${coordsBlock},

  // --- Horario ---
  horario: ${arr(horarioLines)},

  // --- Entrega ---
  costoEnvioCents: ${input.costoEnvioPesos * 100}, // $${input.costoEnvioPesos} MXN
  zonaCobertura:   ${q(input.zonaCobertura)},

  // --- Identidad visual del logo ---
  logoLinea1: ${q(input.logoLinea1)},
  logoLinea2: ${q(input.logoLinea2)},
  emoji:      ${q(input.emoji)},

  // --- Catálogo / Menú ---
  categoriaDestacada: ${q(categoriaDestacada)},
  menuEtiqueta:  ${q(d.menuEtiqueta)},
  menuSubtitulo: ${q(d.menuSubtitulo)},

  // --- Propuesta de valor (home) ---
  valores: ${arr(valoresLines)},

  // --- CTA inferior home ---
  ctaHome: {
    titulo: ${q(d.ctaHomeTitulo)},
    texto:  ${q(ctaTexto)},
    boton:  ${q(d.ctaBoton)},
  },

  // --- Textos del pedido ---
  itemNombre: ${q(d.itemNombre)},

  // --- Integración Mercado Pago ---
  mpDescriptor: ${q(input.mpDescriptor)}, // máx 13 chars

  // --- Slug único del negocio (deriva claves de sesión) ---
  slug: ${q(slug)},

  // --- Navegación ---
  nav: {
    catalogoLabel: ${q(d.catalogoLabel)},
    nosotrosLabel: ${q(d.nosotrosLabel)},
  },

  // --- Footer ---
  footerSlogan: ${q(footerSlogan)},

  // --- Textos UI menores ---
  ui: {
    carritoVacio: ${q(d.carritoVacio)},
    ubicacionSub: ${q(d.ubicacionSub)},
  },

  // --- Página Nosotros ---
  // Sprint 5B: estos textos se generarán con Claude API para mayor personalización.
  nosotros: {
    metaDescription: ${q(`La historia de ${nombre}: ${d.nosotrosHeroTitulo.toLowerCase()}.`)},
    seccionLabel: ${q(d.nosotrosLabel)},
    heroTitulo:   ${q(d.nosotrosHeroTitulo)},
    relato: [
      ${q(relato0)},
      ${q(relato1)},
    ],
    procesoTitulo: ${q(d.procesoTitulo)},
    proceso: ${arr(procesoLines, "    ")},
    valoresTitulo: ${q(d.valoresTitulo)},
    valores: ${arr(nosValoresLines, "    ")},
    ctaTitulo: ${q(d.nosotrosCtaTitulo)},
  },
} as const;

/** Dirección en una sola línea, lista para mostrar o para Google Maps. */
export function direccionCompleta(): string {
  const d = business.direccion;
  return \`\${d.calle}, \${d.colonia}, \${d.ciudad}, \${d.cp}\`;
}

/** URL de embed de Google Maps (no requiere API key). */
export function mapsEmbedUrl(): string {
  const q = encodeURIComponent(direccionCompleta());
  return \`https://maps.google.com/maps?q=\${q}&z=16&output=embed\`;
}

/** URL "Cómo llegar" (abre direcciones en Google Maps). */
export function comoLlegarUrl(): string {
  const q = encodeURIComponent(direccionCompleta());
  return \`https://www.google.com/maps/dir/?api=1&destination=\${q}\`;
}

/** Enlace de WhatsApp con mensaje opcional. */
export function whatsappUrl(mensaje?: string): string {
  const base = \`https://wa.me/\${business.whatsapp}\`;
  return mensaje ? \`\${base}?text=\${encodeURIComponent(mensaje)}\` : base;
}
`;
}
