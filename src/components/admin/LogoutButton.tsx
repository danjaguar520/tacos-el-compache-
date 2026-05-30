import { logout } from "@/app/admin/actions";

/** Botón de cierre de sesión (server action). */
export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-full bg-frijol/5 px-4 py-2 text-sm font-semibold text-frijol/70 transition hover:bg-frijol/10"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
