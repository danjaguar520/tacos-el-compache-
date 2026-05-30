"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/admin/actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(login, initial);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-frijol">Contraseña</span>
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="w-full rounded-xl border border-barro/20 bg-crema/50 px-4 py-3 text-frijol outline-none focus:border-chile focus:ring-2 focus:ring-chile/20"
        />
      </label>

      {state.error && (
        <p className="rounded-xl bg-chile/10 px-4 py-2.5 text-sm font-medium text-chile">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-chile px-6 py-3 font-semibold text-crema transition hover:bg-chile-700 disabled:opacity-50"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}
