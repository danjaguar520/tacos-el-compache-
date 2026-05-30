"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Devuelve `false` durante el render del servidor y la primera hidratación,
 * y `true` una vez montado en el cliente. Sirve para evitar desajustes de
 * hidratación con estado que solo existe en el cliente (p. ej. el carrito en
 * localStorage) sin usar setState dentro de un efecto.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // cliente
    () => false, // servidor
  );
}
