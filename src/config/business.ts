/**
 * Información del negocio — EDITA AQUÍ.
 * Todos los datos visibles (dirección, teléfono, horarios, precios base, mapa)
 * viven en este archivo para facilitar su actualización sin tocar componentes.
 *
 * Reemplaza los valores marcados como PLACEHOLDER con los datos reales.
 */

export const business = {
  nombre: "Tacos El Compache de Ah Mun",
  lema: "El sabor de casa, más cerca.",
  descripcion:
    "Cada día cocinamos con amor +10 guisos distintos, hechos a fuego lento en cazuelas de barro para que disfrutes los tacos más sabrosos y auténticos como los de casa.",

  // --- Contacto (PLACEHOLDER) ---
  telefono: "+52 999 123 4567",
  // Número en formato internacional sin signos para enlaces wa.me
  whatsapp: "5219991234567",
  email: "hola@elcompache.mx",

  // --- Ubicación (PLACEHOLDER) ---
  direccion: {
    calle: "Calle 60 #123 x 45 y 47",
    colonia: "Col. Centro",
    ciudad: "Mérida, Yucatán",
    cp: "97000",
  },
  // Coordenadas para el mapa (PLACEHOLDER: centro de Mérida)
  coordenadas: { lat: 20.9674, lng: -89.5926 },

  // --- Horario (PLACEHOLDER) ---
  horario: [
    { dias: "Lunes a Viernes", horas: "7:00 – 14:00" },
    { dias: "Sábado y Domingo", horas: "7:00 – 15:00" },
  ],

  // --- Costo de envío a domicilio (en centavos) ---
  costoEnvioCents: 3000, // $30 MXN

  redes: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
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
