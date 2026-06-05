/**
 * Información del negocio — EDITA AQUÍ.
 * Todos los datos visibles (dirección, teléfono, horarios, precios base, mapa)
 * viven en este archivo para facilitar su actualización sin tocar componentes.
 */

export const business = {
  nombre: "Tacos el Compache de Ah Mun",
  lema: "Los únicos tacos que valen su peso!",
  descripcion:
    "Los mejores tacos de guisos mexicanos en todo Playa del Carmen.",

  // --- Contacto ---
  telefono: "+52 984 179 1883",
  // Número en formato internacional sin signos para enlaces wa.me
  whatsapp: "529841791883",

  // --- Ubicación ---
  direccion: {
    calle: "Calle Playa Majahua 282",
    colonia: "Misión Villamar",
    ciudad: "Playa del Carmen, Quintana Roo",
    cp: "77725",
  },
  coordenadas: { lat: 20.666421, lng: -87.066089 },

  // --- Horario ---
  horario: [
    { dias: "Lunes a Viernes", horas: "8:30 – 16:30" },
    { dias: "Sábado",          horas: "8:30 – 14:30" },
    { dias: "Domingo",         horas: "Cerrado" },
  ],

  // --- Entrega ---
  costoEnvioCents: 5000, // $50 MXN
  zonaCobertura: "Todo Playa del Carmen",

  // --- Identidad visual del logo ---
  logoLinea1: "Tacos",
  logoLinea2: "El Compache de Ah Mun",
  emoji: "🌮",

  // --- Catálogo / Menú ---
  categoriaDestacada: "tacos-de-guisos",
  menuEtiqueta: "Hoy +10 guisos distintos",
  menuSubtitulo:
    "Hechos a fuego lento en cazuela de barro. Elige tus favoritos y agrégalos al carrito.",

  // --- Propuesta de valor (home) ---
  valores: [
    { emoji: "🍲", titulo: "+10 guisos",  sub: "distintos cada día"  },
    { emoji: "🔥", titulo: "Fuego lento", sub: "en cazuela de barro" },
    { emoji: "❤️", titulo: "Recetas",     sub: "de familia"          },
    { emoji: "🌮", titulo: "Al momento",  sub: "tacos recién hechos" },
  ],

  // --- CTA inferior home ---
  ctaHome: {
    titulo: "Tradición en cada taco",
    texto:  "Cocinamos como en casa, con recetas de familia y los guisos que reconforten el alma.",
    boton:  "Conoce nuestra historia",
  },

  // --- Textos del pedido ---
  itemNombre: "tacos",

  // --- Integración Mercado Pago ---
  mpDescriptor: "EL COMPACHE", // máx 13 chars — aparece en extracto bancario del cliente

  // --- Slug único del negocio (deriva claves de sesión) ---
  slug: "compache",

  // --- Navegación (etiquetas visibles en header, footer y bottom nav) ---
  nav: {
    catalogoLabel: "Menú",
    nosotrosLabel: "¿Quiénes Somos?",
  },

  // --- Footer ---
  footerSlogan: "Tacos de guisos · Hechos con amor · Todos los días",

  // --- Textos UI menores ---
  ui: {
    carritoVacio: "Antójate de unos buenos tacos de guiso.",
    ubicacionSub: "Te esperamos con la cazuela lista.",
  },

  // --- Página Nosotros ---
  nosotros: {
    metaDescription:
      "La historia de Tacos El Compache de Ah Mun: tradición familiar, guisos a fuego lento y el sabor de casa.",
    seccionLabel: "Nuestra historia",
    heroTitulo:   "Cocinamos con amor, como en casa",
    // El primer párrafo se antepone con business.nombre en el componente.
    relato: [
      "nació de una idea sencilla: que cualquiera pudiera sentarse a comer unos tacos de guiso como los que se preparan en una cocina mexicana de verdad. Sin atajos, sin polvos, sin prisa.",
      "Todo se cocina a fuego lento en cazuelas de barro. Es la forma en que lo hacían nuestras abuelas y es la única manera de lograr ese sabor profundo, hogareño, que reconforta. Por eso cada día preparamos +10 guisos distintos, frescos y hechos al momento.",
    ],
    procesoTitulo: "Así preparamos tus tacos",
    proceso: [
      {
        emoji: "🌅",
        titulo: "Antes del amanecer",
        texto: "Encendemos la lumbre y empezamos a guisar. Cada cazuela lleva su tiempo, sin prisas.",
      },
      {
        emoji: "🍲",
        titulo: "Más de 10 guisos",
        texto: "Birria, mole, tinga, chicharrón en salsa verde, rajas… recetas que pasaron de generación en generación.",
      },
      {
        emoji: "🫓",
        titulo: "Al momento",
        texto: "Calentamos la tortilla y servimos el taco recién hecho, como debe ser, con su salsa y limón.",
      },
    ],
    valoresTitulo: "Lo que nos mueve",
    valores: [
      ["Tradición",    "Recetas de familia que respetamos al pie de la letra."],
      ["Frescura",     "Guisado del día, nunca de ayer."],
      ["Cercanía",     "Un trato cálido, como recibir visita en casa."],
      ["Autenticidad", "Sabor mexicano honesto, sin pretensiones."],
    ],
    ctaTitulo: "¿Listo para probarlos?",
  },
} as const;

/** Dirección en una sola línea, lista para mostrar o para Google Maps. */
export function direccionCompleta(): string {
  const d = business.direccion;
  return `${d.calle}, ${d.colonia}, ${d.ciudad}, ${d.cp}`;
}

/** URL de embed de Google Maps (no requiere API key). */
export function mapsEmbedUrl(): string {
  const q = encodeURIComponent(direccionCompleta());
  return `https://maps.google.com/maps?q=${q}&z=16&output=embed`;
}

/** URL "Cómo llegar" (abre direcciones en Google Maps). */
export function comoLlegarUrl(): string {
  const q = encodeURIComponent(direccionCompleta());
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}

/** Enlace de WhatsApp con mensaje opcional. */
export function whatsappUrl(mensaje?: string): string {
  const base = `https://wa.me/${business.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
