"use client";

import { useFactoryStore } from "@/lib/factory-store";
import { THEME_PRESETS, TYPE_TO_PRESET } from "@/lib/factory/derivations";
import { isValidHex } from "@/lib/factory/colors";
import type { ThemePreset } from "@/lib/factory/types";
import type { ThemeConfig } from "@/lib/factory/json-types";

const PRESET_LABELS: Record<ThemePreset, string> = {
  "warm-mexican":     "Cálido Mexicano",
  "cool-japanese":    "Japonés Minimalista",
  "rich-coffee":      "Café Artesanal",
  "classic-barber":   "Barbería Clásica",
  "elegant-rose":     "Rosa Elegante",
  "professional-blue":"Azul Profesional",
};

export function StepBranding({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft       = useFactoryStore((s) => s.draft);
  const theme       = useFactoryStore((s) => s.theme);
  const updateDraft = useFactoryStore((s) => s.updateDraft);
  const updateTheme = useFactoryStore((s) => s.updateTheme);
  const setBanner   = useFactoryStore((s) => s.setBanner);
  const setLogo     = useFactoryStore((s) => s.setLogo);

  const tipo          = draft.tipo as import("@/lib/factory/types").BusinessType | undefined;
  const recommended   = tipo ? TYPE_TO_PRESET[tipo] : "professional-blue" as ThemePreset;
  const currentPreset = (draft.themePreset as ThemePreset) ?? recommended;
  const primaryHex    = (draft.primaryHex  as string) ?? "";
  const fontStyle     = (theme.fonts?.display ?? "fraunces") as "fraunces" | "cormorant";

  function handlePreset(p: ThemePreset) {
    const colors = THEME_PRESETS[p];
    updateDraft({ themePreset: p, primaryHex: null });
    updateTheme({ colors, schemaVersion: "1.0" } as Partial<ThemeConfig>);
  }

  function handleCustomHex(hex: string) {
    updateDraft({ primaryHex: isValidHex(hex) ? hex : null });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, setter: (url: string | null) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert("El archivo debe ser menor a 3MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setter((ev.target?.result as string) ?? null);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      {/* Palette selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Paleta de colores</label>
        {recommended && (
          <p className="text-xs text-blue-500 mb-2">Recomendada para {tipo}: <strong>{PRESET_LABELS[recommended]}</strong></p>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.entries(THEME_PRESETS) as [ThemePreset, typeof THEME_PRESETS[ThemePreset]][]).map(([key, colors]) => (
            <button key={key} onClick={() => handlePreset(key)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                currentPreset === key && !primaryHex
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className="flex gap-0.5">
                {[colors.primary, colors.secondary, colors.accent].map((c, i) => (
                  <span key={i} className="h-4 w-4 rounded-full border border-white/50" style={{ background: c }} />
                ))}
              </span>
              {PRESET_LABELS[key]}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">O ingresar color principal (#hex)</label>
          <input value={primaryHex} onChange={(e) => handleCustomHex(e.target.value)}
            placeholder="#1a4a6b"
            className={`w-40 rounded-lg border px-3 py-2 text-sm outline-none ${
              primaryHex && !isValidHex(primaryHex) ? "border-red-300" : "border-gray-200 focus:border-blue-400"
            }`} />
        </div>
      </div>

      {/* Font */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipografía</label>
        <div className="flex gap-3">
          {(["fraunces", "cormorant"] as const).map((f) => (
            <button key={f} onClick={() => updateTheme({ fonts: { display: f } })}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm transition-all ${
                fontStyle === f ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              <span className="block text-lg font-bold" style={{ fontFamily: f === "fraunces" ? "Georgia, serif" : "Georgia, serif" }}>
                {f === "fraunces" ? "Fraunces" : "Cormorant"}
              </span>
              <span className="text-xs text-gray-400">{f === "fraunces" ? "Cálida, artesanal" : "Elegante, clásica"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File uploads */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner principal</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
            📷 Subir imagen<br/><span className="text-xs">PNG/JPG, máx 3MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setBanner)} />
          </label>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Logo (opcional)</label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
            🖼️ Subir logo<br/><span className="text-xs">PNG, máx 500KB</span>
            <input type="file" accept="image/png,image/svg+xml" className="hidden"
              onChange={(e) => { handleFileUpload(e, setLogo); updateTheme({ logo: { type: "image" } }); }} />
          </label>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-full border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50">← Atrás</button>
        <button onClick={onNext} className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">Continuar →</button>
      </div>
    </div>
  );
}
