import type { Category, Product } from "@/types";

/**
 * Menú estático de respaldo.
 * Se usa cuando Supabase NO está configurado (modo demo) y como referencia
 * para `supabase/seed.sql`. Precios en centavos.
 *
 * Las imágenes apuntan a /public/menu/<slug>.jpg (placeholders). Si el archivo
 * no existe, ProductCard muestra un marcador de posición con degradado de marca.
 */

export const categories: Category[] = [
  { id: "tacos-de-guisos", name: "Tacos de Guisos", slug: "tacos-de-guisos", sort_order: 1 },
  { id: "aguas-y-refrescos", name: "Aguas y Refrescos", slug: "aguas-y-refrescos", sort_order: 2 },
];

const TACO = "tacos-de-guisos";
const BEBIDA = "aguas-y-refrescos";

function img(slug: string): string {
  return `/menu/${slug}.jpg`;
}

export const products: Product[] = [
  {
    id: "birria",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Birria",
    description: "Res deshebrada en su consomé de chiles, suave y jugosa.",
    price_cents: 3500,
    image_url: img("birria"),
    available: true,
    sort_order: 1,
  },
  {
    id: "milanesa-pollo",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Milanesa de Pollo",
    description: "Milanesa de pollo empanizada, crujiente y doradita.",
    price_cents: 3500,
    image_url: img("milanesa-pollo"),
    available: true,
    sort_order: 2,
  },
  {
    id: "mole",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Mole",
    description: "Pollo bañado en mole de la casa, con su toque dulce y picante.",
    price_cents: 3500,
    image_url: img("mole"),
    available: true,
    sort_order: 3,
  },
  {
    id: "chicharron-salsa-verde",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Chicharrón en Salsa Verde",
    description: "Chicharrón guisado a fuego lento en salsa verde de tomatillo.",
    price_cents: 3500,
    image_url: img("chicharron-salsa-verde"),
    available: true,
    sort_order: 4,
  },
  {
    id: "chicharron-prensado",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Chicharrón Prensado",
    description: "Guiso tradicional preparado diariamente, lleno de sabor.",
    price_cents: 3500,
    image_url: img("chicharron-prensado"),
    available: true,
    sort_order: 5,
  },
  {
    id: "tinga-pollo",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Tinga de Pollo",
    description: "Pollo deshebrado en salsa de chipotle con cebolla y jitomate.",
    price_cents: 3500,
    image_url: img("tinga-pollo"),
    available: true,
    sort_order: 6,
  },
  {
    id: "picadillo",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Picadillo",
    description: "Carne molida guisada con papa y zanahoria, sabor casero.",
    price_cents: 3500,
    image_url: img("picadillo"),
    available: true,
    sort_order: 7,
  },
  {
    id: "rajas-elote",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Rajas con Elote",
    description: "Rajas de chile poblano con elote y crema. Vegetariano.",
    price_cents: 3500,
    image_url: img("rajas-elote"),
    available: true,
    sort_order: 8,
  },
  {
    id: "papas-salsa-verde",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Papas en Salsa Verde",
    description: "Papas guisadas en salsa verde, suaves y reconfortantes.",
    price_cents: 3000,
    image_url: img("papas-salsa-verde"),
    available: true,
    sort_order: 9,
  },
  {
    id: "frijoles-puercos",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Frijoles Puercos",
    description: "Frijoles refritos con chorizo y queso, cremosos y sabrosos.",
    price_cents: 3000,
    image_url: img("frijoles-puercos"),
    available: true,
    sort_order: 10,
  },
  {
    id: "carne-deshebrada",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Carne Deshebrada",
    description: "Res deshebrada guisada en salsa roja con especias.",
    price_cents: 3500,
    image_url: img("carne-deshebrada"),
    available: true,
    sort_order: 11,
  },
  {
    id: "pollo-mole",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Pollo en Mole",
    description: "Pollo tierno en mole espeso, receta de familia.",
    price_cents: 3500,
    image_url: img("pollo-mole"),
    available: true,
    sort_order: 12,
  },
  {
    id: "huitlacoche",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Huitlacoche",
    description: "El caviar mexicano, guisado con epazote y cebolla.",
    price_cents: 4000,
    image_url: img("huitlacoche"),
    available: true,
    sort_order: 13,
  },
  {
    id: "machaca-huevo",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Machaca con Huevo",
    description: "Machaca de res revuelta con huevo, ideal para el desayuno.",
    price_cents: 3500,
    image_url: img("machaca-huevo"),
    available: true,
    sort_order: 14,
  },
  {
    id: "nopales-chile",
    category_id: TACO,
    category_slug: TACO,
    name: "Taco de Nopales con Chile",
    description: "Nopales guisados con chile y especias. Vegano.",
    price_cents: 3000,
    image_url: img("nopales-chile"),
    available: true,
    sort_order: 15,
  },

  // --- Aguas y Refrescos ---
  {
    id: "agua-horchata",
    category_id: BEBIDA,
    category_slug: BEBIDA,
    name: "Agua de Horchata",
    description: "Agua fresca de arroz con canela, dulce y refrescante.",
    price_cents: 2500,
    image_url: img("agua-horchata"),
    available: true,
    sort_order: 1,
  },
  {
    id: "agua-jamaica",
    category_id: BEBIDA,
    category_slug: BEBIDA,
    name: "Agua de Jamaica",
    description: "Flor de jamaica natural, ligeramente ácida.",
    price_cents: 2500,
    image_url: img("agua-jamaica"),
    available: true,
    sort_order: 2,
  },
  {
    id: "agua-limon",
    category_id: BEBIDA,
    category_slug: BEBIDA,
    name: "Agua de Limón",
    description: "Limón recién exprimido, bien fría.",
    price_cents: 2500,
    image_url: img("agua-limon"),
    available: true,
    sort_order: 3,
  },
  {
    id: "agua-del-dia",
    category_id: BEBIDA,
    category_slug: BEBIDA,
    name: "Agua del Día",
    description: "Pregunta por el sabor natural de hoy.",
    price_cents: 2500,
    image_url: img("agua-del-dia"),
    available: true,
    sort_order: 4,
  },
  {
    id: "refresco",
    category_id: BEBIDA,
    category_slug: BEBIDA,
    name: "Refresco",
    description: "Refresco embotellado de tu preferencia.",
    price_cents: 2000,
    image_url: img("refresco"),
    available: true,
    sort_order: 5,
  },
];

/** Devuelve el menú estático ordenado por categoría y posición. */
export function getStaticMenu(): { categories: Category[]; products: Product[] } {
  return { categories, products };
}

/** Busca un producto del menú estático por id. */
export function findStaticProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
