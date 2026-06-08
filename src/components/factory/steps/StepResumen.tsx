"use client";

import { useFactoryStore } from "@/lib/factory-store";
import type { BusinessType, Categoria, HorarioBloque } from "@/lib/factory/types";

interface Props {
  onGenerate: () => Promise<void>;
  onBack:     () => void;
  loading:    boolean;
}

export function StepResumen({ onGenerate, onBack, loading }: Props) {
  const draft = useFactoryStore((s) => s.draft);

  const nombre     = (draft.nombre     as string) ?? "";
  const tipo       = (draft.tipo       as BusinessType) ?? "otro";
  const ciudad     = (draft.ciudad     as string) ?? "";
  const telefono   = (draft.telefono   as string) ?? "";
  const calle      = (draft.calle      as string) ?? "";
  const categorias = (draft.categorias as Categoria[]) ?? [];
  const horario    = (draft.horario    as HorarioBloque[]) ?? [];
  const historia   = (draft.historia   as string) ?? "";

  const totalProducts = categorias.reduce((n, c) => n + c.productos.length, 0);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gray-50 divide-y divide-gray-100">
        {[
          { label: "Negocio",   value: `${nombre} — ${tipo}` },
          { label: "Ciudad",    value: ciudad },
          { label: "Contacto",  value: telefono },
          { label: "Dirección", value: calle },
          { label: "Horario",   value: horario.map((h) => `${h.dias}: ${h.horas}`).join(" | ") || "—" },
          { label: "Catálogo",  value: `${categorias.length} categorías, ${totalProducts} productos` },
          { label: "Historia",  value: historia ? historia.slice(0, 80) + (historia.length > 80 ? "…" : "") : "No proporcionada (se usarán templates)" },
        ].map(({ label, value }) => (
          <div key={label} className="flex gap-4 px-4 py-3 text-sm">
            <span className="w-24 shrink-0 font-semibold text-gray-500">{label}</span>
            <span className="text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        {historia.trim().length > 20
          ? "✨ Claude generará contenido personalizado basado en tu historia."
          : "📋 Se generará contenido con templates estándar para tu tipo de negocio."}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} disabled={loading} className="rounded-full border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
          ← Atrás
        </button>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generando...
            </>
          ) : (
            "✨ Generar identidad"
          )}
        </button>
      </div>
    </div>
  );
}
