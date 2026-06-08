"use client";

import { useFactoryStore } from "@/lib/factory-store";

export function StepUbicacion({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft  = useFactoryStore((s) => s.draft);
  const update = useFactoryStore((s) => s.updateDraft);

  const calle   = (draft.calle   as string) ?? "";
  const colonia = (draft.colonia as string) ?? "";
  const ciudad  = (draft.ciudad  as string) ?? "";
  const cp      = (draft.cp      as string) ?? "";

  const isValid = calle.trim().length >= 3 && ciudad.trim().length >= 3 && cp.trim().length >= 4;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { key: "calle",   label: "Calle y número *", placeholder: "Av. Juárez 456", value: calle },
          { key: "colonia", label: "Colonia",           placeholder: "Centro Histórico", value: colonia },
          { key: "ciudad",  label: "Ciudad y Estado *", placeholder: "Guadalajara, Jalisco", value: ciudad },
          { key: "cp",      label: "Código Postal *",   placeholder: "44100", value: cp },
        ].map(({ key, label, placeholder, value }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <input value={value} onChange={(e) => update({ [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">Las coordenadas GPS son opcionales — se pueden configurar después del deploy.</p>
      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="rounded-full border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50">← Atrás</button>
        <button onClick={onNext} disabled={!isValid} className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-40">Continuar →</button>
      </div>
    </div>
  );
}
