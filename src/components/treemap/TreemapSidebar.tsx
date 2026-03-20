"use client";

import { formatNumber } from "@/lib/i18n/context";
import { exposureColor, computeKPIs, TIER_LABELS_EN, TIER_LABELS_AR, type TreemapOccupation, type WorkforceFilter } from "@/lib/treemap/treemap-utils";
import { riskColor } from "@/lib/utils";

interface TreemapSidebarProps {
  data: TreemapOccupation[];
  lang: string;
  filter: WorkforceFilter;
  onFilterChange: (f: WorkforceFilter) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

const TIER_ORDER = ["very_low", "low", "moderate", "high", "very_high"] as const;
const TIER_NAMES_EN: Record<string, string> = {
  very_low: "Minimal (0-2)",
  low: "Low (2-3.5)",
  moderate: "Moderate (3.5-5)",
  high: "High (5-7)",
  very_high: "Very High (7-10)",
};
const TIER_NAMES_AR: Record<string, string> = {
  very_low: "ضئيل (0-2)",
  low: "منخفض (2-3.5)",
  moderate: "متوسط (3.5-5)",
  high: "عالي (5-7)",
  very_high: "عالي جداً (7-10)",
};
const TIER_NAMES_FR: Record<string, string> = {
  very_low: "Minimal (0-2)",
  low: "Faible (2-3.5)",
  moderate: "Modéré (3.5-5)",
  high: "Élevé (5-7)",
  very_high: "Très élevé (7-10)",
};

export default function TreemapSidebar({ data, lang, filter, onFilterChange, t }: TreemapSidebarProps) {
  const kpis = computeKPIs(data);
  const maxTierWorkers = Math.max(...Object.values(kpis.tiers));
  const tierLabels = lang === "ar" ? TIER_LABELS_AR : TIER_LABELS_EN;
  const isAr = lang === "ar";

  const filterButtons: { key: WorkforceFilter; label: string }[] = [
    { key: "all", label: t.treemap.everyone },
    { key: "saudi", label: t.treemap.saudiOnly },
    { key: "expat", label: t.treemap.expatOnly },
  ];

  return (
    <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
      {/* Workforce Toggle */}
      <div className={`flex rounded-md border border-white/10 overflow-hidden ${isAr ? "flex-row-reverse" : ""}`}>
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => onFilterChange(btn.key)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === btn.key
                ? "bg-accent-primary/20 text-accent-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Total Workforce */}
      <div className="bg-bg-card/60 rounded-md p-3 border border-white/5">
        <p className={`text-xs text-text-muted uppercase tracking-wider mb-1 ${isAr ? "text-right" : ""}`}>
          {t.treemap.totalWorkforce}
        </p>
        <p className={`text-2xl font-mono font-bold text-text-primary ${isAr ? "text-right" : ""}`}>
          {formatNumber(kpis.totalWorkforce, lang)}
        </p>
      </div>

      {/* Weighted Avg Exposure */}
      <div className="bg-bg-card/60 rounded-md p-3 border border-white/5">
        <p className={`text-xs text-text-muted uppercase tracking-wider mb-1 ${isAr ? "text-right" : ""}`}>
          {t.treemap.avgExposure}
        </p>
        <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse justify-end" : ""}`}>
          <span
            className="text-2xl font-mono font-bold"
            style={{ color: exposureColor(kpis.weightedExposure) }}
          >
            {(kpis.weightedExposure / 10).toFixed(1)}
          </span>
          <span className="text-xs text-text-muted">/10</span>
        </div>
      </div>

      {/* Jobs by Exposure Tier */}
      <div className="bg-bg-card/60 rounded-md p-3 border border-white/5">
        <p className={`text-xs text-text-muted uppercase tracking-wider mb-2 ${isAr ? "text-right" : ""}`}>
          {t.treemap.byExposureTier}
        </p>
        <div className="space-y-1.5">
          {TIER_ORDER.map((tier) => {
            const count = kpis.tiers[tier] || 0;
            const pct = maxTierWorkers > 0 ? (count / maxTierWorkers) * 100 : 0;
            const tierName = isAr ? TIER_NAMES_AR[tier] : lang === "fr" ? TIER_NAMES_FR[tier] : TIER_NAMES_EN[tier];
            return (
              <div key={tier}>
                <div className={`flex justify-between text-xs mb-0.5 ${isAr ? "flex-row-reverse" : ""}`}>
                  <span className="text-text-muted">{tierName}</span>
                  <span className="font-mono text-text-secondary">{formatNumber(count, lang)}</span>
                </div>
                <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: riskColor(tier),
                      ...(isAr ? { marginRight: "auto", marginLeft: `${100 - pct}%` } : {}),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exposure by Pay Band */}
      <div className="bg-bg-card/60 rounded-md p-3 border border-white/5">
        <p className={`text-xs text-text-muted uppercase tracking-wider mb-2 ${isAr ? "text-right" : ""}`}>
          {t.treemap.byPayBand}
        </p>
        <div className="space-y-1.5">
          {kpis.payBandExposure.map((band) => (
            <div key={band.label} className={`flex items-center gap-2 text-xs ${isAr ? "flex-row-reverse" : ""}`}>
              <span className={`text-text-muted w-12 ${isAr ? "text-left" : ""}`}>{band.label}</span>
              <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(band.avgExposure / 100) * 100}%`,
                    backgroundColor: exposureColor(band.avgExposure),
                  }}
                />
              </div>
              <span className={`font-mono text-text-secondary w-8 ${isAr ? "text-left" : "text-right"}`}>
                {(band.avgExposure / 10).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Exposure by Education */}
      <div className="bg-bg-card/60 rounded-md p-3 border border-white/5">
        <p className={`text-xs text-text-muted uppercase tracking-wider mb-2 ${isAr ? "text-right" : ""}`}>
          {t.treemap.byEducation}
        </p>
        <div className="space-y-1.5">
          {kpis.eduExposure.map((edu) => (
            <div key={edu.tier} className={`flex items-center gap-2 text-xs ${isAr ? "flex-row-reverse" : ""}`}>
              <span className={`text-text-muted w-20 truncate ${isAr ? "text-left" : ""}`}>{tierLabels[edu.tier]}</span>
              <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(edu.avgExposure / 100) * 100}%`,
                    backgroundColor: exposureColor(edu.avgExposure),
                  }}
                />
              </div>
              <span className={`font-mono text-text-secondary w-8 ${isAr ? "text-left" : "text-right"}`}>
                {(edu.avgExposure / 10).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wages Exposed */}
      <div className="bg-bg-card/60 rounded-md p-3 border border-white/5">
        <p className={`text-xs text-text-muted uppercase tracking-wider mb-1 ${isAr ? "text-right" : ""}`}>
          {t.treemap.wagesExposed}
        </p>
        <p className={`text-lg font-mono font-bold text-risk-very-high ${isAr ? "text-right" : ""}`}>
          {isAr ? "ر.س" : "SAR"} {formatNumber(Math.round(kpis.wagesExposed / 1e9), lang)}{isAr ? " مليار" : lang === "fr" ? " Md" : "B"}
        </p>
        <p className={`text-xs text-text-muted mt-0.5 ${isAr ? "text-right" : ""}`}>
          {isAr ? "رواتب شهرية في مهن عالية المخاطر" : lang === "fr" ? "Salaires mensuels dans les métiers à haut risque" : "Monthly wages in high-risk occupations"}
        </p>
      </div>
    </div>
  );
}
