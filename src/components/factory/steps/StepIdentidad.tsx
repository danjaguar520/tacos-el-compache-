"use client";

import { useFactoryStore } from "@/lib/factory-store";
import { TIPO_DEFAULTS } from "@/lib/factory/derivations";
import type { BusinessType } from "@/lib/factory/types";

const TIPOS: Array<{ value: BusinessType; label: string; emoji: string }> = [
  { value: "restaurante", label: "Restaurante / Taquería", emoji: "🍽️" },
  { value: "sushi",       label: "Sushi / Comida japonesa", emoji: "🍣" },
  { value: "cafeteria",   label: "Cafetería / Café",        emoji: "☕" },
  { value: "barberia",    label: "Barbería / Peluquería",   emoji: "✂️" },
  { value: "estetica",    label: "Estética / Spa",          emoji: "💅" },
  { value: "servicios",   label: "Servicios profesionales", emoji: "🤝" },
  { value: "otro",        label: "Otro",                    emoji: "⭐" },
];

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 30);
}

export function StepIdentidad({ onNext }: { onNext: () => void }) {
  const draft  = useFactoryStore((s) => s.draft);
  const update = useFactoryStore((s) => s.updateDraft);

  const nombre  = (draft.nombre   as string) ?? "";
  const tipo    = (draft.tipo     as BusinessType) ?? null;
  const slug    = (draft.slug     as string) ?? "";
  const l1      = (draft.logoLinea1 as string) ?? "";
  const l2      = (draft.logoLinea2 as string) ?? "";
  const emoji   = (draft.emoji    as string) ?? "";

  function handleNombre(v: string) {
    const words = v.split(" ");
    const defaults = tipo ? TIPO_DEFAULTS[tipo] : null;
    update({
      nombre:     v,
      slug:       toSlug(v),
      logoLinea1: words[0] ?? v,
      logoLinea2: words.slice(1).join(" ") || v,
      emoji:      emoji || (defaults?.emoji ?? "⭐"),
    });
  }

  function handleTipo(t: BusinessType) {
    const defaults = TIPO_DEFAULTS[t];
    update({ tipo: t, emoji: defaults.emoji });
  }

  const isValid = nombre.trim().length >= 2 && tipo !== null;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del negocio *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => handleNombre(e.target.value)}
          placeholder="Barbería El Navajero"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        {nombre && (
          <p className="mt-1 text-xs text-gray-400">Slug: <span className="font-mono text-gray-600">{slug || toSlug(nombre)}</span></p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de negocio *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTipo(t.value)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                tipo === t.value
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <span>{t.emoji}</span>
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {nombre && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Logo línea 1</label>
            <input value={l1} onChange={(e) => update({ logoLinea1: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Logo línea 2</label>
            <input value={l2} onChange={(e) => update({ logoLinea2: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Emoji</label>
            <input value={emoji} onChange={(e) => update({ emoji: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
