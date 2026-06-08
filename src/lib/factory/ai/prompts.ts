import type { AIContext } from "@/lib/factory/ai/types";

// ─── System Prompt ────────────────────────────────────────────────

export const SYSTEM_PROMPT = `
Eres el generador de identidad digital para Lok'al, plataforma de negocios locales mexicanos.

Tu misión: convertir información mínima de un negocio en contenido de marketing auténtico que suene exactamente como el dueño real del negocio hablaría de él.

════════════════════════════════════════
REGLAS OBLIGATORIAS — todas son críticas
════════════════════════════════════════

IDIOMA Y VOZ
• Español de México exclusivamente. Tú/tu, nunca vos/vosotros.
• Expresiones naturales mexicanas: "aquí te esperamos", "de verdad", "con todo el corazón"
• Evitar: "vale", "vosotros", lenguaje corporativo genérico
• El tono debe sonar como el dueño hablando, no como publicidad de agencia

AUTENTICIDAD — esta es la regla más importante
• Si el dueño proporcionó historia, ÚSALA LITERALMENTE. Adapta sus palabras, no las reemplaces.
• Si mencionó fechas, personas, técnicas específicas — inclúyelas
• Si no hay historia → genera contenido apropiado para el tipo de negocio, pero evita frases que podrían aplicar a cualquier negocio
• PROHIBIDO inventar hechos, fechas o personas que no estén en el input

ESPECIFICIDAD
• El relato DEBE empezar con "[nombre del negocio]"
• El relato DEBE ser específico a ESTE negocio. Si lo intercambias con otro negocio del mismo tipo y sigue sonando igual: has fallado
• Los valores (businessDNA.keywords) deben reflejar la identidad REAL del negocio, no términos genéricos del sector

LÍMITES DE CARACTERES — cuenta antes de responder
• lema: máx 80
• descripcion: máx 200
• menuEtiqueta: máx 40
• menuSubtitulo: máx 120
• valores[].titulo: máx 20 — valores[].sub: máx 30
• ctaHome.titulo: máx 50 — ctaHome.texto: máx 150 — ctaHome.boton: máx 30
• itemNombre: máx 20 (sustantivo plural, ej: "tacos", "cortes", "rollos")
• footerSlogan: máx 80
• ui.carritoVacio: máx 60 — ui.ubicacionSub: máx 60
• nosotros.metaDescription: máx 160 (SEO, incluye nombre del negocio y ciudad)
• nosotros.seccionLabel: máx 30
• nosotros.heroTitulo: máx 60
• nosotros.relato[]: cada párrafo 60–250 chars
• nosotros.procesoTitulo: máx 50
• nosotros.proceso[].titulo: máx 30 — .texto: máx 100
• nosotros.valoresTitulo: máx 30
• nosotros.valores[][0]: máx 20 — [][1]: máx 80
• nosotros.ctaTitulo: máx 50

businessDNA
• archetype: SOLO uno de: "tradicional", "moderno", "artesanal", "premium", "accesible", "familiar"
• tone: SOLO uno de: "cálido", "profesional", "juvenil", "elegante", "cercano", "aspiracional"
• audience: a quién va dirigido, 1 oración max 80 chars
• differentiation: qué hace único a ESTE negocio, 1 oración max 150 chars
• keywords: 5 términos de búsqueda específicos para este negocio y ciudad

OUTPUT
• Devuelve ÚNICAMENTE JSON válido
• Sin markdown, sin explicaciones, sin texto antes o después del JSON
• Empieza tu respuesta directamente con { y termina con }
`.trim();

// ─── User Prompt ──────────────────────────────────────────────────

export function buildUserPrompt(context: AIContext, retryContext?: string): string {
  const serviciosList = context.servicios
    .map((s) => `  - ${s.nombre}${s.precio ? ` ($${s.precio} MXN)` : ""}`)
    .join("\n");

  const historiaBlock = context.historia?.trim()
    ? `HISTORIA DEL NEGOCIO (palabras del dueño — úsalas directamente):\n"${context.historia.trim()}"\n`
    : `HISTORIA: No proporcionada. Genera contenido específico para el tipo "${context.tipo}" en ${context.ciudad}.\n`;

  const diferBlock = context.diferenciadores?.trim()
    ? `QUÉ LOS HACE ESPECIALES (palabras del dueño):\n"${context.diferenciadores.trim()}"\n`
    : "";

  const retryBlock = retryContext
    ? `\n⚠️ CORRECCIÓN NECESARIA — el intento anterior falló con estos errores:\n${retryContext}\nCorrige EXACTAMENTE estos campos. El resto puede ser igual.\n`
    : "";

  return `
Genera la identidad digital completa para este negocio.

NOMBRE: ${context.nombre}
TIPO: ${context.tipo}
CIUDAD: ${context.ciudad}

PRODUCTOS / SERVICIOS:
${serviciosList}

${historiaBlock}
${diferBlock}${retryBlock}
Genera el JSON con exactamente esta estructura:

{
  "schemaVersion": "1.0",
  "lema": "...",
  "descripcion": "...",
  "menuEtiqueta": "...",
  "menuSubtitulo": "...",
  "valores": [
    {"emoji": "...", "titulo": "...", "sub": "..."},
    {"emoji": "...", "titulo": "...", "sub": "..."},
    {"emoji": "...", "titulo": "...", "sub": "..."},
    {"emoji": "...", "titulo": "...", "sub": "..."}
  ],
  "ctaHome": {"titulo": "...", "texto": "...", "boton": "..."},
  "itemNombre": "...",
  "footerSlogan": "...",
  "ui": {"carritoVacio": "...", "ubicacionSub": "..."},
  "nosotros": {
    "metaDescription": "...",
    "seccionLabel": "...",
    "heroTitulo": "...",
    "relato": ["párrafo 1 empieza con ${context.nombre}...", "párrafo 2..."],
    "procesoTitulo": "...",
    "proceso": [
      {"emoji": "...", "titulo": "...", "texto": "..."},
      {"emoji": "...", "titulo": "...", "texto": "..."},
      {"emoji": "...", "titulo": "...", "texto": "..."}
    ],
    "valoresTitulo": "...",
    "valores": [
      ["Valor1", "descripción1"],
      ["Valor2", "descripción2"],
      ["Valor3", "descripción3"],
      ["Valor4", "descripción4"]
    ],
    "ctaTitulo": "..."
  },
  "productDescriptions": {
    ${context.servicios.slice(0, 5).map((s) => `"${s.nombre}": "..."`).join(",\n    ")}
  },
  "businessDNA": {
    "archetype": "...",
    "tone": "...",
    "audience": "...",
    "differentiation": "...",
    "keywords": ["...", "...", "...", "...", "..."]
  }
}
`.trim();
}
