/**
 * CLI source for the Mode Factory.
 *
 * Collects ManualFactualData + AIContext from the terminal.
 * The AI engine (ai/generate.ts) is NOT imported here.
 * This file produces the inputs; it doesn't generate the outputs.
 */

import { input, select, confirm, number } from "@inquirer/prompts";
import type { ManualFactualData, AIContext } from "./ai/types.js";
import type { BusinessType, ThemePreset, FontStyle } from "./types.js";
import { TIPO_DEFAULTS, TYPE_TO_PRESET, THEME_PRESETS } from "./derivations.js";
import { isValidHex } from "./colors.js";
import { toSlug } from "./questions.js";

function section(n: number, total: number, label: string): void {
  console.log(`\n\x1b[36m━━━ PASO ${n}/${total} — ${label} ━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
}

export interface MinimalQuestionsResult {
  manual:    ManualFactualData;
  aiContext: AIContext;
}

export async function runMinimalQuestions(): Promise<MinimalQuestionsResult> {
  const TOTAL = 9;

  // ── Paso 1: Identidad ─────────────────────────────────────────────
  section(1, TOTAL, "Identidad del negocio");

  const nombre = await input({
    message: "Nombre del negocio",
    validate: (v) => v.trim().length >= 2 || "Mínimo 2 caracteres",
  });

  const tipo = await select<BusinessType>({
    message: "Tipo de negocio",
    choices: [
      { value: "restaurante", name: "🍽️  Restaurante / Taquería / Cocina mexicana" },
      { value: "sushi",       name: "🍣  Sushi / Comida japonesa / Asian food" },
      { value: "cafeteria",   name: "☕  Cafetería / Café de especialidad" },
      { value: "barberia",    name: "✂️  Barbería / Peluquería" },
      { value: "estetica",    name: "💅  Estética / Spa / Belleza" },
      { value: "servicios",   name: "🤝  Servicios profesionales" },
      { value: "otro",        name: "⭐  Otro tipo de negocio" },
    ],
  });

  const defaults  = TIPO_DEFAULTS[tipo];
  const slugBase  = toSlug(nombre);
  const palabras  = nombre.split(" ");

  const slug = await input({
    message: "Slug único (para URLs)",
    default: slugBase,
    validate: (v) => /^[a-z0-9-]{2,30}$/.test(v) || "Solo minúsculas, números y guiones (2–30)",
  });

  const logoLinea1 = await input({
    message: "Logo — palabra principal (línea grande)",
    default: palabras[0] ?? nombre,
    validate: (v) => v.trim().length >= 1 || "Requerido",
  });

  const logoLinea2 = await input({
    message: "Logo — subtítulo (línea pequeña)",
    default: palabras.slice(1).join(" ") || nombre,
    validate: (v) => v.trim().length >= 1 || "Requerido",
  });

  const emoji = await input({
    message: "Emoji del negocio",
    default: defaults.emoji,
    validate: (v) => v.trim().length >= 1 || "Requerido",
  });

  const logoType = await select<"text" | "image">({
    message: "Tipo de logo",
    choices: [
      { value: "text",  name: "Tipográfico (recomendado)" },
      { value: "image", name: "Imagen — public/images/logo.png" },
    ],
    default: "text",
  });

  // ── Paso 2: Contacto ──────────────────────────────────────────────
  section(2, TOTAL, "Contacto");

  const telefono = await input({
    message: "Teléfono (con código de país)",
    validate: (v) => /^\+?[\d\s]{7,20}$/.test(v) || "Ej: +52 33 1234 5678",
  });

  const whatsapp = await input({
    message: "WhatsApp (solo dígitos, con código de país, sin +)",
    default: telefono.replace(/\D/g, ""),
    validate: (v) => /^\d{10,15}$/.test(v) || "Solo dígitos. Ej: 523312345678",
  });

  // ── Paso 3: Dirección ─────────────────────────────────────────────
  section(3, TOTAL, "Dirección");

  const calle   = await input({ message: "Calle y número", validate: (v) => v.trim().length >= 5 || "Requerido" });
  const colonia = await input({ message: "Colonia",        validate: (v) => v.trim().length >= 2 || "Requerido" });
  const ciudad  = await input({ message: "Ciudad y Estado (ej: Guadalajara, Jalisco)", validate: (v) => v.trim().length >= 3 || "Requerido" });
  const cp      = await input({ message: "Código Postal",  validate: (v) => /^\d{4,6}$/.test(v) || "4–6 dígitos" });

  const hasCoords = await confirm({ message: "¿Conoces las coordenadas GPS?", default: false });
  let lat: number | null = null;
  let lng: number | null = null;
  if (hasCoords) {
    lat = await number({ message: "Latitud", validate: (v) => (v !== undefined && v >= -90 && v <= 90)   || "Entre -90 y 90" }) ?? null;
    lng = await number({ message: "Longitud", validate: (v) => (v !== undefined && v >= -180 && v <= 180) || "Entre -180 y 180" }) ?? null;
  }

  // ── Paso 4: Horario ───────────────────────────────────────────────
  section(4, TOTAL, "Horario de atención");

  const horario: Array<{ dias: string; horas: string }> = [];
  let addHorario = true;
  while (addHorario) {
    const dias  = await input({ message: `Días del bloque ${horario.length + 1} (ej: Lunes a Viernes)`, validate: (v) => v.trim().length >= 3 || "Requerido" });
    const horas = await input({ message: "Horario (ej: 10:00 – 20:00)", validate: (v) => v.trim().length >= 3 || "Requerido" });
    horario.push({ dias, horas });
    addHorario = await confirm({ message: "¿Agregar otro bloque?", default: false });
  }

  // ── Paso 5: Catálogo ──────────────────────────────────────────────
  section(5, TOTAL, "Catálogo de productos / servicios");
  console.log("  \x1b[90mLas descripciones serán generadas por Claude — solo proporciona nombre y precio.\x1b[0m");

  const categorias: Array<{ nombre: string; slug: string; productos: Array<{ nombre: string; precio: number; descripcion: string }> }> = [];
  let addCat = true;

  while (addCat) {
    const catNombre = await input({ message: `Categoría ${categorias.length + 1}`, validate: (v) => v.trim().length >= 2 || "Mínimo 2 chars" });
    const catSlug   = await input({ message: "Slug", default: toSlug(catNombre), validate: (v) => /^[a-z0-9-]{2,40}$/.test(v) || "Solo minúsculas y guiones" });

    const productos: Array<{ nombre: string; precio: number; descripcion: string }> = [];
    let addProd = true;

    while (addProd) {
      const pNombre = await input({ message: `  Producto / servicio ${productos.length + 1}`, validate: (v) => v.trim().length >= 2 || "Requerido" });
      const pPrecio = await number({ message: "  Precio MXN", validate: (v) => (v !== undefined && v > 0) || "Mayor a 0" }) ?? 0;
      productos.push({ nombre: pNombre, precio: pPrecio, descripcion: "" });
      addProd = await confirm({ message: "  ¿Agregar otro?", default: true });
    }

    categorias.push({ nombre: catNombre, slug: catSlug, productos });
    addCat = await confirm({ message: "¿Agregar otra categoría?", default: false });
  }

  // ── Paso 6: Historia del negocio (→ Claude) ───────────────────────
  section(6, TOTAL, "Historia del negocio");
  console.log("  \x1b[33m★ Esta es la pregunta más importante.\x1b[0m");
  console.log("  Lo que escribas aquí es lo que diferenciará tu sitio de todos los demás.");
  console.log("  Puedes incluir: cuándo abriste, quién te inspiró, qué te hace único,");
  console.log("  historias de clientes, técnicas especiales, premios, tradición familiar.\n");

  const historia = await input({
    message: "Cuéntanos sobre tu negocio (2–5 oraciones, Enter para omitir)",
    default: "",
  });

  const diferenciadores = await input({
    message: "¿Qué hace especial a tu negocio? ¿Por qué los clientes vuelven? (opcional)",
    default: "",
  });

  // ── Paso 7: Paleta visual ─────────────────────────────────────────
  section(7, TOTAL, "Identidad visual");

  const presetRec = TYPE_TO_PRESET[tipo];
  const presetNames: Record<ThemePreset, string> = {
    "warm-mexican":     "Cálido Mexicano (terracota + maíz)",
    "cool-japanese":    "Japonés Minimalista (navy + rojo)",
    "rich-coffee":      "Café Artesanal (café oscuro + ámbar)",
    "classic-barber":   "Barbería Clásica (negro + dorado)",
    "elegant-rose":     "Rosa Elegante (rosa + crema)",
    "professional-blue":"Azul Profesional (azul + gris)",
  };

  console.log(`\n  Paleta recomendada: \x1b[33m"${presetNames[presetRec]}"\x1b[0m`);
  const themeChoice = await select<"recommended" | "other" | "custom">({
    message: "Paleta de colores",
    choices: [
      { value: "recommended", name: `✅ Usar "${presetNames[presetRec]}" (recomendada)` },
      { value: "other",       name: "🎨 Elegir otra paleta" },
      { value: "custom",      name: "🖌️  Ingresar color principal (#hex)" },
    ],
  });

  let themePreset: ThemePreset = presetRec;
  let primaryHex: string | null = null;

  if (themeChoice === "other") {
    themePreset = await select<ThemePreset>({
      message: "Elige la paleta",
      choices: (Object.keys(THEME_PRESETS) as ThemePreset[]).map((k) => ({ value: k, name: presetNames[k] })),
      default: presetRec,
    });
  } else if (themeChoice === "custom") {
    primaryHex = await input({
      message: "Color principal (#RRGGBB)",
      validate: (v) => isValidHex(v) || "Formato inválido. Ej: #1a4a6b",
    });
  }

  const fontStyle = await select<FontStyle>({
    message: "Tipografía para headings",
    choices: [
      { value: "fraunces",  name: "Fraunces — cálida, artesanal (restaurantes, cafés, taquerías)" },
      { value: "cormorant", name: "Cormorant — elegante, refinada (sushi, spa, servicios)" },
    ],
    default: defaults.fontStyle,
  });

  // ── Paso 8: Entrega ───────────────────────────────────────────────
  section(8, TOTAL, "Entrega a domicilio");

  const costoEnvioPesos = await number({
    message: "Costo de envío en MXN (0 si no aplica)",
    default: 0,
    validate: (v) => (v !== undefined && v >= 0) || "0 o mayor",
  }) ?? 0;

  const zonaCobertura = await input({
    message: "Zona de cobertura",
    default: `Todo ${ciudad.split(",")[0].trim()}`,
    validate: (v) => v.trim().length >= 3 || "Requerido",
  });

  // ── Paso 9: Pagos ─────────────────────────────────────────────────
  section(9, TOTAL, "Pagos — Mercado Pago");

  const mpDescriptor = await input({
    message: "Descriptor en extracto bancario (máx 13 chars)",
    default: slug.toUpperCase().replace(/-/g, " ").slice(0, 13),
    validate: (v) => (v.trim().length >= 1 && v.trim().length <= 13) || "1–13 caracteres",
  });

  // ── Build results ─────────────────────────────────────────────────

  const manual: ManualFactualData = {
    nombre, slug, tipo, logoLinea1, logoLinea2, emoji, logoType,
    telefono, whatsapp, calle, colonia, ciudad, cp, lat, lng,
    horario, costoEnvioPesos, zonaCobertura, categorias,
    themePreset, primaryHex, fontStyle, mpDescriptor: mpDescriptor.trim(),
  };

  const aiContext: AIContext = {
    nombre,
    tipo,
    ciudad: ciudad.split(",")[0].trim(),
    servicios: categorias.flatMap((c) => c.productos.map((p) => ({ nombre: p.nombre, precio: p.precio }))),
    historia:        historia.trim()        || undefined,
    diferenciadores: diferenciadores.trim() || undefined,
  };

  return { manual, aiContext };
}
