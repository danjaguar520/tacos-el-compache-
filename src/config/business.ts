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
