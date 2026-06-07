"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types";
import {
  isAdminConfigured,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  isAuthenticated,
} from "@/lib/admin-auth";
import { getAdminClient } from "@/lib/supabase/server";

const VALID_STATUS: OrderStatus[] = ["recibido", "pendiente", "pagado", "cancelado"];

export interface LoginState {
  error?: string;
}

/** Inicia sesión de administrador. */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isAdminConfigured()) redirect("/admin/pedidos");

  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return { error: "Contraseña incorrecta." };
  }
  await setSessionCookie();
  redirect("/admin/pedidos");
}

/** Cierra la sesión. */
export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

/**
 * Cambia el estado de un pedido (requiere sesión válida + Supabase).
 *
 * businessId — when provided, restricts the update to that tenant's orders
 * (prevents an authenticated admin of one tenant from altering another
 * tenant's order by guessing/knowing its UUID). Pass null/undefined in
 * legacy mode (pre-migration or static fallback).
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  businessId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "No autorizado." };
  }
  if (!VALID_STATUS.includes(status)) {
    return { ok: false, error: "Estado inválido." };
  }

  const admin = getAdminClient();
  if (!admin) {
    return { ok: false, error: "Supabase no está configurado." };
  }

  let query = admin.from("orders").update({ status }).eq("id", orderId);
  if (businessId) {
    query = query.eq("business_id", businessId) as typeof query;
  }

  const { error } = await query;
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/pedidos");
  return { ok: true };
}
