import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Clientes de Supabase para el servidor.
 *
 * - `getPublicClient()`  → llave anon, solo lectura pública (productos/categorías).
 * - `getAdminClient()`   → llave service_role, escrituras de órdenes/pagos.
 *
 * Si las variables de entorno no están configuradas, las funciones devuelven
 * `null` y la app opera en MODO DEMO (menú estático, checkout simulado).
 */

/** Un valor cuenta como configurado si existe y no es un placeholder `__...__`. */
function real(value: string | undefined): string | undefined {
  if (!value || value.startsWith("__")) return undefined;
  return value;
}

const url = real(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = real(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const serviceKey = real(process.env.SUPABASE_SERVICE_ROLE_KEY);

/** ¿Hay credenciales suficientes para leer de Supabase? */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/** ¿Hay credenciales para escribir (service role)? */
export function isSupabaseWritable(): boolean {
  return Boolean(url && serviceKey);
}

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!publicClient) {
    publicClient = createClient(url!, anonKey!, {
      auth: { persistSession: false },
    });
  }
  return publicClient;
}

export function getAdminClient(): SupabaseClient | null {
  if (!isSupabaseWritable()) return null;
  if (!adminClient) {
    adminClient = createClient(url!, serviceKey!, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}
