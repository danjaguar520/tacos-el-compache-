import { isFactoryConfigured, isFactoryAuthenticated } from "@/lib/factory-auth";
import type { ManualFactualData, GeneratedContent } from "@/lib/factory/ai/types";
import type { ThemeConfig } from "@/lib/factory/json-types";
import { mergeInputs, buildDNAFile } from "@/lib/factory/ai/merge";
import { TIPO_DEFAULTS }             from "@/lib/factory/derivations";
import { generateBusinessTs }        from "@/lib/factory/generators/business";
import { generateThemeTs, resolveColors } from "@/lib/factory/generators/theme";
import { generateSeedSql }           from "@/lib/factory/generators/seed";
import { generateEnvTemplate }       from "@/lib/factory/generators/env";

// ─── Minimal ONBOARDING.md for the download ───────────────────────

function generateOnboarding(slug: string, nombre: string, tipo: string, fromAI: boolean): string {
  const contentLabel = fromAI
    ? "✨ Contenido generado con Claude AI"
    : "📋 Contenido generado con templates";

  return `# Onboarding — ${nombre}

${contentLabel}
Generado el ${new Date().toISOString().slice(0, 10)} por Lok'al Business Factory v1.
Tiempo estimado de deploy: **15–20 minutos**.

## Archivos en este ZIP

| Archivo | Propósito |
|---|---|
| \`business.ts\` | Configuración del negocio (copiar a \`src/config/business.ts\`) |
| \`theme.ts\` | Identidad visual (copiar a \`src/config/theme.ts\`) |
| \`seed.sql\` | Catálogo inicial para Supabase |
| \`.env.template\` | Variables de entorno para Vercel |
| \`business-dna.json\` | Metadata estratégica Lok'al |
| \`business.json\` | Configuración en JSON (para Lok'al DB) |
| \`theme.json\` | Tema en JSON (para Lok'al DB) |

## Pasos para el deploy

1. \`cp business.ts src/config/business.ts\`
2. \`cp theme.ts src/config/theme.ts\`
3. Reemplazar \`public/images/banner-hero.png\` con tu banner
4. Supabase: correr \`0001_init.sql\` + \`seed.sql\`
5. Vercel: configurar variables de \`.env.template\`
6. Deploy → copiar URL → actualizar \`NEXT_PUBLIC_SITE_URL\` → Redeploy
7. Registrar webhook MP: \`/api/webhooks/mercadopago\` evento \`payment\`

---
Slug: ${slug} | Tipo: ${tipo}
`;
}

// ─── Minimal ZIP creator (no external deps) ──────────────────────

/** Creates a minimal ZIP buffer from an array of {name, content} files. */
function createZip(files: Array<{ name: string; content: Buffer | string }>): Buffer {
  const buffers: Buffer[] = [];
  const centralDir: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const name    = Buffer.from(file.name, "utf8");
    const data    = typeof file.content === "string" ? Buffer.from(file.content, "utf8") : file.content;
    const crc32   = computeCrc32(data);

    // Local file header
    const header = Buffer.alloc(30 + name.length);
    header.writeUInt32LE(0x04034b50, 0);  // signature
    header.writeUInt16LE(20, 4);          // version needed
    header.writeUInt16LE(0, 6);           // flags
    header.writeUInt16LE(0, 8);           // compression: stored
    header.writeUInt16LE(0, 10);          // mod time
    header.writeUInt16LE(0, 12);          // mod date
    header.writeUInt32LE(crc32, 14);      // CRC32
    header.writeUInt32LE(data.length, 18); // compressed size
    header.writeUInt32LE(data.length, 22); // uncompressed size
    header.writeUInt16LE(name.length, 26); // filename length
    header.writeUInt16LE(0, 28);          // extra length
    name.copy(header, 30);

    buffers.push(header, data);

    // Central directory entry
    const cd = Buffer.alloc(46 + name.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc32, 16);
    cd.writeUInt32LE(data.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(name.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    name.copy(cd, 46);
    centralDir.push(cd);

    offset += 30 + name.length + data.length;
  }

  const centralDirBuf = Buffer.concat(centralDir);
  const eocdr         = Buffer.alloc(22);
  eocdr.writeUInt32LE(0x06054b50, 0);
  eocdr.writeUInt16LE(0, 4);
  eocdr.writeUInt16LE(0, 6);
  eocdr.writeUInt16LE(files.length, 8);
  eocdr.writeUInt16LE(files.length, 10);
  eocdr.writeUInt32LE(centralDirBuf.length, 12);
  eocdr.writeUInt32LE(offset, 16);
  eocdr.writeUInt16LE(0, 20);

  return Buffer.concat([...buffers, centralDirBuf, eocdr]);
}

function computeCrc32(buf: Buffer): number {
  const table = makeCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]!) & 0xff]!;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeCrcTable(): number[] {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table.push(c);
  }
  return table;
}

// ─── Route handler ────────────────────────────────────────────────

interface DownloadBody {
  manual:      ManualFactualData;
  generated:   GeneratedContent;
  theme:       ThemeConfig;
  bannerB64?:  string;
  fromAI:      boolean;
}

export async function POST(req: Request): Promise<Response> {
  try {
    if (isFactoryConfigured() && !(await isFactoryAuthenticated())) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json() as DownloadBody;
    const { manual, generated, theme, bannerB64, fromAI } = body;

    const base      = TIPO_DEFAULTS[manual.tipo];
    const { businessInput, defaults } = mergeInputs(manual, generated, base);

    // Resolve theme colors (supports custom primary hex)
    const input = { ...businessInput, themePreset: manual.themePreset, primaryHex: manual.primaryHex, fontStyle: manual.fontStyle };
    const colors = resolveColors(input);

    // Build theme.ts input object from ThemeConfig
    const themeInput = {
      ...input,
      fontStyle: theme.fonts?.display ?? "fraunces",
      logoType:  theme.logo?.type ?? "text",
    };

    const dnaFile = buildDNAFile(
      manual.slug,
      manual.nombre,
      generated.businessDNA,
      "claude-haiku-4-5-20251001",
      !fromAI,
    );

    const files: Array<{ name: string; content: string }> = [
      { name: "business.ts",       content: generateBusinessTs(businessInput, defaults, generated.businessDNA) },
      { name: "theme.ts",          content: generateThemeTs(themeInput, colors) },
      { name: "seed.sql",          content: generateSeedSql(businessInput) },
      { name: ".env.template",     content: generateEnvTemplate(businessInput) },
      { name: "ONBOARDING.md",     content: generateOnboarding(manual.slug, manual.nombre, manual.tipo, fromAI) },
      { name: "business-dna.json", content: JSON.stringify(dnaFile, null, 2) },
      { name: "business.json",     content: JSON.stringify(businessInput, null, 2) },
      { name: "theme.json",        content: JSON.stringify(theme, null, 2) },
    ];

    // Include banner if provided
    if (bannerB64) {
      const bannerData = Buffer.from(bannerB64.replace(/^data:[^;]+;base64,/, ""), "base64");
      const zipFilesWithBanner: Array<{ name: string; content: Buffer | string }> = [
        ...files,
        { name: "banner-hero.png", content: bannerData },
      ];
      const zip = createZip(zipFilesWithBanner);
      return new Response(zip.buffer as ArrayBuffer, {
        headers: {
          "Content-Type":        "application/zip",
          "Content-Disposition": `attachment; filename="${manual.slug}-lokal.zip"`,
        },
      });
    }

    const zip = createZip(files);
    return new Response(zip.buffer as ArrayBuffer, {
      headers: {
        "Content-Type":        "application/zip",
        "Content-Disposition": `attachment; filename="${manual.slug}-lokal.zip"`,
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[factory/download]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
