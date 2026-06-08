import type { BusinessInput } from "../types.js";

export function generateEnvTemplate(input: BusinessInput): string {
  const vercelSlug = input.slug.toLowerCase();

  return `# ============================================================
# ${input.nombre} — Variables de entorno
# Generado por Lok'al Business Factory v1
#
# Instrucciones:
#   1. Copia este archivo a .env.local en la raíz del proyecto
#   2. Rellena cada valor con __pega_aqui__ usando tus credenciales
#   3. NUNCA subas .env.local a git (ya está en .gitignore)
# ============================================================

# URL pública del sitio (actualiza DESPUÉS del primer deploy en Vercel)
# Ejemplo: https://${vercelSlug}.vercel.app
NEXT_PUBLIC_SITE_URL=https://${vercelSlug}.vercel.app

# ── Supabase ─────────────────────────────────────────────────────
# Obtén estos valores en: supabase.com → tu proyecto → Settings → API
NEXT_PUBLIC_SUPABASE_URL=__pega_aqui__
NEXT_PUBLIC_SUPABASE_ANON_KEY=__pega_aqui__

# Service role key — SECRETO: solo en servidor, nunca al cliente
SUPABASE_SERVICE_ROLE_KEY=__pega_aqui__

# ── Mercado Pago ─────────────────────────────────────────────────
# Obtén el token en: mercadopago.com.mx/developers → tus credenciales
# Usa el token de TEST para pruebas, el de PRODUCCIÓN cuando estés listo
MP_ACCESS_TOKEN=__pega_aqui__

# ── Panel de administración ───────────────────────────────────────
# Elige una contraseña segura para acceder a /admin/pedidos
# Mínimo 12 caracteres, combina letras, números y símbolos
ADMIN_PASSWORD=__elige_una_contraseña_segura__

# ── Notas ────────────────────────────────────────────────────────
# Slug del negocio: ${input.slug}
# Descriptor MP:   ${input.mpDescriptor}
# Generado para:   ${input.nombre}
`;
}
