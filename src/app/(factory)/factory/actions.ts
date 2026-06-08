"use server";

import { redirect } from "next/navigation";
import {
  isFactoryConfigured,
  verifyFactoryPassword,
  setFactorySessionCookie,
  clearFactorySessionCookie,
} from "@/lib/factory-auth";

export interface FactoryLoginState {
  error?: string;
}

/** Inicia sesión de acceso al Factory. */
export async function factoryLogin(
  _prev: FactoryLoginState,
  formData: FormData,
): Promise<FactoryLoginState> {
  if (!isFactoryConfigured()) redirect("/factory");

  const password = String(formData.get("password") ?? "");
  if (!verifyFactoryPassword(password)) {
    return { error: "Contraseña incorrecta." };
  }
  await setFactorySessionCookie();
  redirect("/factory");
}

/** Cierra la sesión del Factory. */
export async function factoryLogout(): Promise<void> {
  await clearFactorySessionCookie();
  redirect("/factory/login");
}
