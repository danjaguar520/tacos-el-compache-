"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeConfig } from "@/lib/factory/json-types";
import type { BusinessConfig } from "@/lib/factory/json-types";
import type { GeneratedContent } from "@/lib/factory/ai/types";
import type { BusinessType } from "@/lib/factory/types";

// ─── State shape ──────────────────────────────────────────────────

interface FactoryState {
  /** Current form step index (0 = identidad … 7 = resumen). */
  stepIndex:  number;
  /** Partial form data — accumulates as user fills each step. */
  draft:      Partial<BusinessConfig & { historia?: string; diferenciadores?: string }>;
  /** Theme configuration. */
  theme:      Partial<ThemeConfig>;
  /** AI-generated content (set after Claude responds). */
  generated:  GeneratedContent | null;
  /** Banner — Supabase Storage public URL (uploaded in StepBranding). */
  bannerUrl:  string | null;
  /** Logo — Supabase Storage public URL (uploaded in StepBranding). */
  logoUrl:    string | null;
  /** Whether Claude was used or templates. */
  fromAI:     boolean;
  /** ISO timestamp of last update. */
  lastSaved:  string | null;

  // ── Actions ──────────────────────────────────────────────────────
  setStep:       (index: number) => void;
  nextStep:      () => void;
  prevStep:      () => void;
  updateDraft:   (data: Partial<FactoryState["draft"]>) => void;
  updateTheme:   (data: Partial<ThemeConfig>) => void;
  setGenerated:  (c: GeneratedContent, fromAI: boolean) => void;
  setBanner:     (dataUrl: string | null) => void;
  setLogo:       (dataUrl: string | null) => void;
  clearDraft:    () => void;

  // ── Computed helpers ──────────────────────────────────────────────
  hasValidDraft: () => boolean;
  getDraftName:  () => string | null;
  getDraftType:  () => BusinessType | null;
}

const INITIAL_DRAFT: FactoryState["draft"] = {};
const INITIAL_THEME: Partial<ThemeConfig>  = {
  schemaVersion: "1.0",
  fonts:  { display: "fraunces" },
  logo:   { type: "text" },
};

export const useFactoryStore = create<FactoryState>()(
  persist(
    (set, get) => ({
      stepIndex:  0,
      draft:      INITIAL_DRAFT,
      theme:      INITIAL_THEME,
      generated:  null,
      bannerUrl:  null,
      logoUrl:    null,
      fromAI:     false,
      lastSaved:  null,

      setStep: (index) => set({ stepIndex: index, lastSaved: new Date().toISOString() }),

      nextStep: () => set((s) => ({
        stepIndex: Math.min(s.stepIndex + 1, 7),
        lastSaved: new Date().toISOString(),
      })),

      prevStep: () => set((s) => ({
        stepIndex: Math.max(s.stepIndex - 1, 0),
      })),

      updateDraft: (data) => set((s) => ({
        draft:     { ...s.draft, ...data },
        lastSaved: new Date().toISOString(),
      })),

      updateTheme: (data) => set((s) => ({
        theme:     { ...s.theme, ...data } as ThemeConfig,
        lastSaved: new Date().toISOString(),
      })),

      setGenerated: (c, fromAI) => set({
        generated:  c,
        fromAI,
        lastSaved:  new Date().toISOString(),
      }),

      setBanner: (dataUrl) => set({ bannerUrl: dataUrl }),
      setLogo:   (dataUrl) => set({ logoUrl: dataUrl }),

      clearDraft: () => set({
        stepIndex:  0,
        draft:      INITIAL_DRAFT,
        theme:      INITIAL_THEME,
        generated:  null,
        bannerUrl:  null,
        logoUrl:    null,
        fromAI:     false,
        lastSaved:  null,
      }),

      hasValidDraft: () => {
        const { draft, lastSaved } = get();
        if (!draft.nombre || !lastSaved) return false;
        const age = Date.now() - new Date(lastSaved).getTime();
        return age < 24 * 60 * 60 * 1000; // less than 24h
      },

      getDraftName:  () => get().draft.nombre ?? null,
      getDraftType:  () => get().draft.tipo   ?? null,
    }),
    {
      name:    "lokal-factory-draft",
      version: 2,
      migrate: (state: unknown, version: number) => {
        if (version < 2) {
          // v1 never persisted bannerUrl/logoUrl (base64). Reset to null.
          return { ...(state as object), bannerUrl: null, logoUrl: null };
        }
        return state;
      },
      partialize: (s) => ({
        stepIndex:  s.stepIndex,
        draft:      s.draft,
        theme:      s.theme,
        generated:  s.generated,
        fromAI:     s.fromAI,
        lastSaved:  s.lastSaved,
        bannerUrl:  s.bannerUrl,
        logoUrl:    s.logoUrl,
      }),
    },
  ),
);
