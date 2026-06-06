import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Sprint 5D-2 — Multi-tenant query helpers.
 *
 * DESIGN PRINCIPLE (Option C from architecture audit):
 *   Primary isolation:   explicit .eq('business_id', id) in every query (this file)
 *   Secondary isolation: RLS policies in 0002_multitenant.sql (defense-in-depth)
 *
 * Pattern: call the Supabase operation first, then pass the filter builder to
 * withBusinessId() which appends the mandatory .eq('business_id', businessId).
 *
 *   const { data } = await withBusinessId(
 *     admin.from('categories').select('*').order('sort_order'),
 *     businessId
 *   );
 *
 * This is TypeScript-safe: the function only accepts PostgREST filter builders,
 * and using it makes the business_id filter visible and auditable in every query.
 */

/**
 * Tables that have a business_id column.
 * TypeScript enforces that scopedInsert() can only be called on these tables.
 */
export type MultiTenantTable =
  | "categories"
  | "products"
  | "orders"
  | "order_items"
  | "payments";

/**
 * Appends a mandatory business_id filter to any PostgREST filter builder.
 *
 * Use this as the LAST call before awaiting any query on a multi-tenant table.
 * The generic T preserves the inferred return type of the original query.
 *
 * @example
 * // SELECT — categories for this business, sorted
 * const { data } = await withBusinessId(
 *   admin.from('categories').select('*').order('sort_order'),
 *   businessId
 * );
 *
 * // SELECT with extra filter — available products only
 * const { data } = await withBusinessId(
 *   admin.from('products').select('*, categories(slug)').eq('available', true),
 *   businessId
 * );
 *
 * // UPDATE — change order status (business_id prevents cross-tenant updates)
 * await withBusinessId(
 *   admin.from('orders').update({ status: 'pagado' }).eq('id', orderId),
 *   businessId
 * );
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withBusinessId<T extends { eq: (column: string, value: unknown) => any }>(
  query: T,
  businessId: string,
): T {
  return query.eq("business_id", businessId) as T;
}

/**
 * Creates an INSERT row (or rows) with business_id automatically injected.
 *
 * @example
 * const { data, error } = await scopedInsert(admin, 'orders', businessId, {
 *   customer_name: 'Ana García',
 *   total_cents: 7000,
 *   delivery_method: 'recoger',
 *   // business_id injected automatically
 * });
 */
export function scopedInsert(
  supabase:   SupabaseClient,
  table:      MultiTenantTable,
  businessId: string,
  row:        Record<string, unknown> | Record<string, unknown>[],
) {
  const rows = Array.isArray(row) ? row : [row];
  const withBusiness = rows.map((r) => ({ ...r, business_id: businessId }));
  return supabase.from(table).insert(withBusiness);
}

/**
 * Fetches the business UUID from the businesses table for a given slug.
 *
 * Returns null when:
 *   - Supabase is not configured
 *   - The businesses table doesn't exist yet (pre-migration)
 *   - The slug is not found / not active
 *
 * When null, code falls back to legacy mode (no business_id filtering).
 */
export async function resolveBusinessId(
  supabase: SupabaseClient,
  slug:     string,
): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
  } catch {
    return null;
  }
}
