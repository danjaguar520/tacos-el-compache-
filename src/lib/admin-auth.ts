import "server-only";
import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { business } from "@/config/business";

/**
 * Autenticación sencilla para el panel de administración.
 *
 * - Si `ADMIN_PASSWORD` NO está configurado → modo abierto (demo) con aviso.
 * - Si está configurado → se exige iniciar sesión; la cookie guarda un token
 *   derivado (HMAC) de la contraseña, nunca la contraseña en texto plano.
 */

export const ADMIN_COOKIE = `${business.slug}_admin`;
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

/** Contraseña real (ignora vacío y placeholders `__...__`). */
function adminPassword(): string | undefined {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.startsWith("__")) return undefined;
  return pw;
}

export function isAdminConfigured(): boolean {
  return Boolean(adminPassword());
}

export function verifyPassword(input: string): boolean {
  const pw = adminPassword();
  return Boolean(pw) && input === pw;
}

/** Token de sesión derivado de la contraseña (no reversible). */
export function sessionToken(): string {
  const pw = adminPassword() ?? "";
  return createHmac("sha256", pw).update(`${business.slug}-admin-v1`).digest("hex");
}

export function isValidToken(token: string | undefined): boolean {
  if (!isAdminConfigured()) return true; // modo abierto
  return Boolean(token) && token === sessionToken();
}

/** Lee la cookie y determina si la sesión es válida (o si el panel está abierto). */
export async function isAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) return true;
  const jar = await cookies();
  return isValidToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function setSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
