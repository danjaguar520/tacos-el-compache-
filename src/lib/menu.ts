import "server-only";
import type { Category, Product } from "@/types";
import { getStaticMenu, findStaticProduct } from "@/data/menu";
import { getAdminClient, isSupabaseWritable } from "@/lib/supabase/server";

/**
 * Capa de acceso al menú.
 * Intenta leer de Supabase; si no está configurado o falla, usa el menú estático.
 */

interface DbProductRow {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  available: boolean;
  sort_order: number;
  categories: { slug: string } | null;
}

/**
 * businessId — when provided, restricts categories and products to that tenant.
 * Pass null/undefined in legacy mode (pre-migration or static fallback).
 * This mirrors the pattern used in getVerifiedProduct().
 */
export async function fetchMenu(businessId?: string | null): Promise<{
  categories: Category[];
  products: Product[];
  source: "supabase" | "static";
}> {
  if (isSupabaseWritable()) {
    const supabase = getAdminClient();
    if (supabase) {
      try {
        // Build scoped or unscoped queries depending on whether businessId is known.
        let catQuery  = supabase.from("categories").select("*").order("sort_order");
        let prodQuery = supabase
          .from("products")
          .select("*, categories(slug)")
          .eq("available", true)
          .order("sort_order");

        if (businessId) {
          catQuery  = catQuery.eq("business_id", businessId)   as typeof catQuery;
          prodQuery = prodQuery.eq("business_id", businessId)  as typeof prodQuery;
        }

        const [catsRes, prodsRes] = await Promise.all([
          catQuery,
          prodQuery,
        ]);
        const { data: cats } = catsRes;
        const { data: prods } = prodsRes;

        if (cats?.length && prods?.length) {
          const categories = cats as Category[];
          const products: Product[] = (prods as DbProductRow[]).map((p) => ({
            id: p.id,
            category_id: p.category_id,
            category_slug: p.categories?.slug ?? "",
            name: p.name,
            description: p.description,
            price_cents: p.price_cents,
            image_url: p.image_url,
            available: p.available,
            sort_order: p.sort_order,
          }));
          return { categories, products, source: "supabase" };
        }
      } catch (err) {
        // Supabase inalcanzable o mal configurado: degradar al menú estático.
        console.error("fetchMenu: fallo Supabase, usando menú estático.", err);
      }
    }
  }

  const { categories, products } = getStaticMenu();
  return { categories, products, source: "static" };
}

/**
 * Busca un producto por id, verificando el precio contra la fuente de verdad
 * (Supabase si está disponible, si no el menú estático).
 * Se usa en el checkout para NO confiar en el precio que envía el cliente.
 *
 * businessId — when provided, restricts the lookup to that tenant's products.
 * This prevents a tenant from referencing a product UUID belonging to another
 * business. Pass null/undefined in legacy mode (pre-migration or static fallback).
 */
export async function getVerifiedProduct(
  id: string,
  businessId?: string | null,
): Promise<Product | null> {
  if (isSupabaseWritable()) {
    const supabase = getAdminClient();
    if (supabase) {
      try {
        // Build the base query; scope to the tenant when businessId is known.
        let query = supabase
          .from("products")
          .select("*, categories(slug)")
          .eq("id", id)
          .eq("available", true);

        if (businessId) {
          query = query.eq("business_id", businessId) as typeof query;
        }

        const { data } = await query.maybeSingle();
        if (data) {
          const p = data as DbProductRow;
          return {
            id: p.id,
            category_id: p.category_id,
            category_slug: p.categories?.slug ?? "",
            name: p.name,
            description: p.description,
            price_cents: p.price_cents,
            image_url: p.image_url,
            available: p.available,
            sort_order: p.sort_order,
          };
        }
        // Supabase respondió pero el producto no existe / no disponible / no pertenece al tenant.
        return null;
      } catch (err) {
        // Supabase inalcanzable: caer al menú estático como respaldo.
        console.error("getVerifiedProduct: fallo Supabase, usando menú estático.", err);
      }
    }
  }
  return findStaticProduct(id) ?? null;
}
