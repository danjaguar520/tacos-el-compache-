"use client";

import { useState } from "react";
import { useFactoryStore } from "@/lib/factory-store";
import { THEME_PRESETS, TYPE_TO_PRESET } from "@/lib/factory/derivations";
import { isValidHex } from "@/lib/factory/colors";
import type { ThemePreset } from "@/lib/factory/types";
import type { ThemeConfig } from "@/lib/factory/json-types";

const PRESET_LABELS: Record<ThemePreset, string> = {
  "warm-mexican":      "Cálido Mexicano",
  "cool-japanese":     "Japonés Minimalista",
  "rich-coffee":       "Café Artesanal",
  "classic-barber":    "Barbería Clásica",
  "elegant-rose":      "Rosa Elegante",
  "professional-blue": "Azul Profesional",
};

type UploadStatus = "idle" | "uploading" | "success" | "error";

const BANNER_MAX = 3 * 1024 * 1024;  // 3 MB
const LOGO_MAX   = 512 * 1024;       // 500 KB

export function StepBranding({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft       = useFactoryStore((s) => s.draft);
  const theme       = useFactoryStore((s) => s.theme);
  const bannerUrl   = useFactoryStore((s) => s.bannerUrl);
  const logoUrl     = useFactoryStore((s) => s.logoUrl);
  const updateDraft = useFactoryStore((s) => s.updateDraft);
  const updateTheme = useFactoryStore((s) => s.updateTheme);
  const setBanner   = useFactoryStore((s) => s.setBanner);
  const setLogo     = useFactoryStore((s) => s.setLogo);

  const [bannerStatus, setBannerStatus] = useState<UploadStatus>(() => bannerUrl ? "success" : "idle");
  const [logoStatus,   setLogoStatus]   = useState<UploadStatus>(() => logoUrl   ? "success" : "idle");
  const [bannerError,  setBannerError]  = useState("");
  const [logoError,    setLogoError]    = useState("");

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

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "banner" | "logo",
  ) {
    const file = e.target.files?.[0];
    e.target.value = ""; // Allow re-selecting the same file on retry
    if (!file) return;

    const isBanner  = field === "banner";
    const setStatus = isBanner ? setBannerStatus : setLogoStatus;
    const setError  = isBanner ? setBannerError  : setLogoError;
    const maxBytes  = isBanner ? BANNER_MAX : LOGO_MAX;
    const maxLabel  = isBanner ? "3 MB" : "500 KB";

    if (file.size > maxBytes) {
      setStatus("error");
      setError(`El archivo supera el límite de ${maxLabel}.`);
      return;
    }

    setStatus("uploading");
    setError("");

    let dataUrl: string;
    try {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (ev) => resolve((ev.target?.result as string) ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch {
      setStatus("error");
      setError("No se pudo leer el archivo.");
      return;
    }

    try {
      const res  = await fetch("/api/factory/upload-asset", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ dataUrl, field }),
      });
      const json = await res.json() as { url?: string; details?: string };
      if (!res.ok || !json.url) {
        setStatus("error");
        setError(json.details ?? "Error al subir. Intenta de nuevo.");
        return;
      }
      if (isBanner) {
        setBanner(json.url);
      } else {
        setLogo(json.url);
        updateTheme({ logo: { type: "image" } });
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Error de conexión. Verifica tu internet.");
    }
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
              <span className="block text-lg font-bold" style={{ fontFamily: "Georgia, serif" }}>
                {f === "fraunces" ? "Fraunces" : "Cormorant"}
              </span>
              <span className="text-xs text-gray-400">{f === "fraunces" ? "Cálida, artesanal" : "Elegante, clásica"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File uploads */}
      <div className="grid grid-cols-2 gap-4">

        {/* Banner */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1.5">Banner principal</p>
          {bannerStatus === "uploading" ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-6 text-sm text-blue-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Subiendo...
            </div>
          ) : bannerStatus === "success" && bannerUrl ? (
            <div className="overflow-hidden rounded-xl border-2 border-green-200 bg-green-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerUrl} alt="" className="h-14 w-full object-cover" />
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-xs font-semibold text-green-700">✓ Banner listo</span>
                <label className="cursor-pointer text-xs text-blue-500 hover:underline">
                  Cambiar
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                    onChange={(e) => handleUpload(e, "banner")} />
                </label>
              </div>
            </div>
          ) : (
            <>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                📷 Subir banner<br /><span className="text-xs">JPEG/PNG, máx 3 MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                  onChange={(e) => handleUpload(e, "banner")} />
              </label>
              {bannerStatus === "error" && (
                <p className="mt-1 text-xs text-red-500">{bannerError || "Error al subir. Intenta de nuevo."}</p>
              )}
            </>
          )}
        </div>

        {/* Logo */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1.5">Logo (opcional)</p>
          {logoStatus === "uploading" ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-6 text-sm text-blue-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Subiendo...
            </div>
          ) : logoStatus === "success" && logoUrl ? (
            <div className="overflow-hidden rounded-xl border-2 border-green-200 bg-green-50">
              <div className="flex h-14 items-center justify-center bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="" className="h-10 w-10 object-contain" />
              </div>
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-xs font-semibold text-green-700">✓ Logo listo</span>
                <label className="cursor-pointer text-xs text-blue-500 hover:underline">
                  Cambiar
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                    onChange={(e) => handleUpload(e, "logo")} />
                </label>
              </div>
            </div>
          ) : (
            <>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                🖼️ Subir logo<br /><span className="text-xs">JPEG/PNG, máx 500 KB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                  onChange={(e) => handleUpload(e, "logo")} />
              </label>
              {logoStatus === "error" && (
                <p className="mt-1 text-xs text-red-500">{logoError || "Error al subir. Intenta de nuevo."}</p>
              )}
            </>
          )}
        </div>

      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-full border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50">← Atrás</button>
        <button onClick={onNext} className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">Continuar →</button>
      </div>
    </div>
  );
}
