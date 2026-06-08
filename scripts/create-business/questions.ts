import { input, select, confirm, number } from "@inquirer/prompts";
import type {
  BusinessInput, BusinessType, ThemePreset, FontStyle,
  HorarioBloque, Categoria, Producto,
} from "./types.js";
import { TIPO_DEFAULTS, TYPE_TO_PRESET, THEME_PRESETS } from "./derivations.js";
import { isValidHex } from "./colors.js";

// ─── Helpers ──────────────────────────────────────────────────────

/** Convert a business name to a URL-safe slug. */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

/** Extract digits only for WhatsApp format. */
function toWhatsapp(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Auto-generate mpDescriptor from slug (max 13 chars, uppercase). */
function toDescriptor(slug: string): string {
  return slug.toUpperCase().replace(/-/g, " ").slice(0, 13);
}

/** Print a section header. */
function section(n: number, total: number, label: string): void {
  console.log(`\n\x1b[36m━━━ PASO ${n}/${total} — ${label} ━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
}

// ─── Main question flow ───────────────────────────────────────────

export async function runQuestions(): Promise<BusinessInput> {
  const TOTAL = 8;

  // ── Paso 1: Identity ─────────────────────────────────────────────
  section(1, TOTAL, "Identidad del negocio");

  const nombre = await input({
    message: "Nombre del negocio",
    validate: (v) => v.trim().length >= 2 || "Mínimo 2 caracteres",
  });

  const tipo = await select<BusinessType>({
    message: "Tipo de negocio",
    choices: [
      { value: "restaurante", name: "🍽️  Restaurante / Taquería / Cocina" },
      { value: "sushi",       name: "🍣  Sushi / Comida japonesa / Asian food" },
      { value: "cafeteria",   name: "☕  Cafetería / Café de especialidad" },
      { value: "barberia",    name: "✂️  Barbería / Peluquería" },
      { value: "estetica",    name: "💅  Estética / Spa / Belleza" },
      { value: "servicios",   name: "🤝  Servicios profesionales" },
      { value: "otro",        name: "⭐  Otro tipo de negocio" },
    ],
  });

  const defaults = TIPO_DEFAULTS[tipo];
  const slugSugerido = toSlug(nombre);

  const slug = await input({
    message: "Slug único (para URLs, sin espacios)",
    default: slugSugerido,
    validate: (v) => /^[a-z0-9-]{2,30}$/.test(v) || "Solo letras minúsculas, números y guiones (2–30 chars)",
  });

  const logoLinea1 = await input({
    message: "Logo — línea grande (la palabra principal)",
    default: nombre.split(" ")[0],
    validate: (v) => v.trim().length >= 1 || "Requerido",
  });

  const logoLinea2 = await input({
    message: "Logo — línea pequeña (subtítulo)",
    default: nombre.split(" ").slice(1).join(" ") || nombre,
    validate: (v) => v.trim().length >= 1 || "Requerido",
  });

  const emoji = await input({
    message: "Emoji del negocio (para el logo y UI)",
    default: defaults.emoji,
    validate: (v) => v.trim().length >= 1 || "Requerido",
  });

  const logoTypeRaw = await select<"text" | "image">({
    message: "Tipo de logo",
    choices: [
      { value: "text",  name: "Tipográfico — usa las líneas de texto (recomendado)" },
      { value: "image", name: "Imagen — usar public/images/logo.png" },
    ],
    default: "text",
  });

  const ciudad = await input({
    message: "Ciudad (para textos — ej: 'Guadalajara' o 'Playa del Carmen')",
    validate: (v) => v.trim().length >= 2 || "Requerido",
  });

  const lema = await input({
    message: "Lema del negocio (tagline corto)",
    default: defaults.lemaTpl.replace("{ciudad}", ciudad).replace("{nombre}", nombre),
    validate: (v) => v.trim().length >= 5 || "Mínimo 5 caracteres",
  });

  const descripcion = await input({
    message: "Descripción (1–3 oraciones para meta tags y SEO)",
    default: defaults.descripcionTpl.replace("{ciudad}", ciudad).replace("{nombre}", nombre),
    validate: (v) => v.trim().length >= 10 || "Mínimo 10 caracteres",
  });

  // ── Paso 2: Contact ───────────────────────────────────────────────
  section(2, TOTAL, "Contacto");

  const telefono = await input({
    message: "Teléfono (con código de país, ej: +52 984 179 1883)",
    validate: (v) => /^\+?[\d\s]{7,20}$/.test(v) || "Formato inválido. Ej: +52 33 1234 5678",
  });

  const whatsapp = await input({
    message: "WhatsApp (solo dígitos, con código de país, sin +)",
    default: toWhatsapp(telefono),
    validate: (v) => /^\d{10,15}$/.test(v) || "Solo dígitos (10–15). Ej: 523312345678",
  });

  // ── Paso 3: Address ───────────────────────────────────────────────
  section(3, TOTAL, "Dirección");

  const calle = await input({
    message: "Calle y número",
    validate: (v) => v.trim().length >= 5 || "Mínimo 5 caracteres",
  });

  const colonia = await input({
    message: "Colonia / Fraccionamiento",
    validate: (v) => v.trim().length >= 2 || "Requerido",
  });

  const ciudadDireccion = await input({
    message: "Ciudad y Estado (para la dirección completa)",
    default: ciudad,
    validate: (v) => v.trim().length >= 3 || "Requerido",
  });

  const cp = await input({
    message: "Código Postal",
    validate: (v) => /^\d{4,6}$/.test(v) || "4–6 dígitos",
  });

  const hasCoords = await confirm({
    message: "¿Conoces las coordenadas GPS del negocio?",
    default: false,
  });

  let lat: number | null = null;
  let lng: number | null = null;

  if (hasCoords) {
    lat = await number({
      message: "Latitud (ej: 20.6736)",
      validate: (v) => (v !== undefined && v >= -90 && v <= 90) || "Debe estar entre -90 y 90",
    }) ?? null;
    lng = await number({
      message: "Longitud (ej: -103.3445)",
      validate: (v) => (v !== undefined && v >= -180 && v <= 180) || "Debe estar entre -180 y 180",
    }) ?? null;
  }

  // ── Paso 4: Hours ─────────────────────────────────────────────────
  section(4, TOTAL, "Horario de atención");

  const horario: HorarioBloque[] = [];
  let addHorario = true;
  while (addHorario) {
    const dias = await input({
      message: `Días del bloque ${horario.length + 1} (ej: Lunes a Viernes)`,
      validate: (v) => v.trim().length >= 3 || "Requerido",
    });
    const horas = await input({
      message: `Horario (ej: 8:30 – 20:00)`,
      validate: (v) => v.trim().length >= 3 || "Requerido",
    });
    horario.push({ dias, horas });
    addHorario = await confirm({ message: "¿Agregar otro bloque de horario?", default: false });
  }

  // ── Paso 5: Delivery ──────────────────────────────────────────────
  section(5, TOTAL, "Entrega a domicilio");

  const costoEnvioPesos = await number({
    message: "Costo de envío a domicilio en MXN (0 si no ofreces delivery)",
    default: 0,
    validate: (v) => (v !== undefined && v >= 0) || "Debe ser 0 o mayor",
  }) ?? 0;

  const zonaCobertura = await input({
    message: "Zona de cobertura (ej: Todo Guadalajara)",
    default: `Todo ${ciudad}`,
    validate: (v) => v.trim().length >= 3 || "Requerido",
  });

  // ── Paso 6: Visual theme ──────────────────────────────────────────
  section(6, TOTAL, "Identidad visual");

  const recommendedPreset = TYPE_TO_PRESET[tipo];
  const presetNames: Record<ThemePreset, string> = {
    "warm-mexican":     "Cálido Mexicano (terracota + maíz)",
    "cool-japanese":    "Japonés Minimalista (navy + rojo)",
    "rich-coffee":      "Café Artesanal (café oscuro + ámbar)",
    "classic-barber":   "Barbería Clásica (negro + dorado)",
    "elegant-rose":     "Rosa Elegante (rosa + crema)",
    "professional-blue":"Azul Profesional (azul + gris)",
  };

  console.log(`\n  Paleta recomendada para ${tipo}: \x1b[33m"${presetNames[recommendedPreset]}"\x1b[0m`);

  const themeChoice = await select<"recommended" | "other" | "custom">({
    message: "Paleta de colores",
    choices: [
      { value: "recommended", name: `✅ Usar "${presetNames[recommendedPreset]}" (recomendada)` },
      { value: "other",       name: "🎨 Elegir otra paleta de la lista" },
      { value: "custom",      name: "🖌️  Ingresar mi propio color principal (#hex)" },
    ],
  });

  let themePreset: ThemePreset = recommendedPreset;
  let primaryHex: string | null = null;

  if (themeChoice === "other") {
    themePreset = await select<ThemePreset>({
      message: "Elige la paleta",
      choices: (Object.keys(THEME_PRESETS) as ThemePreset[]).map((k) => ({
        value: k,
        name:  presetNames[k],
      })),
      default: recommendedPreset,
    });
  } else if (themeChoice === "custom") {
    primaryHex = await input({
      message: "Color principal en formato hex (ej: #1a4a6b)",
      validate: (v) => isValidHex(v) || "Formato inválido. Debe ser #RRGGBB, ej: #1a4a6b",
    });
  }

  const fontStyle = await select<FontStyle>({
    message: "Tipografía para headings",
    choices: [
      { value: "fraunces",  name: "Fraunces — cálida, editorial, artesanal (restaurantes, cafés)" },
      { value: "cormorant", name: "Cormorant — elegante, clásica, refinada (sushi, spa, servicios)" },
    ],
    default: defaults.fontStyle,
  });

  // ── Paso 7: Catalog ───────────────────────────────────────────────
  section(7, TOTAL, "Catálogo de productos / servicios");

  const categorias: Categoria[] = [];
  let addCat = true;

  while (addCat) {
    const catNombre = await input({
      message: `Nombre de la categoría ${categorias.length + 1}`,
      validate: (v) => v.trim().length >= 2 || "Mínimo 2 caracteres",
    });

    const catSlug = await input({
      message: "Slug de la categoría",
      default: toSlug(catNombre),
      validate: (v) => /^[a-z0-9-]{2,40}$/.test(v) || "Solo minúsculas, números y guiones",
    });

    const productos: Producto[] = [];
    let addProd = true;

    while (addProd) {
      const prodNombre = await input({
        message: `  Nombre del producto/servicio ${productos.length + 1}`,
        validate: (v) => v.trim().length >= 2 || "Mínimo 2 caracteres",
      });

      const prodPrecio = await number({
        message: "  Precio en MXN (sin decimales)",
        validate: (v) => (v !== undefined && v > 0) || "Debe ser mayor a 0",
      }) ?? 0;

      const prodDesc = await input({
        message: "  Descripción breve (opcional — Enter para omitir)",
        default: "",
      });

      productos.push({ nombre: prodNombre, precio: prodPrecio, descripcion: prodDesc });

      addProd = await confirm({ message: "  ¿Agregar otro producto a esta categoría?", default: true });
    }

    categorias.push({ nombre: catNombre, slug: catSlug, productos });
    addCat = await confirm({ message: "¿Agregar otra categoría?", default: false });
  }

  // ── Paso 8: Payments ──────────────────────────────────────────────
  section(8, TOTAL, "Pagos con Mercado Pago");

  const mpDescriptor = await input({
    message: "Descriptor en extracto bancario (máx 13 chars, aparece en el estado de cuenta del cliente)",
    default: toDescriptor(slug),
    validate: (v) =>
      (v.trim().length >= 1 && v.trim().length <= 13) || "Entre 1 y 13 caracteres",
  });

  // ── Build result ──────────────────────────────────────────────────
  return {
    nombre,
    slug,
    tipo,
    lema,
    descripcion,
    logoLinea1,
    logoLinea2,
    emoji,
    logoType: logoTypeRaw,
    telefono,
    whatsapp,
    calle,
    colonia,
    ciudad: ciudadDireccion,
    cp,
    lat,
    lng,
    horario,
    costoEnvioPesos,
    zonaCobertura,
    categorias,
    themePreset,
    primaryHex,
    fontStyle,
    mpDescriptor: mpDescriptor.trim(),
  };
}
