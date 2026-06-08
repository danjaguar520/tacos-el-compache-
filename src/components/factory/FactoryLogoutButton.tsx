import { factoryLogout } from "@/app/(factory)/factory/actions";

/** Botón de cierre de sesión del Factory (server action). */
export function FactoryLogoutButton() {
  return (
    <form action={factoryLogout}>
      <button
        type="submit"
        className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-200"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
