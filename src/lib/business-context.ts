import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { getAdminClient } from "@/lib/supabase/server";

// ── Static fallbacks (Sprint 5D-2: used when businesses table doesn't exist yet) ──
import { business as staticBusiness } from "@/config/business";
import { theme as staticTheme }       from "@/config/theme";

// ── Types ────────────────────────────────────────────────────────────────────────

/**
 * Full business configuration shape.
 * Derived from the static business.ts type so it's always in sync.
 * When read from DB (businesses.config), cast to this type.
 */
export type BusinessConfig = typeof staticBusiness;

/**
 * Visual theme configuration shape.
 * Derived from the static theme.ts type.
 */
export type ThemeConfig = typeof staticTheme;

export interface BusinessContext {
  /** Resolved slug for this request (from subdomain or env). */
  slug:   string;
  /** Full business configuration. */
  config: BusinessConfig;
  /** Visual theme. */
  theme:  ThemeConfig;
  /**
   * True when data came from the businesses table in DB.
   * False when using the legacy static config fallback.
   */
  fromDB: boolean;
}

// ── Core context resolver ────────────────────────────────────────────────────────

/**
 * Returns the business context for the current request.
 *
 * Resolution order:
 *   1. Read x-business-slug header (set by middleware.ts).
 *   2. Fetch businesses row from Supabase using service_role.
 *   3. If businesses table doesn't exist OR slug not found: fall back to static config.
 *   4. If Supabase is not configured: return static config immediately.
 *
 * React.cache() ensures this runs AT MOST ONCE per request, regardless of
 * how many components call it. No cross-request contamination.
 *
 * @example
 * // In a Server Component:
 * const ctx = await getBusinessContext();
 * const { nombre } = ctx.config;
 */
export const getBusinessContext = cache(async (): Promise<BusinessContext> => {
  const slug = await getBusinessSlug();

  // ── Attempt DB lookup ──────────────────────────────────────────────
  const admin = getAdminClient();

  if (admin) {
    try {
      const { data, error } = await admin
        .from("businesses")
        .select("id, slug, config, theme")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

      if (!error && data) {
        const dbConfig = data.config as Record<string, unknown> | null;
        const dbTheme  = data.theme  as Record<string, unknown> | null;

        // If config is populated (has at least 'nombre'), use it.
        // Otherwise the businesses table exists but the row hasn't been
        // filled in yet (sprint 5D-8 pending) → fall through to static.
        if (dbConfig?.nombre) {
          return {
            slug,
            config: dbConfig as unknown as BusinessConfig,
            theme:  themeWithFallback(dbTheme),
            fromDB: true,
          };
        }
      }

      // error could be "relation does not exist" (table not created yet)
      // or the slug wasn't found — both cases fall through to static.

    } catch {
      // Supabase unreachable or table doesn't exist → fall through.
    }
  }

  // ── Static fallback ────────────────────────────────────────────────
  return {
    slug,
    config: staticBusiness as unknown as BusinessConfig,
    theme:  staticTheme    as unknown as ThemeConfig,
    fromDB: false,
  };
});

// ── Convenience accessors ────────────────────────────────────────────────────────

/** Returns the full business configuration for the current request. */
export async function getBusiness(): Promise<BusinessConfig> {
  return (await getBusinessContext()).config;
}

/** Returns the visual theme for the current request. */
export async function getTheme(): Promise<ThemeConfig> {
  return (await getBusinessContext()).theme;
}

/**
 * Returns the business slug for the current request.
 *
 * Reads x-business-slug set by middleware.ts.
 * Falls back to the static config slug if the header is absent
 * (e.g. during static generation or tests).
 */
export async function getBusinessSlug(): Promise<string> {
  try {
    const h = await headers();
    const slug = h.get("x-business-slug");
    if (slug) return slug;
  } catch {
    // headers() throws outside of a request context (e.g. during next build)
  }
  return staticBusiness.slug; // "compache"
}

/**
 * Returns the business UUID from the DB (for multi-tenant queries).
 * Returns null when running in legacy static mode (no businesses table yet).
 *
 * Use this to filter Supabase queries by business_id (Sprint 5D-3+).
 */
export async function getBusinessId(): Promise<string | null> {
  const admin = getAdminClient();
  if (!admin) return null;

  const slug = await getBusinessSlug();

  try {
    const { data } = await admin
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    return (data as { id: string } | null)?.id ?? null;
  } catch {
    return null;
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────────

/**
 * Merges a DB theme object with static fallback values.
 * Handles cases where the DB theme is empty or partially populated.
 */
function themeWithFallback(
  dbTheme: Record<string, unknown> | null,
): ThemeConfig {
  if (!dbTheme || Object.keys(dbTheme).length === 0) {
    return staticTheme as unknown as ThemeConfig;
  }

  // Merge: DB theme takes precedence, static fills in missing fields.
  return {
    ...staticTheme,
    ...dbTheme,
    colors: {
      ...staticTheme.colors,
      ...((dbTheme.colors as Record<string, string>) ?? {}),
    },
    fonts: {
      ...staticTheme.fonts,
      ...((dbTheme.fonts as Record<string, string>) ?? {}),
    },
    logo: {
      ...staticTheme.logo,
      ...((dbTheme.logo as Record<string, string>) ?? {}),
    },
  } as unknown as ThemeConfig;
}
