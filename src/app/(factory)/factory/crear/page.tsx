"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFactoryStore } from "@/lib/factory-store";
import { StepProgress }   from "@/components/factory/StepProgress";
import { StepIdentidad }  from "@/components/factory/steps/StepIdentidad";
import { StepContacto }   from "@/components/factory/steps/StepContacto";
import { StepUbicacion }  from "@/components/factory/steps/StepUbicacion";
import { StepHorario }    from "@/components/factory/steps/StepHorario";
import { StepCatalogo }   from "@/components/factory/steps/StepCatalogo";
import { StepHistoria }   from "@/components/factory/steps/StepHistoria";
import { StepBranding }   from "@/components/factory/steps/StepBranding";
import { StepResumen }    from "@/components/factory/steps/StepResumen";
import type { ManualFactualData, AIContext } from "@/lib/factory/ai/types";
import type { Categoria, BusinessType, HorarioBloque } from "@/lib/factory/types";
import type { ThemePreset } from "@/lib/factory/types";

export default function FactoryCrearPage() {
  const router     = useRouter();
  const stepIndex  = useFactoryStore((s) => s.stepIndex);
  const nextStep   = useFactoryStore((s) => s.nextStep);
  const prevStep   = useFactoryStore((s) => s.prevStep);
  const draft      = useFactoryStore((s) => s.draft);
  const theme      = useFactoryStore((s) => s.theme);
  const setGen     = useFactoryStore((s) => s.setGenerated);

  // Manage loading state via React state (not Zustand, it's transient)
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);

    const categorias = (draft.categorias as Categoria[]) ?? [];

    const manual: ManualFactualData = {
      nombre:          (draft.nombre     as string) ?? "",
      slug:            (draft.slug       as string) ?? "",
      tipo:            (draft.tipo       as BusinessType) ?? "otro",
      logoLinea1:      (draft.logoLinea1 as string) ?? "",
      logoLinea2:      (draft.logoLinea2 as string) ?? "",
      emoji:           (draft.emoji     as string) ?? "⭐",
      logoType:        ((theme.logo?.type ?? "text") as "text" | "image"),
      telefono:        (draft.telefono  as string) ?? "",
      whatsapp:        (draft.whatsapp  as string) ?? "",
      calle:           (draft.calle     as string) ?? "",
      colonia:         (draft.colonia   as string) ?? "",
      ciudad:          (draft.ciudad    as string) ?? "",
      cp:              (draft.cp        as string) ?? "",
      lat:             null,
      lng:             null,
      horario:         (draft.horario   as HorarioBloque[]) ?? [],
      costoEnvioPesos: 0,
      zonaCobertura:   (draft.ciudad    as string) ?? "",
      categorias,
      themePreset:     (draft.themePreset as ThemePreset) ?? "professional-blue",
      primaryHex:      (draft.primaryHex as string) ?? null,
      fontStyle:       (theme.fonts?.display ?? "fraunces") as "fraunces" | "cormorant",
      mpDescriptor:    ((draft.nombre as string) ?? "").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 13),
    };

    const aiContext: AIContext = {
      nombre:          manual.nombre,
      tipo:            manual.tipo,
      ciudad:          manual.ciudad.split(",")[0]?.trim() ?? manual.ciudad,
      servicios:       categorias.flatMap((c) => c.productos.map((p) => ({ nombre: p.nombre, precio: p.precio }))),
      historia:        (draft.historia        as string) || undefined,
      diferenciadores: (draft.diferenciadores as string) || undefined,
    };

    try {
      const res = await fetch("/api/factory/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiContext }),
      });

      const result = await res.json() as { content?: import("@/lib/factory/ai/types").GeneratedContent; fromFallback?: boolean };

      if (result.content) {
        setGen(result.content, !(result.fromFallback ?? true));
      }
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
      router.push("/factory/preview");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <span className="text-sm font-semibold text-gray-400">Lok&apos;al Factory</span>
          <span className="text-sm text-gray-400">
            {(draft.nombre as string) ?? "Nuevo negocio"}
          </span>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-xl">
          <StepProgress currentIndex={stepIndex} />

          <div className="mt-8">
            {stepIndex === 0 && <StepIdentidad onNext={nextStep} />}
            {stepIndex === 1 && <StepContacto  onNext={nextStep} onBack={prevStep} />}
            {stepIndex === 2 && <StepUbicacion onNext={nextStep} onBack={prevStep} />}
            {stepIndex === 3 && <StepHorario   onNext={nextStep} onBack={prevStep} />}
            {stepIndex === 4 && <StepCatalogo  onNext={nextStep} onBack={prevStep} />}
            {stepIndex === 5 && <StepHistoria  onNext={nextStep} onBack={prevStep} />}
            {stepIndex === 6 && <StepBranding  onNext={nextStep} onBack={prevStep} />}
            {stepIndex === 7 && (
              <StepResumen
                onGenerate={handleGenerate}
                onBack={prevStep}
                loading={isGenerating}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
