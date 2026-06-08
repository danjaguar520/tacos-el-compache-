import Anthropic from "@anthropic-ai/sdk";
import type { AIContext, GeneratedContent, GenerationResult } from "@/lib/factory/ai/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/factory/ai/prompts";
import { validateContent, extractJSON } from "@/lib/factory/ai/schema";
import { TIPO_DEFAULTS, interpolate } from "@/lib/factory/derivations";

// ─── Cost calculation ─────────────────────────────────────────────

const MODEL_PRICES: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 0.0000008,   output: 0.000004  },
  "claude-sonnet-4-6":         { input: 0.000003,    output: 0.000015  },
  "claude-opus-4-8":           { input: 0.000015,    output: 0.000075  },
};

function calcCost(model: string, inputTokens: number, outputTokens: number): number {
  const prices = MODEL_PRICES[model] ?? { input: 0.000003, output: 0.000015 };
  return prices.input * inputTokens + prices.output * outputTokens;
}

// ─── Fallback — uses Sprint 5A template defaults ──────────────────

function buildFallback(context: AIContext): GeneratedContent {
  const d    = TIPO_DEFAULTS[context.tipo];
  const iv   = { nombre: context.nombre, ciudad: context.ciudad, itemNombre: d.itemNombre };

  return {
    schemaVersion:  "1.0",
    lema:           interpolate(d.lemaTpl, iv),
    descripcion:    interpolate(d.descripcionTpl, iv),
    menuEtiqueta:   d.menuEtiqueta,
    menuSubtitulo:  d.menuSubtitulo,
    valores:        d.valores as GeneratedContent["valores"],
    ctaHome: {
      titulo: d.ctaHomeTitulo,
      texto:  interpolate(d.ctaHomeTpl, iv),
      boton:  d.ctaBoton,
    },
    itemNombre:   d.itemNombre,
    footerSlogan: interpolate(d.footerSloganTpl, iv),
    ui: {
      carritoVacio: d.carritoVacio,
      ubicacionSub: d.ubicacionSub,
    },
    nosotros: {
      metaDescription: `La historia de ${context.nombre}: ${d.nosotrosHeroTitulo.toLowerCase()}.`,
      seccionLabel:    d.nosotrosLabel,
      heroTitulo:      d.nosotrosHeroTitulo,
      relato: [
        interpolate(d.relatoTpl[0], { ...iv }),
        interpolate(d.relatoTpl[1], { ...iv }),
      ],
      procesoTitulo: d.procesoTitulo,
      proceso:       d.proceso as GeneratedContent["nosotros"]["proceso"],
      valoresTitulo: d.valoresTitulo,
      valores:       d.valoresMarca as GeneratedContent["nosotros"]["valores"],
      ctaTitulo:     d.nosotrosCtaTitulo,
    },
    productDescriptions: {},
    businessDNA: {
      archetype:       "tradicional",
      tone:            "cálido",
      audience:        `Clientes de ${context.ciudad} que buscan ${d.itemNombre} de calidad`,
      differentiation: d.nosotrosHeroTitulo,
      keywords:        [
        context.nombre,
        context.tipo,
        context.ciudad,
        d.itemNombre,
        "local",
      ],
    },
  };
}

// ─── Main generation function — Mode Factory entry point ──────────

/**
 * Generates business content from minimal context.
 *
 * Mode Factory contract:
 *   ANY source (CLI, web form, API) → AIContext → this function → GeneratedContent
 *
 * @param context   Minimal business info sent to Claude.
 * @param options   model override, API key override, max retries.
 */
export async function generateContent(
  context: AIContext,
  options: {
    model?:      string;
    apiKey?:     string;
    maxRetries?: number;
  } = {},
): Promise<GenerationResult> {
  const model      = options.model      ?? "claude-haiku-4-5-20251001";
  const maxRetries = options.maxRetries ?? 3;
  const apiKey     = options.apiKey     ?? process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("⚠  ANTHROPIC_API_KEY no configurado — usando templates de fallback.");
    return {
      content:      buildFallback(context),
      usage:        { inputTokens: 0, outputTokens: 0, costUSD: 0, model: "fallback" },
      attempts:     0,
      fromFallback: true,
    };
  }

  const anthropic = new Anthropic({ apiKey });

  let lastError: string | null = null;
  let totalInput  = 0;
  let totalOutput = 0;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const userPrompt = buildUserPrompt(context, lastError ?? undefined);

    let raw: string;
    let inputTokens  = 0;
    let outputTokens = 0;

    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1800,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: "user", content: userPrompt }],
      });

      inputTokens  = response.usage.input_tokens;
      outputTokens = response.usage.output_tokens;
      totalInput  += inputTokens;
      totalOutput += outputTokens;

      const block = response.content.find((b) => b.type === "text");
      if (!block || block.type !== "text") {
        lastError = "Claude returned no text content";
        continue;
      }
      raw = block.text;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      lastError = `API error: ${msg}`;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      continue;
    }

    // Try to parse and validate
    let parsed: unknown;
    try {
      parsed = extractJSON(raw);
    } catch {
      lastError = "Response was not valid JSON";
      continue;
    }

    const validation = validateContent(parsed);
    if (validation.ok) {
      return {
        content:      validation.data,
        usage: {
          inputTokens:  totalInput,
          outputTokens: totalOutput,
          costUSD:      calcCost(model, totalInput, totalOutput),
          model,
        },
        attempts:     attempt,
        fromFallback: false,
      };
    }

    // Explicit cast needed — discriminated union narrowing unreliable across module boundaries
    const failedResult = validation as { ok: false; errors: string };
    lastError = failedResult.errors ?? "validation failed";
    process.stdout.write(`\x1b[33m  ↻  Intento ${attempt} — validación falló, reintentando...\x1b[0m\n`);
  }

  // All retries exhausted — use fallback, report what happened
  console.warn(`⚠  Claude falló después de ${maxRetries} intentos. Último error: ${lastError}`);
  console.warn("   Usando templates de fallback. El contenido será genérico.");

  return {
    content:      buildFallback(context),
    usage: {
      inputTokens:  totalInput,
      outputTokens: totalOutput,
      costUSD:      calcCost(model, totalInput, totalOutput),
      model,
    },
    attempts:     maxRetries,
    fromFallback: true,
  };
}
