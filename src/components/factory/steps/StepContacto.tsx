"use client";

import { useFactoryStore } from "@/lib/factory-store";

export function StepContacto({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft  = useFactoryStore((s) => s.draft);
  const update = useFactoryStore((s) => s.updateDraft);

  const telefono = (draft.telefono as string) ?? "";
  const whatsapp = (draft.whatsapp as string) ?? "";

  function handleTelefono(v: string) {
    update({ telefono: v, whatsapp: v.replace(/\D/g, "") });
  }

  const isValid = telefono.trim().length >= 7;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono *</label>
        <input type="tel" value={telefono} onChange={(e) => handleTelefono(e.target.value)}
          placeholder="+52 33 1234 5678"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp (solo dígitos)</label>
        <input type="tel" value={whatsapp} onChange={(e) => update({ whatsapp: e.target.value.replace(/\D/g, "") })}
          placeholder="523312345678"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        <p className="mt-1 text-xs text-gray-400">Formato internacional sin +. Ej: 523312345678</p>
      </div>
      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-full border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50">← Atrás</button>
        <button onClick={onNext} disabled={!isValid} className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-40">Continuar →</button>
      </div>
    </div>
  );
}
