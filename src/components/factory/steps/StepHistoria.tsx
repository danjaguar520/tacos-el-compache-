"use client";

import { useFactoryStore } from "@/lib/factory-store";

const HINTS = [
  "\"Abrí en 1995, mi padre era barbero, ya atiendo a sus nietos.\"",
  "\"Llegué de Osaka con las recetas de mi abuela itamae.\"",
  "\"Usamos solo granos de origen de Chiapas, tostados cada semana.\"",
  "\"Fundada por mi mamá, con recetas que no cambié ni una coma.\"",
];

export function StepHistoria({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft  = useFactoryStore((s) => s.draft);
  const update = useFactoryStore((s) => s.updateDraft);

  const historia       = (draft.historia       as string) ?? "";
  const diferenciadores = (draft.diferenciadores as string) ?? "";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-blue-50 px-5 py-4 text-sm text-blue-700">
        <p className="font-bold">⭐ Este es el paso más importante.</p>
        <p className="mt-1 text-blue-600">Lo que escribas aquí es lo que hace que tu sitio sea único. Claude usará tus palabras para crear el contenido.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Cuéntanos sobre tu negocio (2–5 oraciones)
        </label>
        <textarea
          rows={4}
          value={historia}
          onChange={(e) => update({ historia: e.target.value })}
          placeholder="Escribe tu historia aquí..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
        />
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-400 font-medium">Ejemplos que funcionan bien:</p>
          {HINTS.map((h, i) => (
            <p key={i} className="text-xs text-gray-400 italic">{h}</p>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          ¿Qué hace especial a tu negocio? <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <textarea
          rows={2}
          value={diferenciadores}
          onChange={(e) => update({ diferenciadores: e.target.value })}
          placeholder="¿Por qué los clientes vuelven? ¿Qué técnicas o ingredientes usas?"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
        />
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-full border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50">← Atrás</button>
        <button onClick={onNext} className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
          {historia.trim().length > 0 ? "Continuar →" : "Omitir y continuar →"}
        </button>
      </div>
    </div>
  );
}
