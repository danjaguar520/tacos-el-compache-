import "server-only";
import { createHmac } from "crypto";
import { cookies } from "next/headers";

export const FACTORY_COOKIE = "factory_admin";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

function factoryPassword(): string | undefined {
  const pw = process.env.FACTORY_ACCESS_PASSWORD;
  if (!pw || pw.startsWith("__")) return undefined;
  return pw;
}

export function isFactoryConfigured(): boolean {
  return Boolean(factoryPassword());
}

export function verifyFactoryPassword(input: string): boolean {
  const pw = factoryPassword();
  return Boolean(pw) && input === pw;
}

export function factorySessionToken(): string {
  const pw = factoryPassword() ?? "";
  return createHmac("sha256", pw).update("factory-admin-v1").digest("hex");
}

export function isValidFactoryToken(token: string | undefined): boolean {
  if (!isFactoryConfigured()) return true; // modo abierto
  return Boolean(token) && token === factorySessionToken();
}

export async function isFactoryAuthenticated(): Promise<boolean> {
  if (!isFactoryConfigured()) return true;
  const jar = await cookies();
  return isValidFactoryToken(jar.get(FACTORY_COOKIE)?.value);
}

export async function setFactorySessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(FACTORY_COOKIE, factorySessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearFactorySessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(FACTORY_COOKIE);
}
