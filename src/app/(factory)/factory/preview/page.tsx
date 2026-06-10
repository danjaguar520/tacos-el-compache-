"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFactoryStore } from "@/lib/factory-store";
import { ThemeWrapper }    from "@/components/factory/preview/ThemeWrapper";
import { BusinessCard }    from "@/components/factory/preview/BusinessCard";
import { PreviewHome }     from "@/components/factory/preview/PreviewHome";
import { PreviewNosotros } from "@/components/factory/preview/PreviewNosotros";
import { PreviewMenu }     from "@/components/factory/preview/PreviewMenu";
import type { Categoria, HorarioBloque, BusinessType, ThemePreset } from "@/lib/factory/types";
import type { ManualFactualData }      from "@/lib/factory/ai/types";
import type { FactoryDraft, ThemeConfig } from "@/lib/factory/json-types";

type Tab = "identidad" | "home" | "nosotros" | "menu";

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "identidad", label: "🧬 Identidad" },
  { key: "home",      label: "🏠 Home" },
  { key: "nosotros",  label: "📖 Nosotros" },
  { key: "menu",      label: "🍽️ Menú" },
];

export default function FactoryPreviewPage() {
  const router     = useRouter();
  const [tab, setTab]         = useState<Tab>("identidad");
  const [downloading, setDl]       = useState(false);
  const [publishing, setPub]        = useState(false);
  const [publishResult, setPublishResult] = useState<{ slug: string; businessId: string } | null>(null);
  const [publishError, setPublishError]   = useState<string | null>(null);

  const draft    = useFactoryStore((s) => s.draft);
  const theme    = useFactoryStore((s) => s.theme);
  const generated = useFactoryStore((s) => s.generated);
  const bannerUrl = useFactoryStore((s) => s.bannerUrl);
  const logoUrl   = useFactoryStore((s) => s.logoUrl);
  const fromAI    = useFactoryStore((s) => s.fromAI);

  const nombre    = (draft.nombre     as string)      ?? "Mi Negocio";
  const l1        = (draft.logoLinea1 as string)      ?? nombre;
  const l2        = (draft.logoLinea2 as string)      ?? "";
  const emoji     = (draft.emoji      as string)      ?? "⭐";
  const preset    = (draft.themePreset as ThemePreset) ?? "professional-blue";
  const primary   = (draft.primaryHex as string|null) ?? null;
  const categorias = (draft.categorias as Categoria[])  ?? [];
  const horario    = (draft.horario    as HorarioBloque[]) ?? [];
  const slug       = (draft.slug       as string)      ?? "mi-negocio";

  // If no generated content, redirect back to form
  if (!generated) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-center px-4">
        <div>
          <p className="text-gray-500 mb-4">No hay contenido generado todavía.</p>
          <button onClick={() => router.push("/factory/crear")}
            className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white">
            ← Volver al formulario
          </button>
        </div>
      </div>
    );
  }

  async function uploadAsset(dataUrl: string, field: "banner" | "logo"): Promise<string | null> {
    try {
      const res = await fetch("/api/factory/upload-asset", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ dataUrl, field }),
      });
      if (!res.ok) return null;
      const json = await res.json() as { url?: string };
      return json.url ?? null;
    } catch {
      return null;
    }
  }

  async function handleRegenerate() {
    router.push("/factory/crear");
    useFactoryStore.getState().setStep(7);
  }

  async function handleDownload() {
    setDl(true);
    try {
      const manual: ManualFactualData = {
        nombre, slug,
        tipo:            (draft.tipo       as BusinessType) ?? "otro",
        logoLinea1: l1, logoLinea2: l2, emoji,
        logoType:   (theme.logo?.type ?? "text") as "text" | "image",
        telefono:   (draft.telefono   as string) ?? "",
        whatsapp:   (draft.whatsapp   as string) ?? "",
        calle:      (draft.calle      as string) ?? "",
        colonia:    (draft.colonia    as string) ?? "",
        ciudad:     (draft.ciudad     as string) ?? "",
        cp:         (draft.cp         as string) ?? "",
        lat: null, lng: null,
        horario,
        costoEnvioPesos: 0,
        zonaCobertura:   (draft.ciudad as string) ?? "",
        categorias,
        themePreset: preset,
        primaryHex:  primary,
        fontStyle:   (theme.fonts?.display ?? "fraunces") as "fraunces" | "cormorant",
        mpDescriptor: nombre.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 13),
      };

      const res = await fetch("/api/factory/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manual,
          generated,
          theme: { schemaVersion: "1.0", colors: theme.colors, fonts: theme.fonts, logo: theme.logo },
          bannerB64: bannerUrl ?? undefined,
          fromAI,
        }),
      });

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `${slug}-lokal.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDl(false);
    }
  }

  async function handlePublish() {
    if (!generated) return;
    setPub(true);
    setPublishError(null);
    try {
      // ── Upload assets to Storage before publish ──────────────────
      const assetUrls: { banner_url?: string; logo_url?: string } = {};
      if (bannerUrl) {
        const url = await uploadAsset(bannerUrl, "banner");
        if (url) assetUrls.banner_url = url;
      }
      if (logoUrl) {
        const url = await uploadAsset(logoUrl, "logo");
        if (url) assetUrls.logo_url = url;
      }

      const payload: FactoryDraft = {
        schemaVersion: "1.0",
        slug,
        businessConfig: {
          nombre,
          slug,
          tipo:            (draft.tipo        as BusinessType) ?? "otro",
          lema:            (draft.lema        as string) ?? "",
          descripcion:     (draft.descripcion as string) ?? "",
          logoLinea1:      l1,
          logoLinea2:      l2,
          emoji,
          logoType:        (theme.logo?.type ?? "text") as "text" | "image",
          telefono:        (draft.telefono    as string) ?? "",
          whatsapp:        (draft.whatsapp    as string) ?? "",
          calle:           (draft.calle       as string) ?? "",
          colonia:         (draft.colonia     as string) ?? "",
          ciudad:          (draft.ciudad      as string) ?? "",
          cp:              (draft.cp          as string) ?? "",
          lat:             (draft.lat         as number | null) ?? null,
          lng:             (draft.lng         as number | null) ?? null,
          horario,
          costoEnvioPesos: (draft.costoEnvioPesos as number) ?? 0,
          zonaCobertura:   (draft.zonaCobertura   as string) ?? (draft.ciudad as string) ?? "",
          categorias,
          themePreset:     preset,
          primaryHex:      primary,
          fontStyle:       (theme.fonts?.display ?? "fraunces") as "fraunces" | "cormorant",
          mpDescriptor:    (draft.mpDescriptor as string)
                           ?? nombre.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 13),
        },
        themeConfig: {
          schemaVersion: "1.0",
          colors: theme.colors,
          fonts:  theme.fonts ?? { display: "fraunces" as const },
          logo:   theme.logo  ?? { type:    "text"     as const },
        } as ThemeConfig,
        generatedContent: generated,
        lastModified:     new Date().toISOString(),
        fromAI,
      };

      const res  = await fetch("/api/factory/publish", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...payload, assetUrls }),
      });
      const data = await res.json() as Record<string, unknown>;

      if (!res.ok) {
        if (res.status === 409) {
          setPublishError(`El slug "${slug}" ya está en uso. Edita el negocio y elige uno distinto.`);
        } else if (res.status === 401) {
          setPublishError("Sesión expirada. Recarga e inicia sesión de nuevo.");
        } else {
          setPublishError((data.details as string) ?? "Error al publicar. Intenta de nuevo.");
        }
        return;
      }

      setPublishResult({ slug: data.slug as string, businessId: data.businessId as string });
      useFactoryStore.getState().clearDraft();
    } catch {
      setPublishError("Error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setPub(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white px-4 py-3 sticky top-0 z-10">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button onClick={() => router.push("/factory/crear")} className="text-sm text-gray-400 hover:text-gray-600">
            ← Editar
          </button>
          <span className="text-sm font-semibold text-gray-600">{nombre}</span>
          <span className="text-xs text-gray-400">{fromAI ? "✨ IA" : "📋 Template"}</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl">

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-1 rounded-2xl bg-gray-100 p-1 mb-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                  tab === t.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Preview content — all tabs use ThemeWrapper for proper styling */}
          <ThemeWrapper theme={theme} preset={preset} primary={primary}>
            {tab === "identidad" && (
              <BusinessCard
                nombre={nombre} l1={l1} l2={l2} emoji={emoji}
                content={generated} preset={preset} primary={primary} theme={theme}
              />
            )}
            {tab === "home" && (
              <PreviewHome
                nombre={nombre} emoji={emoji} lema={generated.lema}
                content={generated} bannerUrl={bannerUrl} categorias={categorias}
              />
            )}
            {tab === "nosotros" && (
              <PreviewNosotros nombre={nombre} content={generated} />
            )}
            {tab === "menu" && (
              <PreviewMenu content={generated} categorias={categorias} />
            )}
          </ThemeWrapper>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button onClick={handleRegenerate}
              className="rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              ↻ Regenerar contenido
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {downloading ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Preparando ZIP...</>
              ) : (
                "📦 Exportar configuración (modo legacy)"
              )}
            </button>
          </div>

          {/* Publicar en Lok'al — 6D-C.2 */}
          {publishResult ? (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-center">
              <p className="font-semibold text-green-800">Negocio publicado correctamente</p>
              <p className="mt-1 text-sm text-green-700">
                Slug: <code className="rounded bg-green-100 px-1">{publishResult.slug}</code>
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="mt-4 w-full rounded-full bg-emerald-600 px-7 py-3 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
              >
                {publishing ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Publicando...
                  </>
                ) : (
                  "🚀 Publicar en Lok’al"
                )}
              </button>
              {publishError && (
                <p className="mt-2 text-center text-sm text-red-600">{publishError}</p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
