"use client";

import { useFactoryStore } from "@/lib/factory-store";
import type { HorarioBloque } from "@/lib/factory/types";

export function StepHorario({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft  = useFactoryStore((s) => s.draft);
  const update = useFactoryStore((s) => s.updateDraft);

  const horario = ((draft.horario as HorarioBloque[]) ?? [{ dias: "", horas: "" }]);

  function setBloque(i: number, field: "dias" | "horas", value: string) {
    const next = horario.map((b, idx) => idx === i ? { ...b, [field]: value } : b);
    update({ horario: next });
  }

  function addBloque() {
    update({ horario: [...horario, { dias: "", horas: "" }] });
  }

  function removeBloque(i: number) {
    update({ horario: horario.filter((_, idx) => idx !== i) });
  }

  const isValid = horario.length > 0 && horario[0] !== undefined && horario[0].dias.trim().length > 0;

  return (
    <div className="space-y-4">
      {horario.map((bloque, i) => (
        <div key={i} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Días</label>
            <input value={bloque.dias} onChange={(e) => setBloque(i, "dias", e.target.value)}
              placeholder="Lunes a Viernes"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Horas</label>
            <input value={bloque.horas} onChange={(e) => setBloque(i, "horas", e.target.value)}
              placeholder="10:00 – 20:00"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
          </div>
          {horario.length > 1 && (
            <button onClick={() => removeBloque(i)} className="mb-0.5 text-gray-300 hover:text-red-400">✕</button>
          )}
        </div>
      ))}

      <button onClick={addBloque} className="text-sm font-semibold text-blue-500 hover:text-blue-700">
        + Agregar bloque de horario
      </button>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="rounded-full border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50">← Atrás</button>
        <button onClick={onNext} disabled={!isValid} className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-40">Continuar →</button>
      </div>
    </div>
  );
}
