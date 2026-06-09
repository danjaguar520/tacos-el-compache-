import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Sprint 5D-2 — Multi-tenant subdomain middleware.
 *
 * Reads the business slug from:
 *   1. The subdomain of the request host  (multi-tenant: nakamura.lok-al.mx → 'nakamura')
 *   2. NEXT_PUBLIC_BUSINESS_SLUG env var  (per-business Vercel deploy: always 'compache')
 *   3. Hard-coded default                 (dev / localhost fallback: 'compache')
 *
 * Injects the resolved slug into the x-business-slug request header so that
 * server components, route handlers, and the business-context layer can read it
 * without re-parsing the host themselves.
 *
 * Routes excluded from slug injection:
 *   - /factory/*         (factory app has its own context)
 *   - /_next/*           (Next.js internals)
 *   - /images/*          (static assets)
 *   - /favicon.ico
 *   - /api/factory/*     (factory API routes)
 */

/** Lok'al multi-tenant domain. Set NEXT_PUBLIC_LOKAL_DOMAIN in env to override. */
const LOKAL_DOMAIN = process.env.NEXT_PUBLIC_LOKAL_DOMAIN ?? "lok-al.mx";

/** Default slug for single-business and development deployments. */
const DEFAULT_SLUG =
  process.env.NEXT_PUBLIC_BUSINESS_SLUG ?? "compache";

/** Paths that bypass slug injection. */
const BYPASS_PREFIXES = ["/factory", "/_next", "/images", "/api/factory", "/negocios"];
const BYPASS_EXACT    = new Set(["/favicon.ico"]);

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // ── 1. Bypass non-business routes ────────────────────────────────
  if (
    BYPASS_EXACT.has(pathname) ||
    BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // ── 2. Resolve business slug ──────────────────────────────────────
  const slug = resolveSlug(req);

  // ── 3. Inject slug header and pass through ────────────────────────
  const res = NextResponse.next();
  res.headers.set("x-business-slug", slug);
  return res;
}

function resolveSlug(req: NextRequest): string {
  const host = req.headers.get("host") ?? "";

  // Multi-tenant subdomain: {slug}.lok-al.mx
  // Also handle variants with port: {slug}.lok-al.mx:3000
  const domainWithoutPort = host.split(":")[0] ?? "";
  if (domainWithoutPort.endsWith(`.${LOKAL_DOMAIN}`)) {
    const subdomain = domainWithoutPort.slice(
      0,
      domainWithoutPort.length - LOKAL_DOMAIN.length - 1, // remove ".lokal_domain"
    );
    // Validate slug format (same regex as the businesses table constraint)
    if (subdomain && /^[a-z0-9][a-z0-9-]{0,29}$/.test(subdomain)) {
      return subdomain;
    }
  }

  // Per-business deploy or dev: use env var or default
  return DEFAULT_SLUG;
}

export const config = {
  /*
   * Match all routes except:
   *   - _next/static  (static files)
   *   - _next/image   (Next.js image optimization)
   *   - favicon.ico
   *   - images/       (public/images/* assets)
   *
   * The negative lookahead (?!...) excludes those paths.
   */
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|images/).*)"],
};
