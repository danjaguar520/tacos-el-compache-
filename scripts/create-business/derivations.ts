import type { BusinessType, ThemePreset, ThemeColors, TypeDefaults } from "./types.js";

// ─── Theme presets ────────────────────────────────────────────────

export const THEME_PRESETS: Record<ThemePreset, ThemeColors> = {
  "warm-mexican": {
    primary:     "#8b2e1d",
    primaryDark: "#6f2417",
    fg:          "#1b1a19",
    bg:          "#f7f2ea",
    border:      "#b35c2e",
    secondary:   "#f4e3b2",
    accent:      "#e8902a",
    success:     "#5a7a45",
  },
  "cool-japanese": {
    primary:     "#1a4a6b",
    primaryDark: "#0f2d40",
    fg:          "#0f1923",
    bg:          "#f5f7fa",
    border:      "#5b8db8",
    secondary:   "#d8eaf7",
    accent:      "#c0392b",
    success:     "#1a7a5a",
  },
  "rich-coffee": {
    primary:     "#4a2c0a",
    primaryDark: "#2d1a06",
    fg:          "#1a1209",
    bg:          "#faf6f0",
    border:      "#8b5e3c",
    secondary:   "#f0e8d8",
    accent:      "#c47a2e",
    success:     "#4a7a3a",
  },
  "classic-barber": {
    primary:     "#1a1a2e",
    primaryDark: "#0d0d1a",
    fg:          "#0d0d1a",
    bg:          "#f5f5f0",
    border:      "#4a4a6b",
    secondary:   "#e8e8f0",
    accent:      "#d4a017",
    success:     "#2a6a4a",
  },
  "elegant-rose": {
    primary:     "#8b3a5c",
    primaryDark: "#6f2d48",
    fg:          "#1a0f14",
    bg:          "#fdf5f8",
    border:      "#c47a9a",
    secondary:   "#f5dce8",
    accent:      "#c08050",
    success:     "#4a7a5a",
  },
  "professional-blue": {
    primary:     "#1a4a8b",
    primaryDark: "#0f2d6f",
    fg:          "#0f1923",
    bg:          "#f5f7fa",
    border:      "#5b7ab8",
    secondary:   "#d8e4f7",
    accent:      "#e87a2e",
    success:     "#2a7a5a",
  },
};

/** Map business type → recommended preset */
export const TYPE_TO_PRESET: Record<BusinessType, ThemePreset> = {
  restaurante: "warm-mexican",
  sushi:       "cool-japanese",
  cafeteria:   "rich-coffee",
  barberia:    "classic-barber",
  estetica:    "elegant-rose",
  servicios:   "professional-blue",
  otro:        "professional-blue",
};

// ─── Type-based content defaults ──────────────────────────────────

export const TIPO_DEFAULTS: Record<BusinessType, TypeDefaults> = {
  restaurante: {
    emoji:              "🍽️",
    fontStyle:          "fraunces",
    themePreset:        "warm-mexican",
    lemaTpl:            "El sabor casero que buscabas en {ciudad}.",
    descripcionTpl:     "{nombre} — cocina casera con ingredientes frescos y recetas de familia en {ciudad}. Ven a disfrutar el verdadero sabor del día.",
    menuEtiqueta:       "Especialidades del día",
    menuSubtitulo:      "Preparado con ingredientes frescos. Elige tus favoritos y agrégalos al pedido.",
    footerSloganTpl:    "{nombre} · Cocina casera · Todos los días",
    carritoVacio:       "Agrega tus platillos favoritos al pedido.",
    ubicacionSub:       "Te esperamos con la mesa lista.",
    itemNombre:         "platillos",
    catalogoLabel:      "Menú",
    nosotrosLabel:      "Nuestra Historia",
    nosotrosHeroTitulo: "Cocinamos con amor, como en casa",
    relatoTpl: [
      "nació de una idea sencilla: traer la cocina de verdad a {ciudad}. Desde el primer día nos propusimos usar ingredientes frescos, recetas de familia y mucho amor en cada platillo.",
      "Hoy seguimos fieles a esa filosofía. Cada día preparamos nuestra carta con productos del día, sin atajos y sin compromiso. Porque creemos que una buena comida cambia el día.",
    ],
    procesoTitulo: "Así preparamos tus platillos",
    proceso: [
      { emoji: "🌅", titulo: "Empezamos temprano",   texto: "Preparamos todo desde el amanecer para que cuando llegues, esté perfecto." },
      { emoji: "🛒", titulo: "Ingredientes frescos", texto: "Trabajamos con proveedores locales y materia prima del día, sin excepción." },
      { emoji: "🍽️", titulo: "Servido al momento",   texto: "Tu platillo se prepara cuando ordenas. Sin batch, sin microondas." },
    ],
    valoresTitulo: "Lo que nos mueve",
    valores: [
      { emoji: "🍳", titulo: "Cocina fresca",  sub: "ingredientes del día"  },
      { emoji: "❤️", titulo: "Hecho con amor", sub: "recetas de familia"    },
      { emoji: "⚡", titulo: "Al momento",     sub: "listo cuando ordenas"  },
      { emoji: "🌟", titulo: "Calidad",         sub: "sin compromisos"       },
    ],
    valoresMarca: [
      ["Frescura",    "Todo se prepara el mismo día."],
      ["Tradición",   "Recetas que vienen de generaciones anteriores."],
      ["Cercanía",    "Te atendemos como si fueras de la familia."],
      ["Honestidad",  "Lo que ves en el menú es lo que recibes."],
    ],
    ctaHomeTitulo: "El sabor que recordarás",
    ctaHomeTpl:    "Cada visita es una experiencia única. Ven y descubre por qué somos el favorito del barrio.",
    ctaBoton:      "Conoce nuestra historia",
    nosotrosCtaTitulo: "¿Listo para ordenar?",
  },

  sushi: {
    emoji:              "🍣",
    fontStyle:          "cormorant",
    themePreset:        "cool-japanese",
    lemaTpl:            "Sushi fresco con tradición japonesa en {ciudad}.",
    descripcionTpl:     "{nombre} — rolls artesanales preparados al momento con pescado fresco. Tradición japonesa auténtica en {ciudad}.",
    menuEtiqueta:       "Rolls del día",
    menuSubtitulo:      "Elaborados al momento con pescado fresco. Elige tus favoritos.",
    footerSloganTpl:    "{nombre} · Sushi fresco · Tradición japonesa",
    carritoVacio:       "Agrega tus rolls favoritos al pedido.",
    ubicacionSub:       "Te esperamos para una experiencia auténtica.",
    itemNombre:         "rolls",
    catalogoLabel:      "Menú",
    nosotrosLabel:      "Nuestra Historia",
    nosotrosHeroTitulo: "Tradición japonesa, sabor auténtico",
    relatoTpl: [
      "nació del sueño de traer el sushi auténtico a {ciudad}. Desde el inicio nos propusimos una sola regla: ingredientes frescos, técnica honesta, sin atajos.",
      "Hoy, cada roll que preparamos lleva detrás décadas de técnica japonesa y el compromiso de servir siempre lo mejor. El pescado llega hoy, se sirve hoy.",
    ],
    procesoTitulo: "Cómo preparamos tus rolls",
    proceso: [
      { emoji: "🌅", titulo: "Llegada del pescado",  texto: "Cada mañana recibimos ingredientes frescos directamente de nuestro proveedor." },
      { emoji: "🍚", titulo: "El arroz es todo",      texto: "Cocemos el arroz con el método tradicional japonés. La base de cualquier buen sushi." },
      { emoji: "🔪", titulo: "Preparado frente a ti", texto: "Nuestros chefs arman cada roll al momento del pedido. Sin conservadores." },
    ],
    valoresTitulo: "Lo que nos define",
    valores: [
      { emoji: "🐟", titulo: "Pesca fresca",  sub: "del día, sin congelados" },
      { emoji: "🎌", titulo: "Tradición",     sub: "técnica japonesa"        },
      { emoji: "🔪", titulo: "Al momento",    sub: "preparado frente a ti"   },
      { emoji: "♻️", titulo: "Sostenible",    sub: "pesca responsable"       },
    ],
    valoresMarca: [
      ["Frescura",       "Sin congelados. El pescado llega hoy, se sirve hoy."],
      ["Tradición",      "Técnica japonesa auténtica, transmitida con dedicación."],
      ["Sostenibilidad", "Proveemos de pesqueros con prácticas responsables."],
      ["Hospitalidad",   "Omotenashi — el arte japonés de recibir con el corazón."],
    ],
    ctaHomeTitulo: "El auténtico sabor japonés",
    ctaHomeTpl:    "Cada roll cuenta una historia de tradición, frescura y dedicación. Descúbrelo hoy.",
    ctaBoton:      "Conoce nuestra historia",
    nosotrosCtaTitulo: "¿Listo para tu primer roll?",
  },

  cafeteria: {
    emoji:              "☕",
    fontStyle:          "fraunces",
    themePreset:        "rich-coffee",
    lemaTpl:            "El café de especialidad que {ciudad} merecía.",
    descripcionTpl:     "{nombre} — café de especialidad con granos de origen, tostados y preparados con técnica para transformar tu día en {ciudad}.",
    menuEtiqueta:       "Nuestra carta",
    menuSubtitulo:      "Bebidas preparadas con granos seleccionados. Elige tu favorito.",
    footerSloganTpl:    "{nombre} · Café de especialidad · Cada día",
    carritoVacio:       "Agrega tus bebidas favoritas al pedido.",
    ubicacionSub:       "Te esperamos con el café listo.",
    itemNombre:         "bebidas",
    catalogoLabel:      "Carta",
    nosotrosLabel:      "Nuestra Historia",
    nosotrosHeroTitulo: "El café que transforma el día",
    relatoTpl: [
      "nació de la pasión por el buen café en {ciudad}. Buscamos granos de origen, los tostamos con cuidado y los preparamos con la técnica correcta para que cada taza sea una experiencia.",
      "Creemos que el café tiene el poder de transformar un día ordinario en algo memorable. Por eso cada taza que servimos lleva dedicación, técnica y mucho respeto al grano.",
    ],
    procesoTitulo: "Así preparamos tu café",
    proceso: [
      { emoji: "🌱", titulo: "Granos de origen",  texto: "Trabajamos con productores que cuidan el proceso desde la siembra." },
      { emoji: "🔥", titulo: "Tueste preciso",    texto: "Controlamos el tueste para resaltar los mejores atributos de cada grano." },
      { emoji: "☕", titulo: "Preparación exacta", texto: "Cada extracción se hace con gramaje y temperatura exactos para el mejor resultado." },
    ],
    valoresTitulo: "Lo que nos mueve",
    valores: [
      { emoji: "🌱", titulo: "Origen",      sub: "granos seleccionados"   },
      { emoji: "🔥", titulo: "Técnica",     sub: "extracción perfecta"    },
      { emoji: "❤️", titulo: "Pasión",      sub: "en cada taza"          },
      { emoji: "🌿", titulo: "Sostenible",  sub: "comercio justo"         },
    ],
    valoresMarca: [
      ["Calidad",    "Solo trabajamos con granos de especialidad."],
      ["Técnica",    "Baristas formados y apasionados por el café."],
      ["Comunidad",  "Apoyamos productores locales y de comercio justo."],
      ["Experiencia","Cada visita debe ser un momento especial."],
    ],
    ctaHomeTitulo: "El café que mereces",
    ctaHomeTpl:    "Ven y descubre por qué somos el espacio favorito de {ciudad} para disfrutar un buen café.",
    ctaBoton:      "Conoce nuestra historia",
    nosotrosCtaTitulo: "¿Listo para tu primera taza?",
  },

  barberia: {
    emoji:              "✂️",
    fontStyle:          "fraunces",
    themePreset:        "classic-barber",
    lemaTpl:            "Arte, tradición y precisión en {ciudad}.",
    descripcionTpl:     "{nombre} — barbería con maestros del oficio en {ciudad}. Cortes, barba y estilo para el hombre de hoy.",
    menuEtiqueta:       "Nuestros servicios",
    menuSubtitulo:      "Cortes y estilos a cargo de maestros barberos. Elige tu servicio.",
    footerSloganTpl:    "{nombre} · Con estilo y precisión",
    carritoVacio:       "Agrega los servicios que deseas al pedido.",
    ubicacionSub:       "Te esperamos en la silla.",
    itemNombre:         "servicios",
    catalogoLabel:      "Servicios",
    nosotrosLabel:      "El Equipo",
    nosotrosHeroTitulo: "Arte, tradición y precisión",
    relatoTpl: [
      "nació de la pasión por el oficio en {ciudad}. La barbería no es solo un corte — es un ritual, una conversación, un momento para el hombre de hoy.",
      "Con años de experiencia y formación continua, nuestro equipo domina las técnicas clásicas y las tendencias actuales para que cada cliente salga con exactamente el estilo que buscaba.",
    ],
    procesoTitulo: "Nuestro proceso",
    proceso: [
      { emoji: "🗣️", titulo: "Consulta", texto: "Escuchamos lo que buscas antes de tomar las tijeras. Tu estilo es la guía." },
      { emoji: "✂️", titulo: "El corte",  texto: "Técnica precisa, tijera afilada y atención al detalle en cada milímetro." },
      { emoji: "🪒", titulo: "El acabado", texto: "Navaja, productos y el toque final que marca la diferencia." },
    ],
    valoresTitulo: "Lo que nos define",
    valores: [
      { emoji: "✂️", titulo: "Precisión",  sub: "cada corte importa"     },
      { emoji: "🎓", titulo: "Experiencia", sub: "años de oficio"         },
      { emoji: "🤝", titulo: "Confianza",   sub: "relación de largo plazo" },
      { emoji: "⚡", titulo: "Puntualidad", sub: "respetamos tu tiempo"   },
    ],
    valoresMarca: [
      ["Precisión",   "Cada corte es un trabajo de detalle y cuidado."],
      ["Tradición",   "Técnicas clásicas que no pasan de moda."],
      ["Confianza",   "El cliente vuelve porque sabe lo que va a recibir."],
      ["Profesionalismo", "Puntualidad, limpieza y respeto siempre."],
    ],
    ctaHomeTitulo: "Tu mejor versión",
    ctaHomeTpl:    "No es solo un corte. Es la confianza de salir sabiendo que te ves exactamente como quieres.",
    ctaBoton:      "Conoce al equipo",
    nosotrosCtaTitulo: "¿Listo para el cambio?",
  },

  estetica: {
    emoji:              "💅",
    fontStyle:          "cormorant",
    themePreset:        "elegant-rose",
    lemaTpl:            "Belleza con propósito en {ciudad}.",
    descripcionTpl:     "{nombre} — estética con tratamientos profesionales y productos de calidad en {ciudad}. Porque mereces lo mejor.",
    menuEtiqueta:       "Nuestros tratamientos",
    menuSubtitulo:      "Cuídate con los mejores tratamientos. Elige tu favorito.",
    footerSloganTpl:    "{nombre} · Belleza con propósito",
    carritoVacio:       "Agrega los tratamientos que deseas al pedido.",
    ubicacionSub:       "Te esperamos para consentirte.",
    itemNombre:         "tratamientos",
    catalogoLabel:      "Tratamientos",
    nosotrosLabel:      "Nuestra Misión",
    nosotrosHeroTitulo: "Belleza que va más allá del espejo",
    relatoTpl: [
      "nació con la misión de crear un espacio donde cada persona se sienta especial y cuidada en {ciudad}. Creemos que la belleza es bienestar y el bienestar cambia todo.",
      "Nuestro equipo está formado y certificado para ofrecerte los mejores tratamientos con productos de primera calidad. Porque te mereces lo mejor.",
    ],
    procesoTitulo: "Cómo trabajamos",
    proceso: [
      { emoji: "💬", titulo: "Diagnóstico",   texto: "Analizamos tu tipo de piel o cabello antes de recomendar cualquier tratamiento." },
      { emoji: "✨", titulo: "El tratamiento", texto: "Productos de calidad, técnica certificada y mucha atención personalizada." },
      { emoji: "🌟", titulo: "El resultado",   texto: "Saldrás sintiéndote renovada y lista para conquistar tu día." },
    ],
    valoresTitulo: "Nuestra filosofía",
    valores: [
      { emoji: "✨", titulo: "Calidad",     sub: "productos premium"         },
      { emoji: "💆", titulo: "Bienestar",   sub: "más que estética"          },
      { emoji: "🎓", titulo: "Expertise",   sub: "equipo certificado"        },
      { emoji: "❤️", titulo: "Cuidado",     sub: "atención personalizada"    },
    ],
    valoresMarca: [
      ["Calidad",       "Solo usamos productos probados y certificados."],
      ["Personalización","Cada cliente recibe atención única según sus necesidades."],
      ["Conocimiento",   "Equipo formado y actualizado constantemente."],
      ["Bienestar",      "Queremos que salgas mejor por dentro y por fuera."],
    ],
    ctaHomeTitulo: "Mereces lo mejor",
    ctaHomeTpl:    "Un espacio pensado para ti, donde cada visita es un momento de cuidado y transformación.",
    ctaBoton:      "Conoce nuestra misión",
    nosotrosCtaTitulo: "¿Lista para consentirte?",
  },

  servicios: {
    emoji:              "🤝",
    fontStyle:          "cormorant",
    themePreset:        "professional-blue",
    lemaTpl:            "Tu aliado profesional en {ciudad}.",
    descripcionTpl:     "{nombre} — servicios profesionales con compromiso y excelencia en {ciudad}. Resolvemos lo que necesitas.",
    menuEtiqueta:       "Nuestros servicios",
    menuSubtitulo:      "Soluciones profesionales para tus necesidades. Elige el servicio que buscas.",
    footerSloganTpl:    "{nombre} · Tu aliado profesional",
    carritoVacio:       "Agrega los servicios que necesitas al pedido.",
    ubicacionSub:       "Te esperamos para atenderte.",
    itemNombre:         "servicios",
    catalogoLabel:      "Servicios",
    nosotrosLabel:      "Quiénes Somos",
    nosotrosHeroTitulo: "Profesionalismo y compromiso",
    relatoTpl: [
      "nació para ofrecer servicios profesionales de calidad en {ciudad}. Desde el primer día nos comprometimos a resolver las necesidades de nuestros clientes con excelencia y puntualidad.",
      "Nuestro equipo tiene la experiencia y las herramientas para ofrecerte resultados concretos. Somos tu aliado de confianza.",
    ],
    procesoTitulo: "Cómo trabajamos",
    proceso: [
      { emoji: "📋", titulo: "Diagnóstico",  texto: "Entendemos tu necesidad antes de proponer una solución." },
      { emoji: "⚙️", titulo: "Ejecución",   texto: "Trabajamos con eficiencia y calidad en cada detalle." },
      { emoji: "✅", titulo: "Seguimiento",  texto: "No terminamos hasta que el resultado sea el esperado." },
    ],
    valoresTitulo: "Nuestros valores",
    valores: [
      { emoji: "🎯", titulo: "Resultados", sub: "enfocados en entregar" },
      { emoji: "⏰", titulo: "Puntualidad", sub: "respetamos tu tiempo" },
      { emoji: "🔒", titulo: "Confianza",   sub: "transparencia total"  },
      { emoji: "🌟", titulo: "Calidad",     sub: "sin compromisos"      },
    ],
    valoresMarca: [
      ["Profesionalismo", "Cada servicio se entrega con excelencia y cuidado."],
      ["Puntualidad",     "Cumplimos los tiempos acordados, siempre."],
      ["Transparencia",   "Comunicación clara en todo momento."],
      ["Compromiso",      "No paramos hasta que el cliente esté satisfecho."],
    ],
    ctaHomeTitulo: "Tu aliado de confianza",
    ctaHomeTpl:    "Llevamos años resolviendo los retos de nuestros clientes. Hablemos de los tuyos.",
    ctaBoton:      "Conoce quiénes somos",
    nosotrosCtaTitulo: "¿Listo para trabajar juntos?",
  },

  otro: {
    emoji:              "⭐",
    fontStyle:          "fraunces",
    themePreset:        "professional-blue",
    lemaTpl:            "Calidad y dedicación en {ciudad}.",
    descripcionTpl:     "{nombre} — negocio local con calidad y compromiso en {ciudad}. Siempre listos para servirte.",
    menuEtiqueta:       "Nuestros productos",
    menuSubtitulo:      "Descubre lo que tenemos para ti. Elige tu favorito.",
    footerSloganTpl:    "{nombre} · Con calidad y dedicación",
    carritoVacio:       "Agrega productos al pedido.",
    ubicacionSub:       "Te esperamos.",
    itemNombre:         "productos",
    catalogoLabel:      "Catálogo",
    nosotrosLabel:      "Quiénes Somos",
    nosotrosHeroTitulo: "Calidad y dedicación en todo lo que hacemos",
    relatoTpl: [
      "nació para servir a {ciudad} con dedicación y calidad. Desde el primer día nos comprometimos con nuestros clientes a dar lo mejor.",
      "Cada día trabajamos para mejorar y ofrecerte una experiencia que valga la pena. Somos un negocio local comprometido con la comunidad.",
    ],
    procesoTitulo: "Cómo trabajamos",
    proceso: [
      { emoji: "🎯", titulo: "Tu necesidad",  texto: "Escuchamos lo que buscas para ofrecerte exactamente eso." },
      { emoji: "⚙️", titulo: "Nuestro proceso", texto: "Trabajamos con cuidado y atención al detalle en cada pedido." },
      { emoji: "✅", titulo: "Resultado",      texto: "Entregamos lo que prometemos, siempre." },
    ],
    valoresTitulo: "Lo que nos mueve",
    valores: [
      { emoji: "🌟", titulo: "Calidad",     sub: "sin compromisos"   },
      { emoji: "❤️", titulo: "Pasión",      sub: "en lo que hacemos" },
      { emoji: "🤝", titulo: "Confianza",   sub: "relación duradera" },
      { emoji: "⚡", titulo: "Agilidad",    sub: "respuesta rápida"  },
    ],
    valoresMarca: [
      ["Calidad",    "Cada producto/servicio pasa por nuestro estándar de excelencia."],
      ["Honestidad", "Siempre transparentes con nuestros clientes."],
      ["Compromiso", "Nos importa que quedes satisfecho."],
      ["Comunidad",  "Somos parte de {ciudad} y eso nos enorgullece."],
    ],
    ctaHomeTitulo: "Conoce lo que hacemos",
    ctaHomeTpl:    "Somos un negocio local comprometido con darte la mejor experiencia posible.",
    ctaBoton:      "Conoce quiénes somos",
    nosotrosCtaTitulo: "¿Listo para conocernos?",
  },
};

/** Interpolate {nombre} and {ciudad} placeholders in template strings. */
export function interpolate(
  tpl: string,
  vars: { nombre: string; ciudad: string; itemNombre?: string },
): string {
  return tpl
    .replace(/\{nombre\}/g, vars.nombre)
    .replace(/\{ciudad\}/g, vars.ciudad)
    .replace(/\{itemNombre\}/g, vars.itemNombre ?? "");
}

/** Get the recommended preset for a business type. */
export function getPresetForType(tipo: BusinessType): ThemePreset {
  return TYPE_TO_PRESET[tipo];
}

/** Get the theme colors for a preset, optionally overriding the primary. */
export function resolveThemeColors(
  preset: ThemePreset,
  primaryOverride: string | null,
): ThemeColors {
  const base = { ...THEME_PRESETS[preset] };
  if (primaryOverride) {
    base.primary = primaryOverride;
    // Keep the rest of the preset — the operator chose it for harmony.
    // Sprint 5B can add algorithmic derivation from the override color.
  }
  return base;
}
