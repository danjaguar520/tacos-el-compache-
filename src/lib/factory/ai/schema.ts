import { z } from "zod";
import type { GeneratedContent } from "@/lib/factory/ai/types";

// ─── BusinessDNA ──────────────────────────────────────────────────

export const BusinessDNASchema = z.object({
  archetype: z.enum(["tradicional", "moderno", "artesanal", "premium", "accesible", "familiar"]),
  tone:      z.enum(["cálido", "profesional", "juvenil", "elegante", "cercano", "aspiracional"]),
  audience:        z.string().min(5).max(80),
  differentiation: z.string().min(10).max(150),
  keywords: z.tuple([
    z.string().max(30),
    z.string().max(30),
    z.string().max(30),
    z.string().max(30),
    z.string().max(30),
  ]),
});

// ─── Full GeneratedContent ────────────────────────────────────────

export const GeneratedContentSchema = z.object({
  schemaVersion: z.literal("1.0"),

  lema:           z.string().min(5).max(80),
  descripcion:    z.string().min(20).max(200),
  menuEtiqueta:   z.string().min(3).max(40),
  menuSubtitulo:  z.string().min(10).max(120),

  valores: z.array(
    z.object({
      emoji:  z.string().min(1).max(4),
      titulo: z.string().min(2).max(20),
      sub:    z.string().min(2).max(30),
    }),
  ).length(4),

  ctaHome: z.object({
    titulo: z.string().min(3).max(50),
    texto:  z.string().min(10).max(150),
    boton:  z.string().min(3).max(30),
  }),

  itemNombre:   z.string().min(2).max(20),
  footerSlogan: z.string().min(5).max(80),

  ui: z.object({
    carritoVacio: z.string().min(5).max(60),
    ubicacionSub: z.string().min(5).max(60),
  }),

  nosotros: z.object({
    metaDescription: z.string().min(20).max(160),
    seccionLabel:    z.string().min(3).max(30),
    heroTitulo:      z.string().min(5).max(60),
    relato: z.tuple([
      z.string().min(40).max(300),
      z.string().min(40).max(300),
    ]),
    procesoTitulo: z.string().min(3).max(50),
    proceso: z.array(
      z.object({
        emoji:  z.string().min(1).max(4),
        titulo: z.string().min(2).max(30),
        texto:  z.string().min(10).max(100),
      }),
    ).length(3),
    valoresTitulo: z.string().min(3).max(30),
    valores: z.tuple([
      z.tuple([z.string().max(20), z.string().max(80)]),
      z.tuple([z.string().max(20), z.string().max(80)]),
      z.tuple([z.string().max(20), z.string().max(80)]),
      z.tuple([z.string().max(20), z.string().max(80)]),
    ]),
    ctaTitulo: z.string().min(5).max(50),
  }),

  productDescriptions: z.record(z.string(), z.string().max(100)),

  businessDNA: BusinessDNASchema,
});

export type ValidatedContent = z.infer<typeof GeneratedContentSchema>;

/**
 * Attempts to parse a Claude response as GeneratedContent.
 * Returns the parsed object or a structured error with the first violated field.
 */
export function validateContent(raw: unknown):
  | { ok: true; data: GeneratedContent }
  | { ok: false; errors: string } {
  const result = GeneratedContentSchema.safeParse(raw);
  if (result.success) {
    return { ok: true, data: result.data as GeneratedContent };
  }
  const errors = result.error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join(".")} — ${i.message}`)
    .join("; ");
  return { ok: false, errors };
}

/**
 * Extracts the JSON object from a Claude text response.
 * Handles cases where Claude wraps the JSON in markdown code blocks.
 */
export function extractJSON(text: string): unknown {
  // Strip markdown code blocks if present
  const stripped = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  // Find the outermost JSON object
  const start = stripped.indexOf("{");
  const end   = stripped.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in response");
  }

  // Pass null reviver to satisfy Zod v4's JSON type augmentation (null is ignored at runtime)
  return JSON.parse(stripped.slice(start, end + 1), null as unknown as undefined);
}
