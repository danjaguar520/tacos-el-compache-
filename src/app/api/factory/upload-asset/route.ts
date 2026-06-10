import { randomUUID } from "crypto";
import { isFactoryConfigured, isFactoryAuthenticated } from "@/lib/factory-auth";
import { getAdminClient } from "@/lib/supabase/server";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
};

// Enforced server-side regardless of the client-side guard in StepBranding.tsx
const SIZE_LIMIT: Record<string, number> = {
  banner: 3 * 1024 * 1024,  // 3 MB
  logo:   512 * 1024,        // 500 KB
};

// ── Magic bytes detection ─────────────────────────────────────────────────────
// Validate actual file content, not just the declared MIME type in the data URI.

function detectMime(buf: Buffer): string | null {
  if (buf.length < 4) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  return null;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  if (isFactoryConfigured() && !(await isFactoryAuthenticated())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { dataUrl?: unknown; field?: unknown };
  try {
    body = (await req.json()) as { dataUrl?: unknown; field?: unknown };
  } catch {
    return Response.json(
      { error: "validation", details: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { dataUrl, field } = body;

  // ── Validate field ────────────────────────────────────────────────────────
  if (field !== "banner" && field !== "logo") {
    return Response.json(
      { error: "validation", details: "field must be 'banner' or 'logo'" },
      { status: 400 },
    );
  }

  // ── Validate dataUrl structure ────────────────────────────────────────────
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return Response.json(
      { error: "validation", details: "dataUrl must be a data: URI for an image" },
      { status: 400 },
    );
  }

  const mimeMatch = dataUrl.match(/^data:([a-z/]+);base64,/);
  if (!mimeMatch) {
    return Response.json(
      { error: "validation", details: "dataUrl must be base64-encoded" },
      { status: 400 },
    );
  }

  const declaredMime = mimeMatch[1]!;
  if (!(declaredMime in ALLOWED_MIME)) {
    return Response.json(
      { error: "validation", details: `MIME type not allowed: ${declaredMime}` },
      { status: 400 },
    );
  }

  // ── Decode base64 ─────────────────────────────────────────────────────────
  const base64Data = dataUrl.split(",")[1] ?? "";
  const buffer = Buffer.from(base64Data, "base64");

  // ── Size validation ───────────────────────────────────────────────────────
  const maxBytes = SIZE_LIMIT[field]!;
  if (buffer.length > maxBytes) {
    const limitMb = (maxBytes / (1024 * 1024)).toFixed(1);
    return Response.json(
      { error: "validation", details: `File too large for ${field} (max ${limitMb} MB)` },
      { status: 413 },
    );
  }

  // ── Magic bytes validation ────────────────────────────────────────────────
  const detectedMime = detectMime(buffer);
  if (!detectedMime) {
    return Response.json(
      { error: "validation", details: "Unrecognized image format" },
      { status: 400 },
    );
  }
  if (detectedMime !== declaredMime) {
    return Response.json(
      { error: "validation", details: "MIME type mismatch" },
      { status: 400 },
    );
  }

  // ── Supabase client ───────────────────────────────────────────────────────
  const admin = getAdminClient();
  if (!admin) {
    return Response.json(
      { error: "upload_failed", details: "Storage not configured" },
      { status: 500 },
    );
  }

  // ── Upload to Storage ─────────────────────────────────────────────────────
  const ext  = ALLOWED_MIME[detectedMime]!;
  const path = `assets/${randomUUID()}.${ext}`;

  const { error: uploadErr } = await admin.storage
    .from("business-assets")
    .upload(path, buffer, {
      contentType: detectedMime,
      upsert: false,
    });

  if (uploadErr) {
    console.error("[factory/upload-asset] upload:", uploadErr.message);
    return Response.json(
      { error: "upload_failed", details: uploadErr.message },
      { status: 500 },
    );
  }

  // ── Public URL ────────────────────────────────────────────────────────────
  const { data: { publicUrl } } = admin.storage
    .from("business-assets")
    .getPublicUrl(path);

  return Response.json({ url: publicUrl }, { status: 200 });
}
