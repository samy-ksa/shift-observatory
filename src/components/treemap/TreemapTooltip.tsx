"use client";

import { formatNumber } from "@/lib/i18n/context";
import { exposureColor, type TreemapOccupation, TIER_LABELS_EN, TIER_LABELS_AR, TIER_LABELS_FR } from "@/lib/treemap/treemap-utils";
import { scoreToCategory } from "@/lib/utils";

interface TreemapTooltipProps {
  occ: TreemapOccupation | null;
  position: DOMRect | null;
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

const WEF_ICONS: Record<string, string> = {
  decline_brutal: "↓↓",
  decline: "↓",
  stable: "→",
  growth: "↑",
  growth_rapid: "↑↑",
};

export default function TreemapTooltip({ occ, position, lang, t }: TreemapTooltipProps) {
  if (!occ || !position) return null;

  const tierLabel = lang === "ar" ? TIER_LABELS_AR[occ.tier] : lang === "fr" ? TIER_LABELS_FR[occ.tier] : TIER_LABELS_EN[occ.tier];
  const cat = scoreToCategory(occ.composite);
  const catLabels: Record<string, string> = {
    very_low: lang === "ar" ? "منخفض جداً" : lang === "fr" ? "Très faible" : "Very Low",
    low: lang === "ar" ? "منخفض" : lang === "fr" ? "Faible" : "Low",
    moderate: lang === "ar" ? "متوسط" : lang === "fr" ? "Modéré" : "Moderate",
    high: lang === "ar" ? "عالي" : lang === "fr" ? "Élevé" : "High",
    very_high: lang === "ar" ? "عالي جداً" : lang === "fr" ? "Très élevé" : "Very High",
  };

  // Position tooltip near cursor, clamped to viewport
  const left = Math.min(position.x + 12, typeof window !== "undefined" ? window.innerWidth - 320 : 600);
  const top = Math.min(position.y + 12, typeof window !== "undefined" ? window.innerHeight - 300 : 400);

  return (
    <div
      className="fixed z-50 bg-bg-card border border-white/10 rounded-lg shadow-xl p-4 pointer-events-none w-[290px]"
      style={{ left, top }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <h4 className="font-semibold text-text-primary text-sm mb-2">
        {lang === "ar" ? occ.name_ar : lang === "fr" ? occ.name_fr : occ.name_en}
      </h4>

      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: exposureColor(occ.composite) + "33", color: exposureColor(occ.composite) }}
        >
          {(occ.composite / 10).toFixed(1)}/10
        </span>
        <span className="text-xs text-text-muted">{catLabels[cat]}</span>
        <span className="text-xs text-text-muted px-1.5 py-0.5 bg-bg-secondary rounded">
          {occ.category === "substitution"
            ? lang === "ar" ? "استبدال" : lang === "fr" ? "Substitution" : "Substitution"
            : lang === "ar" ? "تعزيز" : lang === "fr" ? "Augmentation" : "Augmentation"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-text-muted">{t.treemap.workers}</span>
        <span className="text-text-primary font-mono text-right">
          {formatNumber(occ.employment, lang)}
        </span>

        <span className="text-text-muted">{t.treemap.salary}</span>
        <span className="text-text-primary font-mono text-right">
          {formatNumber(occ.salary_entry_sar, lang)}–{formatNumber(occ.salary_senior_sar, lang)} {lang === "ar" ? "ر.س" : "SAR"}
        </span>

        <span className="text-text-muted">{t.treemap.education}</span>
        <span className="text-text-primary text-right">{tierLabel}</span>

        <span className="text-text-muted">{t.treemap.saudiPct}</span>
        <span className="text-text-primary font-mono text-right">{occ.saudi_pct}%</span>

        {occ.wef_trend && (
          <>
            <span className="text-text-muted">WEF</span>
            <span className="text-text-primary text-right">
              {WEF_ICONS[occ.wef_trend] || "–"} {occ.wef_trend.replace(/_/g, " ")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
