"use client";

import Link from "next/link";
import { useFactoryStore } from "@/lib/factory-store";

/** Shows a "resume draft" banner if there's a recent draft in localStorage. */
export function FactoryWelcomeResume() {
  const hasValid = useFactoryStore((s) => s.hasValidDraft());
  const nombre   = useFactoryStore((s) => s.getDraftName());
  const clear    = useFactoryStore((s) => s.clearDraft);

  if (!hasValid || !nombre) return null;

  return (
    <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm">
      <p className="font-semibold text-blue-800">
        Tienes un negocio en proceso: <span className="italic">{nombre}</span>
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link
          href="/factory/crear"
          className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Continuar →
        </Link>
        <button
          onClick={clear}
          className="rounded-full border border-blue-200 px-4 py-2 text-blue-700 hover:bg-blue-100"
        >
          Empezar de nuevo
        </button>
      </div>
    </div>
  );
}
