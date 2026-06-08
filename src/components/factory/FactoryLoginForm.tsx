"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { factoryLogin, type FactoryLoginState } from "@/app/(factory)/factory/actions";

const initial: FactoryLoginState = {};

export function FactoryLoginForm() {
  const [state, formAction] = useActionState(factoryLogin, initial);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-gray-900">Contraseña</span>
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </label>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
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
      className="w-full rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}
