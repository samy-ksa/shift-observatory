"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import RiskBadge from "@/components/shared/RiskBadge";
import { formatCompact, riskColor } from "@/lib/utils";
import { useLang, formatNumber } from "@/lib/i18n/context";
import data from "@/data/master.json";

const sectors = data.sectors.filter((s) => s.total > 200);

interface GosiQ4 {
  total: number;
  saudi: number;
  non_saudi: number;
  pct_saudi: number;
  source: string;
}

interface SectorDetail {
  id: string;
  name_en: string;
  name_ar?: string;
  name_fr?: string;
  isic: string;
  total: number;
  saudi: number;
  non_saudi: number;
  pct_saudi: number;
  ai_risk_score: number;
  ai_risk_category: string;
  ai_risk_rationale: string;
  mckinsey_automatable_pct: number;
  genai_exposure: string;
  v2030_outlook: string;
  nitaqat_pressure: string;
  salary_saudi_avg?: number;
  salary_nonsaudi_avg?: number;
  gosi_q4_2024?: GosiQ4;
}

/** Use GOSI Q4-2024 data when available, otherwise fallback to existing fields */
function getTotal(s: SectorDetail): number {
  return s.gosi_q4_2024?.total ?? s.total;
}
function getPctSaudi(s: SectorDetail): number {
  return s.gosi_q4_2024?.pct_saudi ?? s.pct_saudi;
}

export default function SectorGrid() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState<SectorDetail | null>(null);

  const sectorName = (s: { name_en: string; name_ar?: string; name_fr?: string }) =>
    lang === "ar" && s.name_ar ? s.name_ar : lang === "fr" && s.name_fr ? s.name_fr : s.name_en;

  const riskLabelMap: Record<string, string> = {
    very_low: t.common.veryLow,
    low: t.common.low,
    moderate: t.common.moderate,
    high: t.common.high,
    very_high: t.common.veryHigh,
  };
  const localRiskLabel = (key: string) => riskLabelMap[key] || key.replace(/_/g, " ");

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title={t.sectors.title}
          subtitle={t.sectors.subtitle}
          id="sectors"
        />

        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 auto-rows-auto">
          {sectors.map((sector, i) => {
            const sd = sector as SectorDetail;
            const total = getTotal(sd);
            const pctSaudi = getPctSaudi(sd);
            const color = riskColor(sector.ai_risk_category);
            const logScale = Math.log10(Math.max(total, 1));
            const minH = Math.round(140 + ((logScale - 4.5) / 2) * 80);
            return (
              <motion.button
                key={sector.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelected(sector as SectorDetail)}
                className="relative bg-bg-card rounded-xl p-4 text-left card-glow card-glow-hover transition-all cursor-pointer overflow-hidden group"
                style={{
                  borderLeft: `3px solid ${color}`,
                  minHeight: `${minH}px`,
                }}
              >
                {/* Risk color bar at top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-60"
                  style={{ backgroundColor: color }}
                />

                <div className="text-sm font-semibold text-text-primary leading-tight mb-2 line-clamp-2">
                  {sectorName(sector as { name_en: string; name_ar?: string })}
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-lg font-mono font-bold text-text-primary">
                    {formatCompact(total)}
                  </span>
                  <span className="text-xs text-text-muted">{lang === "ar" ? "عامل" : "workers"}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <RiskBadge
                    category={sector.ai_risk_category}
                    score={sector.ai_risk_score}
                    size="sm"
                  />
                </div>

                <div className="mt-2 text-xs text-text-muted">
                  {pctSaudi}{t.sectors.pctSaudi}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-bg-card rounded-2xl p-6 md:p-8 max-w-lg w-full card-glow max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-text-muted font-mono mb-1">
                      ISIC {selected.isic}
                    </p>
                    <h3 className="text-xl font-bold text-text-primary">
                      {sectorName(selected)}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-text-muted hover:text-text-primary p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-text-muted">Total</p>
                    <p className="font-mono font-bold text-lg">
                      {formatNumber(getTotal(selected), lang)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Saudi</p>
                    <p className="font-mono font-bold text-lg">
                      {getPctSaudi(selected)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">AI Risk</p>
                    <RiskBadge
                      category={selected.ai_risk_category}
                      score={selected.ai_risk_score}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-text-secondary mb-1">
                      AI Risk Rationale
                    </h4>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {selected.ai_risk_rationale}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-bg-secondary rounded-lg p-3">
                      <p className="text-xs text-text-muted">
                        McKinsey Automatable
                      </p>
                      <p className="font-mono font-bold">
                        {selected.mckinsey_automatable_pct}%
                      </p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3">
                      <p className="text-xs text-text-muted">GenAI Exposure</p>
                      <p className="font-semibold">
                        {localRiskLabel(selected.genai_exposure)}
                      </p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3">
                      <p className="text-xs text-text-muted">V2030 Outlook</p>
                      <p className="font-semibold capitalize">
                        {selected.v2030_outlook.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3">
                      <p className="text-xs text-text-muted">
                        Nitaqat Pressure
                      </p>
                      <p className="font-semibold">
                        {localRiskLabel(selected.nitaqat_pressure)}
                      </p>
                    </div>
                  </div>

                  {/* Salary info */}
                  {selected.salary_saudi_avg && selected.salary_nonsaudi_avg && (
                    <div className="bg-bg-secondary/50 rounded-lg p-4 mt-4">
                      <h4 className="text-sm font-semibold text-text-secondary mb-3">
                        {t.salary.title}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-text-muted">{t.salary.saudiAvg}</p>
                          <p className="font-mono font-bold text-lg text-text-primary">
                            {formatNumber(selected.salary_saudi_avg, lang)}
                            <span className="text-xs text-text-muted font-normal ml-1">
                              {t.salary.currency}{t.salary.perMonth}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">{t.salary.nonSaudiAvg}</p>
                          <p className="font-mono font-bold text-lg text-text-primary">
                            {formatNumber(selected.salary_nonsaudi_avg, lang)}
                            <span className="text-xs text-text-muted font-normal ml-1">
                              {t.salary.currency}{t.salary.perMonth}
                            </span>
                          </p>
                        </div>
                      </div>
                      {/* Gap indicator */}
                      {selected.salary_saudi_avg > selected.salary_nonsaudi_avg && (
                        <p className="text-xs text-text-muted mt-2">
                          Gap: +{Math.round(((selected.salary_saudi_avg - selected.salary_nonsaudi_avg) / selected.salary_nonsaudi_avg) * 100)}%
                        </p>
                      )}
                    </div>
                  )}

                  {/* GOSI source note */}
                  {selected.gosi_q4_2024 && (
                    <p className="text-[10px] text-text-muted/40 mt-3">
                      {selected.gosi_q4_2024.source}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
