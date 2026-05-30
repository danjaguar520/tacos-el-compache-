import "server-only";
import type { Category, Product } from "@/types";
import { getStaticMenu, findStaticProduct } from "@/data/menu";
import { getPublicClient, isSupabaseConfigured } from "@/lib/supabase/server";

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

export async function fetchMenu(): Promise<{
  categories: Category[];
  products: Product[];
  source: "supabase" | "static";
}> {
  if (isSupabaseConfigured()) {
    const supabase = getPublicClient();
    if (supabase) {
      try {
        const [{ data: cats }, { data: prods }] = await Promise.all([
          supabase.from("categories").select("*").order("sort_order"),
          supabase
            .from("products")
            .select("*, categories(slug)")
            .eq("available", true)
            .order("sort_order"),
        ]);

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
 */
export async function getVerifiedProduct(id: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    const supabase = getPublicClient();
    if (supabase) {
      try {
        const { data } = await supabase
          .from("products")
          .select("*, categories(slug)")
          .eq("id", id)
          .eq("available", true)
          .maybeSingle();
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
        // Supabase respondió pero el producto no existe / no disponible.
        return null;
      } catch (err) {
        // Supabase inalcanzable: caer al menú estático como respaldo.
        console.error("getVerifiedProduct: fallo Supabase, usando menú estático.", err);
      }
    }
  }
  return findStaticProduct(id) ?? null;
}
