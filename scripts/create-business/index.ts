#!/usr/bin/env node
/**
 * Lok'al Business Factory v1 — Config Generator CLI
 *
 * Modo AUTO  (ANTHROPIC_API_KEY presente): formulario de 9 preguntas → Claude API
 * Modo MANUAL (sin API key o --manual):    formulario completo → templates por tipo
 *
 * En ambos modos los generators de Sprint 5A producen los mismos 5 archivos.
 * La diferencia es la calidad y autenticidad del contenido generado.
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { confirm, select } from "@inquirer/prompts";
import type { BusinessInput } from "./types.js";
import type { GenerationResult } from "./ai/types.js";
import { runQuestions } from "./questions.js";
import { runMinimalQuestions } from "./questions-minimal.js";
import { generateContent } from "./ai/generate.js";
import { mergeInputs, buildDNAFile, buildPreviewTable } from "./ai/merge.js";
import { TIPO_DEFAULTS } from "./derivations.js";
import { generateBusinessTs } from "./generators/business.js";
import { generateThemeTs, resolveColors } from "./generators/theme.js";
import { generateSeedSql } from "./generators/seed.js";
import { generateEnvTemplate } from "./generators/env.js";

// ─── ONBOARDING.md ────────────────────────────────────────────────

function generateOnboarding(input: BusinessInput, slug: string, fromAI: boolean): string {
  const totalProducts = input.categorias.reduce((n, c) => n + c.productos.length, 0);
  const contentSource = fromAI
    ? "✨ Generado con Claude AI — contenido personalizado para este negocio"
    : "📋 Generado con templates por tipo de negocio";

  return `# Onboarding — ${input.nombre}

Generado el ${new Date().toISOString().slice(0, 10)} por Lok'al Business Factory v1.
${contentSource}
Tiempo estimado de deploy: **15–20 minutos**.

---

## Archivos generados

| Archivo | Propósito |
|---|---|
| \`business.ts\` | Configuración completa del negocio |
| \`theme.ts\` | Identidad visual |
| \`seed.sql\` | Catálogo (${input.categorias.length} categorías, ${totalProducts} productos) |
| \`.env.template\` | Variables de entorno |
| \`business-dna.json\` | Metadata estratégica Lok'al (no se usa en la app todavía) |

---

## Paso 1 — Copiar archivos al template
\`\`\`bash
cp output/${slug}/business.ts src/config/business.ts
cp output/${slug}/theme.ts    src/config/theme.ts
\`\`\`

## Paso 2 — Banner
Reemplazar \`public/images/banner-hero.png\` con el banner del negocio.

## Paso 3 — Supabase (~8 min)
1. Crear proyecto en supabase.com
2. SQL Editor → \`supabase/migrations/0001_init.sql\`
3. SQL Editor → \`output/${slug}/seed.sql\`
4. Project Settings → API → copiar las 3 keys

## Paso 4 — Vercel (~7 min)
1. vercel.com/new → importar el repo
2. Environment Variables → valores de \`.env.template\`
   - Sensitive: \`SUPABASE_SERVICE_ROLE_KEY\`, \`MP_ACCESS_TOKEN\`, \`ADMIN_PASSWORD\`
3. Deploy → copiar URL → actualizar \`NEXT_PUBLIC_SITE_URL\` → Redeploy

## Paso 5 — Webhook MP (~2 min)
URL: \`https://TU-URL.vercel.app/api/webhooks/mercadopago\` / Evento: \`payment\`

---

## Checklist post-deploy

- [ ] Home carga con banner y textos correctos
- [ ] Menú muestra productos desde Supabase (no "modo demo")
- [ ] Carrito y checkout funcionan
- [ ] Panel \`/admin/pedidos\` accesible
- [ ] Mapa en \`/ubicacion\` apunta al negocio

---

\`\`\`
Nombre:     ${input.nombre}
Slug:       ${slug}
Tipo:       ${input.tipo}
Ciudad:     ${input.ciudad}
Horario:    ${input.horario.map((h) => `${h.dias} ${h.horas}`).join(" | ")}
\`\`\`
`;
}

// ─── Main ─────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.clear();
  console.log("\x1b[36m");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  LOK'AL BUSINESS FACTORY — Config Generator v1.0        ║");
  console.log("╚══════════════════════════════════════════════════════════╝\x1b[0m");

  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const forceManual = process.argv.includes("--manual");

  const useAI = hasApiKey && !forceManual;

  if (useAI) {
    console.log("\x1b[32m  ✨ Modo AI activo\x1b[0m — Claude generará el contenido personalizado.");
    console.log("  Agrega \x1b[90m--manual\x1b[0m para usar templates por tipo en su lugar.\n");
  } else if (!hasApiKey) {
    console.log("\x1b[33m  📋 Modo manual\x1b[0m — ANTHROPIC_API_KEY no configurado.");
    console.log("  El contenido usará templates por tipo de negocio.\n");
  } else {
    console.log("\x1b[90m  📋 Modo manual forzado.\x1b[0m\n");
  }

  const startMs = Date.now();

  // ── Collect inputs ───────────────────────────────────────────────
  let businessInput: BusinessInput;
  let generationResult: GenerationResult | null = null;
  let overriddenDefaults: import("./types.js").TypeDefaults | null = null;

  try {
    if (useAI) {
      // Sprint 5B path: minimal questions + Claude
      const { manual, aiContext } = await runMinimalQuestions();

      process.stdout.write("\n\x1b[36m⚙  Generando contenido con Claude...\x1b[0m\n");
      generationResult = await generateContent(aiContext);
      const baseDefaults = TIPO_DEFAULTS[manual.tipo];

      let merged = mergeInputs(manual, generationResult.content, baseDefaults);
      businessInput      = merged.businessInput;
      overriddenDefaults = merged.defaults;

      // Show preview for operator review
      console.log("\n" + buildPreviewTable(generationResult.content));

      const action = await select<"accept" | "regenerate" | "manual">({
        message: "¿Qué deseas hacer con este contenido?",
        choices: [
          { value: "accept",     name: "✅ Aceptar y generar archivos" },
          { value: "regenerate", name: "↻  Regenerar con Claude (nuevo intento)" },
          { value: "manual",     name: "📋 Continuar con formulario manual completo" },
        ],
      });

      if (action === "regenerate") {
        process.stdout.write("\x1b[36m⚙  Regenerando...\x1b[0m\n");
        generationResult = await generateContent(aiContext);
        merged = mergeInputs(manual, generationResult.content, baseDefaults);
        businessInput      = merged.businessInput;
        overriddenDefaults = merged.defaults;
        console.log("\n" + buildPreviewTable(generationResult.content));
        const finalConfirm = await confirm({ message: "¿Aceptar este contenido?", default: true });
        if (!finalConfirm) {
          console.log("\x1b[33m⚠  Cancelado.\x1b[0m");
          process.exit(0);
        }
      } else if (action === "manual") {
        // Fall through to manual mode
        const fullInput = await runQuestions();
        businessInput = fullInput;
        generationResult = null;
      }

    } else {
      // Sprint 5A path: full manual questions
      businessInput = await runQuestions();
    }

  } catch (err: unknown) {
    const e = err as { name?: string };
    if (e.name === "ExitPromptError") {
      console.log("\n\x1b[33m⚠  Cancelado.\x1b[0m\n");
      process.exit(0);
    }
    throw err;
  }

  const { slug } = businessInput;
  const defaults  = overriddenDefaults ?? TIPO_DEFAULTS[businessInput.tipo];
  const colors    = resolveColors(businessInput);
  const dna       = generationResult?.content.businessDNA;

  // ── Generate file contents ───────────────────────────────────────
  console.log("\n\x1b[36m⚙  Generando archivos...\x1b[0m");

  const businessTs  = generateBusinessTs(businessInput, defaults, dna);
  const themeTs     = generateThemeTs(businessInput, colors);
  const seedSql     = generateSeedSql(businessInput);
  const envTemplate = generateEnvTemplate(businessInput);
  const onboarding  = generateOnboarding(businessInput, slug, Boolean(generationResult && !generationResult.fromFallback));

  // ── Write output files ───────────────────────────────────────────
  const outputDir = join(process.cwd(), "output", slug);
  if (existsSync(outputDir)) {
    console.log(`\x1b[33m  ⚠  output/${slug}/ ya existe — sobreescribiendo.\x1b[0m`);
  }
  mkdirSync(outputDir, { recursive: true });

  const files: Array<[string, string]> = [
    ["business.ts",   businessTs],
    ["theme.ts",      themeTs],
    ["seed.sql",      seedSql],
    [".env.template", envTemplate],
    ["ONBOARDING.md", onboarding],
  ];

  if (dna && generationResult) {
    const dnaFile = buildDNAFile(slug, businessInput.nombre, dna, generationResult.usage.model, generationResult.fromFallback);
    files.push(["business-dna.json", JSON.stringify(dnaFile, null, 2)]);
  }

  for (const [filename, content] of files) {
    writeFileSync(join(outputDir, filename), content, "utf-8");
    console.log(`\x1b[32m  ✓\x1b[0m  ${filename.padEnd(20)} → output/${slug}/${filename}`);
  }

  // ── Cost report ──────────────────────────────────────────────────
  if (generationResult && !generationResult.fromFallback) {
    const u = generationResult.usage;
    console.log(`\n  \x1b[90mCosto Claude API: $${u.costUSD.toFixed(5)} USD (${u.inputTokens + u.outputTokens} tokens, modelo: ${u.model}, ${generationResult.attempts} intento${generationResult.attempts > 1 ? "s" : ""})\x1b[0m`);
  } else if (generationResult?.fromFallback) {
    console.log("\n  \x1b[33m⚠  Contenido generado con templates (fallback — Claude no disponible o falló).\x1b[0m");
  }

  // ── Summary ──────────────────────────────────────────────────────
  const elapsed     = ((Date.now() - startMs) / 1000).toFixed(1);
  const totalProds  = businessInput.categorias.reduce((n, c) => n + c.productos.length, 0);
  const modeLabel   = (generationResult && !generationResult.fromFallback) ? "AI (Claude)" : "Manual (templates)";

  console.log("\n" + "─".repeat(62));
  console.log(`\x1b[32m🎉  "${businessInput.nombre}" generado en ${elapsed}s — modo: ${modeLabel}\x1b[0m`);
  console.log("─".repeat(62));
  console.log(`  Slug:        ${slug}`);
  console.log(`  Tipo:        ${businessInput.tipo}`);
  console.log(`  Categorías:  ${businessInput.categorias.length}  |  Productos: ${totalProds}`);
  if (dna) {
    console.log(`  DNA:         archetype=${dna.archetype}, tone=${dna.tone}`);
  }
  console.log(`\n  Siguiente → lee \x1b[36moutput/${slug}/ONBOARDING.md\x1b[0m`);
  console.log("─".repeat(62) + "\n");
}

main().catch((err) => {
  console.error("\n\x1b[31m✗  Error inesperado:\x1b[0m", err);
  process.exit(1);
});
