import type { GeneratedContent, BusinessDNA } from "@/lib/factory/ai/types";
import type { ThemeConfig } from "@/lib/factory/json-types";
import type { ThemeColors } from "@/lib/factory/types";
import { THEME_PRESETS } from "@/lib/factory/derivations";
import type { ThemePreset } from "@/lib/factory/types";

interface Props {
  nombre:  string;
  l1:      string;
  l2:      string;
  emoji:   string;
  content: GeneratedContent;
  preset:  ThemePreset;
  primary?: string | null;
  theme:   Partial<ThemeConfig>;
}

export function BusinessCard({ nombre, l1, l2, emoji, content, preset, primary }: Props) {
  const colors: ThemeColors = { ...THEME_PRESETS[preset], ...(primary ? { primary } : {}) };
  const dna: BusinessDNA   = content.businessDNA;

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
      {/* Logo header */}
      <div className="px-6 py-5 border-b border-gray-50" style={{ background: colors.bg }}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full text-xl shadow-sm"
            style={{ background: colors.accent }}>
            {emoji}
          </div>
          <div className="leading-none">
            <div className="font-bold uppercase tracking-wide" style={{ color: colors.primary }}>{l1}</div>
            <div className="text-xs font-semibold uppercase tracking-widest mt-0.5" style={{ color: colors.border }}>{l2}</div>
          </div>
        </div>
        <p className="mt-3 text-sm italic" style={{ color: colors.fg + "aa" }}>{content.lema}</p>
      </div>

      {/* Palette */}
      <div className="flex gap-1.5 px-6 py-3 border-b border-gray-50">
        {[colors.primary, colors.primaryDark, colors.fg, colors.bg, colors.border, colors.secondary, colors.accent, colors.success].map((c, i) => (
          <div key={i} title={c} className="h-6 w-6 rounded-full border border-white/50 shadow-sm" style={{ background: c }} />
        ))}
      </div>

      {/* Valores */}
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 border-b border-gray-50">
        {content.valores.map((v) => (
          <div key={v.titulo} className="rounded-xl p-3 text-center text-xs"
            style={{ background: colors.bg }}>
            <div className="text-lg">{v.emoji}</div>
            <div className="mt-1 font-bold" style={{ color: colors.primary }}>{v.titulo}</div>
            <div style={{ color: colors.fg + "80" }}>{v.sub}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="p-4 border-b border-gray-50" style={{ background: colors.primary + "0d" }}>
        <p className="font-bold text-sm" style={{ color: colors.primary }}>{content.ctaHome.titulo}</p>
        <p className="mt-1 text-xs line-clamp-2" style={{ color: colors.fg + "99" }}>{content.ctaHome.texto}</p>
      </div>

      {/* Nosotros excerpt */}
      <div className="p-4 border-b border-gray-50">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.border }}>{content.nosotros.seccionLabel}</p>
        <p className="font-bold text-sm" style={{ color: colors.fg }}>{content.nosotros.heroTitulo}</p>
        <p className="mt-1 text-xs line-clamp-3" style={{ color: colors.fg + "80" }}>
          <strong style={{ color: colors.primary }}>{nombre}</strong> {content.nosotros.relato[0]}
        </p>
      </div>

      {/* BusinessDNA badge */}
      <div className="px-4 py-3 text-xs">
        <p className="font-semibold text-gray-500 mb-1.5">🧬 BusinessDNA</p>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{dna.archetype}</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{dna.tone}</span>
          {dna.keywords.slice(0, 3).map((k) => (
            <span key={k} className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-600">{k}</span>
          ))}
        </div>
        <p className="mt-2 text-gray-400 text-xs italic">{dna.differentiation}</p>
      </div>
    </div>
  );
}
