"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import RiskBadge from "@/components/shared/RiskBadge";
import InfoTooltip from "@/components/shared/InfoTooltip";
import { formatCompact, riskColor, scoreToCategory } from "@/lib/utils";
import { useLang, formatNumber } from "@/lib/i18n/context";
import data from "@/data/master.json";
import KSAMap from "./KSAMap";

const regions = data.regions;
type Region = (typeof regions)[number];

// Sector risk lookup for detail panel
const sectorRiskMap: Record<string, number> = {
  construction: 12,
  admin: 72,
  administrative: 72,
  manufacturing: 42,
  wholesale: 55,
  retail: 55,
  accommodation: 48,
  food: 48,
  agriculture: 18,
  mining: 35,
  transportation: 38,
  transport: 38,
  information: 52,
  communication: 52,
  finance: 62,
  "real estate": 45,
  professional: 58,
  education: 30,
  health: 15,
  human: 15,
  "public admin": 35,
  utilities: 30,
  water: 25,
  waste: 25,
  "other service": 40,
  arts: 35,
  entertainment: 35,
  domestic: 8,
};

// Extended English → Arabic sector name map for V2 sector_employment keys
const SECTOR_AR: Record<string, string> = {
  "Construction": "البناء والتشييد",
  "Admin & Support": "الخدمات الإدارية",
  "Manufacturing": "الصناعات التحويلية",
  "Wholesale & Retail": "التجارة",
  "Transport & Storage": "النقل والتخزين",
  "Human Health": "الصحة",
  "Accommodation & Food": "الضيافة والإطعام",
  "Info & Communication": "المعلومات والاتصالات",
  "Finance & Insurance": "المالية والتأمين",
  "Public Admin": "الإدارة العامة",
  "Agriculture": "الزراعة",
  "Mining & Quarrying": "التعدين",
  "Education": "التعليم",
  "Professional Services": "الخدمات المهنية",
  "Real Estate": "العقارات",
  "Water & Waste": "المياه والنفايات",
  "Other Services": "خدمات أخرى",
  "Domestic Workers": "العمالة المنزلية",
  // Legacy top3_sectors mappings
  "Admin & support": "الخدمات الإدارية والدعم",
  "Wholesale/retail": "تجارة الجملة/التجزئة",
  "Accommodation/food": "الإقامة والطعام",
};

/* V2030 priorities AR mapping for all 13 regions */
const V2030_PRIORITIES_AR: Record<string, string> = {
  "Riyadh": "المركز المالي والتقني؛ مقر نيوم المالي، مدينة الملك عبدالله المالية، مراكز الابتكار والذكاء الاصطناعي",
  "Makkah": "السياحة الدينية والخدمات؛ توسعة الحرم المكي، استضافة الحجاج والمعتمرين، التحول الرقمي في خدمات الضيافة",
  "Madinah": "السياحة الدينية والثقافية؛ توسعة المسجد النبوي، مشاريع التراث الثقافي، حدائق الملك سلمان",
  "Eastern Province": "مركز الطاقة والصناعات البتروكيماوية؛ تنويع أرامكو، مدن صناعية، مركز الابتكار في الظهران",
  "Aseer": "السياحة البيئية والزراعة؛ منتجعات جبلية، تطوير السياحة الطبيعية، مشاريع زراعية مستدامة",
  "Tabuk": "مشروع نيوم الضخم؛ ذا لاين، تروجينا، أوكساجون، سندالة",
  "Hail": "التعدين والزراعة؛ مركز الثروة المعدنية، زراعة القمح والزيتون، مشاريع الطاقة المتجددة",
  "Northern Borders": "التعدين واللوجستيات؛ مركز حدودي تجاري، مشاريع البنية التحتية",
  "Jazan": "الصناعة والزراعة؛ مدينة جازان للصناعات الأساسية، ميناء جازان، مشاريع زراعية",
  "Najran": "التراث والسياحة الثقافية؛ مواقع تاريخية، تطوير المنطقة الحدودية",
  "Al-Baha": "السياحة والزراعة؛ منتجعات جبلية، تطوير المنتزهات الطبيعية",
  "Al-Jouf": "الزراعة وزيت الزيتون؛ أكبر مزارع زيتون في الشرق الأوسط، مشاريع الطاقة الشمسية",
  "Qassim": "الزراعة والتجارة؛ مركز التمور، أسواق البريدة، مشاريع لوجستية",
};

function getSectorRisk(sectorName: string): number {
  const lower = sectorName.toLowerCase();
  for (const [key, val] of Object.entries(sectorRiskMap)) {
    if (lower.includes(key)) return val;
  }
  return 40;
}

/** Get top N sectors sorted by employment count */
function getTopSectors(region: Region, n = 5): { name: string; count: number }[] {
  const se = (region as Record<string, unknown>).sector_employment as
    | Record<string, number>
    | undefined;
  if (!se) return [];
  return Object.entries(se)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

/** Get GOSI Q4-2024 data if available */
function getGosi(region: Region) {
  return (region as Record<string, unknown>).gosi_q4_2024 as
    | { total: number; saudi: number; non_saudi: number; pct_saudi: number; source: string }
    | undefined;
}

/** Get V2030 priorities string */
function getV2030Priorities(region: Region): string | undefined {
  return (region as Record<string, unknown>).v2030_priorities as string | undefined;
}

export default function KSAMapSection() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState<Region>(
    regions.find((r) => r.name_en === "Riyadh") || regions[0]
  );

  const gosi = getGosi(selected);
  const topSectors = getTopSectors(selected, 5);
  const v2030Priorities = getV2030Priorities(selected);

  // Use GOSI Q4-2024 data when available, fallback to V1 fields
  const totalWorkers = gosi?.total ?? selected.total;
  const saudiPct = gosi?.pct_saudi ?? selected.pct_saudi;
  const nonSaudiCount = gosi?.non_saudi ?? (selected.total - Math.round(selected.total * selected.pct_saudi / 100));

  // Max count for bar width normalization
  const maxSectorCount = topSectors.length > 0 ? topSectors[0].count : 1;

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title={t.map.title}
          subtitle={t.map.subtitle}
          id="map"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Map - 3 cols */}
          <div className="lg:col-span-3">
            <KSAMap
              regions={regions}
              selectedRegion={selected.name_en}
              onSelectRegion={(name) => {
                const r = regions.find((reg) => reg.name_en === name);
                if (r) setSelected(r);
              }}
              lang={lang}
              riskLabels={{
                very_low: t.common.veryLow,
                low: t.common.low,
                moderate: t.common.moderate,
                high: t.common.high,
                very_high: t.common.veryHigh,
              }}
              legendLabels={t.map.legend}
            />
          </div>

          {/* Detail Panel - 2 cols */}
          <motion.div
            key={selected.name_en}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2 bg-bg-card rounded-2xl p-6 card-glow self-start border border-white/5"
          >
            {/* Header */}
            <h3 className="text-2xl font-bold text-text-primary">
              {lang === "ar" ? selected.name_ar : selected.name_en}
            </h3>
            <p className="text-sm text-text-muted">
              {lang === "ar" ? selected.name_en : selected.name_ar}
            </p>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Total Workers */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {t.map.detail.workers}
                </p>
                <p className="font-mono font-bold text-2xl text-accent-neon">
                  {formatNumber(totalWorkers, lang)}
                </p>
                <p className="text-xs text-text-muted/60">{t.map.detail.workersNote}</p>
              </div>
              {/* Saudi Share */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {t.map.detail.saudiShare}
                </p>
                <p className="font-mono font-bold text-2xl text-text-primary">
                  {saudiPct}%
                </p>
                <p className="text-xs text-text-muted/60">
                  {t.map.detail.saudiNote}
                </p>
              </div>
              {/* Non-Saudi */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {t.map.detail.nonSaudi}
                </p>
                <p className="font-mono font-bold text-2xl text-text-secondary">
                  {formatNumber(nonSaudiCount, lang)}
                </p>
                <p className="text-xs text-text-muted/60">
                  {(100 - saudiPct).toFixed(1)}%
                </p>
              </div>
              {/* AI Risk Score */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  {t.map.detail.riskScore}
                  <InfoTooltip text="Weighted average of AI risk scores for the dominant economic sectors in this region. Score 0-100 where higher = more tasks automatable." />
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="font-mono font-bold text-2xl"
                    style={{
                      color: riskColor(scoreToCategory(selected.ai_risk_score)),
                    }}
                  >
                    {selected.ai_risk_score}
                  </span>
                  <RiskBadge
                    category={scoreToCategory(selected.ai_risk_score)}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-text-muted/60">
                  {t.map.detail.riskNote}
                </p>
              </div>
              {/* GDP Share */}
              {selected.pib_share && (
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    {t.map.detail.gdpShare}
                  </p>
                  <p className="font-mono font-bold text-2xl text-text-primary">
                    {selected.pib_share}%
                  </p>
                  <p className="text-xs text-text-muted/60">{t.map.detail.gdpNote}</p>
                </div>
              )}
            </div>

            <hr className="border-white/5 my-5" />

            {/* Top Sectors by Employment — Horizontal bar chart */}
            {topSectors.length > 0 && (
              <>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
                  {t.map.detail.topSectors}
                </p>
                <div className="space-y-2.5">
                  {topSectors.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm text-text-secondary truncate flex-1">
                          {lang === "ar" && SECTOR_AR[s.name] ? SECTOR_AR[s.name] : s.name}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-mono text-text-muted">
                            {formatCompact(s.count)}
                          </span>
                          <RiskBadge
                            category={scoreToCategory(getSectorRisk(s.name))}
                            size="sm"
                          />
                        </div>
                      </div>
                      <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.count / maxSectorCount) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: riskColor(scoreToCategory(getSectorRisk(s.name))),
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Giga Projects */}
            {selected.giga_projects && selected.giga_projects.length > 0 && (
              <>
                <hr className="border-white/5 my-5" />
                <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
                  {t.map.detail.gigaProjects}
                  <InfoTooltip text="Major infrastructure projects funded by PIF as part of Vision 2030. These create significant construction employment now and permanent jobs at completion." />
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.giga_projects.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-2.5 py-1 bg-accent-gold/15 text-accent-gold rounded-full font-medium border border-accent-gold/20"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* V2030 Priorities */}
            {v2030Priorities && (
              <>
                <hr className="border-white/5 my-5" />
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
                  {t.map.detail.v2030Focus}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {lang === "ar" && V2030_PRIORITIES_AR[selected.name_en]
                    ? V2030_PRIORITIES_AR[selected.name_en]
                    : v2030Priorities}
                </p>
              </>
            )}

            {/* Worker count bar */}
            <hr className="border-white/5 my-5" />
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
              {t.map.detail.workers}
            </p>
            <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-neon/60"
                style={{
                  width: `${Math.min(100, (totalWorkers / 6000000) * 100)}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>{formatCompact(totalWorkers)} {lang === "ar" ? "عامل" : "workers"}</span>
              <span>
                {selected.name_en === "Riyadh"
                  ? (lang === "ar" ? "أكبر منطقة" : "Largest region")
                  : `${((totalWorkers / 11000000) * 100).toFixed(1)}% ${lang === "ar" ? "من الإجمالي" : "of total"}`}
              </span>
            </div>

            {/* Source */}
            {gosi && (
              <p className="text-[10px] text-text-muted/40 mt-3">
                {t.map.detail.gosiSource}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
