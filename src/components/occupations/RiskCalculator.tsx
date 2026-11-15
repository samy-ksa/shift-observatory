"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import RiskBadge from "@/components/shared/RiskBadge";
import { riskLabel, scoreToCategory } from "@/lib/utils";
import InfoTooltip from "@/components/shared/InfoTooltip";
import { useLang, formatNumber } from "@/lib/i18n/context";
import { localizedHref } from "@/lib/i18n/links";
import { toSlug } from "@/lib/occupations";
import { findClosestOccupations } from "@/lib/occupation-matcher";
import { getScoreTrend } from "@/data/score-history";
import data from "@/data/master.json";
import type { Occupation, SalaryContext, TaweenDecision } from "@/lib/data-types";

const salaryContext = (data as Record<string, unknown>).salary_context as SalaryContext | undefined;

const taweenDecisions = (
  (data as Record<string, unknown>).nitaqat as
    | { tawteen_decisions_2024_2025?: TaweenDecision[] }
    | undefined
)?.tawteen_decisions_2024_2025 ?? [];

const rankedOccupations: Occupation[] = [
  ...data.occupations.high_risk,
  ...data.occupations.low_risk,
].sort((a, b) => b.composite - a.composite) as Occupation[];
const seenOccupationNames = new Set<string>();
const allOccupations: Occupation[] = [
  ...data.occupations.high_risk,
  ...data.occupations.low_risk,
].filter((occupation) => {
  if (seenOccupationNames.has(occupation.name_en)) return false;
  seenOccupationNames.add(occupation.name_en);
  return true;
}).sort((a, b) => b.composite - a.composite) as Occupation[];

function categoryLabel(cat: string, labels: { fullSub: string; partialSub: string; augmentation: string }): string {
  const map: Record<string, string> = {
    substitution: labels.fullSub,
    substitution_partial: labels.partialSub,
    augmentation: labels.augmentation,
  };
  return map[cat] || cat;
}

function wefTrendLabel(trend: string | undefined, labels: { rapidDecline: string; declining: string; growing: string; notAvailable: string; stable: string }): string {
  if (!trend) return labels.notAvailable;
  return ({ decline_brutal: labels.rapidDecline, decline: labels.declining, stable: labels.stable, growth: labels.growing } as Record<string, string>)[trend] || trend.replace(/_/g, " ");
}

function wefTrendIcon(trend?: string): string {
  if (!trend) return "\u25CF";
  if (trend.includes("decline")) return "\u25BC";
  if (trend.includes("growth")) return "\u25B2";
  return "\u25CF";
}

// Fuzzy matching: exact → contains → word-level (searches name_en, name_ar, name_fr)
function fuzzyMatch(query: string, occupations: Occupation[]): Occupation[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // 1. Exact match
  const exact = occupations.filter(
    (o) =>
      o.name_en.toLowerCase() === q ||
      (o.name_ar && o.name_ar === q) ||
      (o.name_fr && o.name_fr.toLowerCase() === q)
  );
  if (exact.length) return exact;

  // 2. Contains match
  const contains = occupations.filter(
    (o) =>
      o.name_en.toLowerCase().includes(q) ||
      q.includes(o.name_en.toLowerCase().split(" ")[0]) ||
      (o.name_ar && o.name_ar.includes(q)) ||
      (o.name_fr && o.name_fr.toLowerCase().includes(q))
  );
  if (contains.length) return contains;

  // 3. Word-level match (any word in query matches any word in occupation)
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  const wordMatch = occupations.filter((o) => {
    const nameWords = o.name_en.toLowerCase().split(/\s+/);
    const frWords = o.name_fr ? o.name_fr.toLowerCase().split(/\s+/) : [];
    const allWords = [...nameWords, ...frWords];
    return words.some((w) =>
      allWords.some((ow) => ow.includes(w) || w.includes(ow))
    );
  });
  if (wordMatch.length) return wordMatch;

  // 4. No match
  return [];
}

// Get 5 suggested occupations when no match found
function getSuggestions(query: string, occupations: Occupation[]): Occupation[] {
  const q = query.toLowerCase();
  const scored = occupations.map((o) => {
    const name = o.name_en.toLowerCase();
    let score = 0;
    for (const word of q.split(/\s+/)) {
      if (word.length < 2) continue;
      for (const occWord of name.split(/\s+/)) {
        let shared = 0;
        for (let i = 0; i < Math.min(word.length, occWord.length); i++) {
          if (word[i] === occWord[i]) shared++;
          else break;
        }
        score += shared;
      }
    }
    return { occ: o, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.occ);
}

// Match tawteen decisions to an occupation by keyword overlap
function matchTaweenDecisions(occ: Occupation): TaweenDecision[] {
  const nameWords = occ.name_en.toLowerCase().split(/\s+/);
  return taweenDecisions.filter((d) => {
    const profWords = d.profession.toLowerCase().split(/\s+/);
    return nameWords.some(
      (w) => w.length > 3 && profWords.some((pw) => pw.includes(w) || w.includes(pw))
    );
  });
}

/* Tawteen profession AR mapping */
const TAWTEEN_PROFESSION_AR: Record<string, string> = {
  "Accountants": "المحاسبون",
  "Admin clerks": "الكتبة الإداريون",
  "HR specialists": "أخصائيو الموارد البشرية",
  "Marketing managers": "مديرو التسويق",
  "Sales representatives": "مندوبو المبيعات",
  "IT support": "دعم تقنية المعلومات",
  "Data entry operators": "مدخلو البيانات",
  "Customer service": "خدمة العملاء",
  "Procurement officers": "مسؤولو المشتريات",
  "Project coordinators": "منسقو المشاريع",
  "Warehouse supervisors": "مشرفو المستودعات",
  "Logistics coordinators": "منسقو الخدمات اللوجستية",
  "Receptionists": "موظفو الاستقبال",
  "Cashiers": "أمناء الصندوق",
  "Security guards": "حراس الأمن",
  "Drivers (light vehicles)": "سائقو المركبات الخفيفة",
  "Translators/Interpreters": "مترجمون",
  "Legal assistants": "مساعدون قانونيون",
  "Insurance agents": "وكلاء التأمين",
  "Travel agents": "وكلاء السفر",
};

/* Phase AR mapping */
const PHASE_AR: Record<string, string> = {
  "Phase 1": "المرحلة 1",
  "Phase 2": "المرحلة 2",
  "Phase 1-2": "المرحلة 1-2",
  "Current": "الحالي",
  "Enforced": "مطبق",
  "Regional": "إقليمي",
};

const PROGRAM_TYPE_AR: Record<string, string> = { "E-Training": "تدريب إلكتروني", "AI Literacy": "الإلمام بالذكاء الاصطناعي", "Digital Skills": "مهارات رقمية", Certification: "شهادة مهنية", "Wage Subsidy": "دعم الأجور", "On-the-job Training": "تدريب على رأس العمل", "Tech Training": "تدريب تقني", "On-the-Job Training": "تدريب على رأس العمل", "On-the-job": "على رأس العمل", "Sectoral Training": "تدريب قطاعي" };
const PROGRAM_TYPE_FR: Record<string, string> = { "E-Training": "Formation en ligne", "AI Literacy": "Initiation à l’IA", "Digital Skills": "Compétences numériques", Certification: "Certification", "Wage Subsidy": "Subvention salariale", "On-the-job Training": "Formation en situation de travail", "Tech Training": "Formation technique", "On-the-Job Training": "Formation en situation de travail", "On-the-job": "En situation de travail", "Sectoral Training": "Formation sectorielle" };
const PROGRAM_RELEVANCE_AR: Record<string, string> = { "Digital reskilling tracks (AI, data, cloud)": "مسارات إعادة التأهيل الرقمي (الذكاء الاصطناعي، البيانات، الحوسبة السحابية)", "Free AI fundamentals certificate (SDAIA)": "شهادة مجانية في أساسيات الذكاء الاصطناعي (سدايا)", "100K+ trainees across 40 digital learning tracks": "أكثر من 100K متدرب ضمن 40 مساراً للتعلم الرقمي", "HRDF reimburses up to SAR 1,350/cert for approved qualifications": "يعوض هدف حتى SAR 1,350 لكل شهادة مؤهلة", "30-50% salary subsidy up to SAR 3,000/month for 24 months": "دعم رواتب 30-50% حتى SAR 3,000 شهرياً لمدة 24 شهراً", "3-6 month placement; SAR 3,000/month stipend for graduates": "تدريب لمدة 3-6 أشهر؛ مكافأة SAR 3,000 شهرياً للخريجين", "Web dev, AI, cloud, game design programs": "برامج تطوير الويب والذكاء الاصطناعي والحوسبة السحابية وتصميم الألعاب", "Digital reskilling tracks": "مسارات إعادة التأهيل الرقمي", "On-the-job training for fresh graduates at top employers": "تدريب الخريجين الجدد على رأس العمل لدى كبار أصحاب العمل", "Mandatory for firms 50+ employees since 2024": "إلزامي للمنشآت التي تضم 50+ موظفاً منذ 2024", "34,299 tourism training beneficiaries in 2023": "استفاد 34,299 شخصاً من التدريب السياحي في 2023" };
const PROGRAM_RELEVANCE_FR: Record<string, string> = { "Digital reskilling tracks (AI, data, cloud)": "Parcours de reconversion numérique (IA, données, cloud)", "Free AI fundamentals certificate (SDAIA)": "Certificat gratuit sur les bases de l’IA (SDAIA)", "100K+ trainees across 40 digital learning tracks": "Plus de 100K stagiaires dans 40 parcours numériques", "HRDF reimburses up to SAR 1,350/cert for approved qualifications": "Le HRDF rembourse jusqu’à SAR 1,350 par certification approuvée", "30-50% salary subsidy up to SAR 3,000/month for 24 months": "Subvention salariale de 30-50% jusqu’à SAR 3,000/mois pendant 24 mois", "3-6 month placement; SAR 3,000/month stipend for graduates": "Stage de 3-6 mois ; allocation de SAR 3,000/mois pour les diplômés", "Web dev, AI, cloud, game design programs": "Programmes de développement web, IA, cloud et conception de jeux", "Digital reskilling tracks": "Parcours de reconversion numérique", "On-the-job training for fresh graduates at top employers": "Formation en emploi pour jeunes diplômés chez de grands employeurs", "Mandatory for firms 50+ employees since 2024": "Obligatoire depuis 2024 pour les entreprises de 50+ salariés", "34,299 tourism training beneficiaries in 2023": "34,299 bénéficiaires de formations au tourisme en 2023" };

type OccTab = "ai_risk" | "salary" | "nitaqat" | "reskilling";

export default function RiskCalculator() {
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Occupation | null>(null);
  const [showExpat, setShowExpat] = useState(false);
  const [activeTab, setActiveTab] = useState<OccTab>("ai_risk");

  const occName = (occ: Occupation) =>
    lang === "ar" && occ.name_ar ? occ.name_ar : lang === "fr" && occ.name_fr ? occ.name_fr : occ.name_en;

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    if (selected && (query === selected.name_en || query === selected.name_ar)) return [];
    return fuzzyMatch(query, allOccupations);
  }, [query, selected]);

  // Group by the same score boundary used for the verdict and colour.
  const highRiskFiltered = useMemo(
    () => filtered.filter((o) => o.composite > 45),
    [filtered]
  );
  const lowRiskFiltered = useMemo(
    () => filtered.filter((o) => o.composite <= 45),
    [filtered]
  );

  const suggestions = useMemo(() => {
    if (filtered.length > 0 || !query.trim() || query.length < 3) return [];
    if (selected) return [];
    return getSuggestions(query, allOccupations);
  }, [query, filtered, selected]);

  const showNotFound =
    query.length > 2 && !selected && filtered.length === 0;

  const handleSelect = (occ: Occupation) => {
    setSelected(occ);
    setQuery(occName(occ));
    setActiveTab("ai_risk");
  };

  // Dynamic verdict based on composite score
  function getVerdict(occ: Occupation): string {
    if (occ.composite > 70) return t.riskTool.verdicts.severe;
    if (occ.composite > 45) return t.riskTool.verdicts.significant;
    if (occ.composite > 25) return t.riskTool.verdicts.moderate;
    return t.riskTool.verdicts.protected;
  }

  // KSA context text
  function getKSAContext(occ: Occupation): string {
    const d = t.riskTool.details;
    if (occ.ksa_relevance === "very_high") return occ.nitaqat_risk === "very_high" ? d.contextVeryHighQuota : d.contextVeryHighExpat;
    return ({ high: d.contextHigh, moderate: d.contextModerate } as Record<string, string>)[occ.ksa_relevance] || d.contextOther;
  }

  const tabClass = (tab: OccTab) =>
    `flex-1 px-4 py-3 min-h-10 text-sm font-medium text-center transition-colors ${
      activeTab === tab
        ? "text-text-primary border-b-2 border-accent-primary"
        : "text-text-muted hover:text-text-secondary"
    }`;

  // Grouped dropdown item renderer
  const renderDropdownItem = (occ: Occupation) => (
    <button
      key={occ.name_en}
      onClick={() => handleSelect(occ)}
      className="w-full text-left px-4 py-3 hover:bg-bg-card-hover transition-all duration-200 ease-out flex items-center justify-between"
    >
      <span className="text-text-primary">{occName(occ)}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-text-muted">
          {occ.composite.toFixed(1)}
        </span>
        <RiskBadge
          category={scoreToCategory(occ.composite)}
          score={Math.round(occ.composite)}
          size="sm"
        />
      </div>
    </button>
  );

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title={t.riskTool.title}
          subtitle={t.riskTool.subtitle}
          id="calculator"
        />

        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            placeholder={t.riskTool.placeholder}
            className="w-full bg-bg-card border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-neon/50 focus:ring-1 focus:ring-accent-neon/30 transition-all"
          />

          {/* Grouped Dropdown */}
          {filtered.length > 0 && !selected && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-white/10 rounded-xl overflow-hidden z-20 max-h-72 overflow-y-auto">
              {highRiskFiltered.length > 0 && (
                <>
                  <div className="sticky top-0 z-10 bg-red-950/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-red-300 border-b border-white/5">
                    {t.riskTool.groupHighRisk} ({highRiskFiltered.length})
                  </div>
                  {highRiskFiltered.map(renderDropdownItem)}
                </>
              )}
              {lowRiskFiltered.length > 0 && (
                <>
                  <div className="sticky top-0 z-10 bg-green-950/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-green-300 border-b border-white/5">
                    {t.riskTool.groupLowRisk} ({lowRiskFiltered.length})
                  </div>
                  {lowRiskFiltered.map(renderDropdownItem)}
                </>
              )}
            </div>
          )}
        </div>

        {/* Expat toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 bg-bg-secondary rounded-full p-1">
            <button
              onClick={() => setShowExpat(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !showExpat
                  ? "bg-accent-saudi text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.hero.toggleSaudi}
            </button>
            <button
              onClick={() => setShowExpat(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                showExpat
                  ? "bg-accent-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.riskTool.expatToggle}
            </button>
          </div>
        </div>

        {/* "Not Found" UI */}
        <AnimatePresence mode="wait">
          {showNotFound && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-bg-card rounded-xl p-6 border border-white/5 text-center mb-6"
            >
              <p className="text-text-secondary text-lg">
                {t.riskTool.notFound}
              </p>
              <p className="text-text-muted text-sm mt-2">
                {t.riskTool.notFoundSub}
              </p>
              {suggestions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {suggestions.map((o) => (
                    <button
                      key={o.name_en}
                      onClick={() => handleSelect(o)}
                      className="bg-white/5 hover:bg-white/10 text-text-secondary px-3 py-1.5 rounded-full text-sm transition-colors border border-white/5"
                    >
                      {occName(o)}
                    </button>
                  ))}
                </div>
              )}

              {/* Occupation matcher — closest matches */}
              {query.length >= 2 && (
                <div className="mt-4 space-y-3 text-left">
                  <p className="text-sm text-gray-400">
                    <span className="text-white font-medium">&quot;{query}&quot;</span>{" "}
                    {t.match.matchNotFound}
                  </p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    {t.match.matchClosest}
                  </p>
                  {findClosestOccupations(query, 5).map((m) => (
                    <a
                      key={m.slug}
                      href={localizedHref(lang, `/job/${m.slug}`)}
                      className="block border border-gray-800 rounded-lg p-3 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium">
                          {lang === "ar" ? m.occupation.name_ar : lang === "fr" ? m.occupation.name_fr : m.occupation.name_en}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          m.score > 80 ? "bg-green-500/20 text-green-400" :
                          m.score > 50 ? "bg-amber-500/20 text-amber-400" :
                          "bg-gray-700 text-gray-400"
                        }`}>
                          {m.score}% {t.match.matchConfidence}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className={`w-2 h-2 rounded-full ${
                          m.occupation.composite > 70 ? "bg-red-500" :
                          m.occupation.composite > 40 ? "bg-amber-500" :
                          "bg-green-500"
                        }`} />
                        <span>{lang === "ar" ? "الذكاء الاصطناعي" : lang === "fr" ? "IA" : "AI"}: {m.occupation.composite}/100</span>
                        <span>|</span>
                        <span>{m.occupation.salary_entry_sar.toLocaleString()}-{m.occupation.salary_senior_sar.toLocaleString()} SAR</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-1">
                        {m.reason === "direct" ? t.match.matchDirect :
                         m.reason === "related" ? t.match.matchRelated :
                         t.match.matchFuzzy}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Card */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.name_en}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-bg-card rounded-xl card-glow overflow-hidden border border-white/5"
            >
              {/* HEADER with score gauge */}
              <div className="p-6 border-b border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-text-primary">
                      {occName(selected)}
                    </h3>
                  </div>
                  <RiskBadge
                    category={scoreToCategory(selected.composite)}
                    score={Math.round(selected.composite)}
                    size="lg"
                  />
                </div>
                {/* Animated gauge bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>{t.common.low}</span>
                    <span>
                      {t.riskTool.details.aiScore}{" "}
                      <span className="text-text-primary font-mono">
                        {selected.composite.toFixed(1)}
                      </span>{" "}
                      / 100
                      {(() => {
                        const trend = getScoreTrend(toSlug(selected.name_en), selected.composite);
                        if (trend.direction === "up") return (
                          <span className="text-red-400 text-xs font-mono ml-2">&#9650; +{trend.delta} {t.riskTool.details.vs} Q4-2025</span>
                        );
                        if (trend.direction === "down") return (
                          <span className="text-green-400 text-xs font-mono ml-2">&#9660; {trend.delta} {t.riskTool.details.vs} Q4-2025</span>
                        );
                        return <span className="text-text-muted text-xs font-mono ml-2">&#9473; {t.riskTool.details.stable}</span>;
                      })()}
                    </span>
                    <span>{t.common.veryHigh}</span>
                  </div>
                  <div className="relative risk-gauge-track">
                    <motion.div
                      initial={{ left: "0%" }}
                      animate={{ left: `${selected.composite}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="risk-gauge-marker"
                      style={{
                        backgroundColor: selected.composite > 70 ? '#EF4444' : selected.composite > 45 ? '#F97316' : selected.composite > 25 ? '#FBBF24' : '#10B981'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* TABS */}
              <div className="border-b border-white/5">
                <div className="flex">
                  <button
                    className={tabClass("ai_risk")}
                    onClick={() => setActiveTab("ai_risk")}
                  >
                    {t.riskTool.tabs.aiRisk}
                  </button>
                  {selected.salary_median_sar && (
                    <button
                      className={tabClass("salary")}
                      onClick={() => setActiveTab("salary")}
                    >
                      {t.riskTool.tabs.salary}
                    </button>
                  )}
                  <button
                    className={tabClass("nitaqat")}
                    onClick={() => setActiveTab("nitaqat")}
                  >
                    {t.riskTool.tabs.nitaqat}
                  </button>
                  <button
                    className={tabClass("reskilling")}
                    onClick={() => setActiveTab("reskilling")}
                  >
                    {t.riskTool.tabs.reskilling}
                  </button>
                </div>
              </div>

              {/* TAB: AI Risk (merged overview + details) */}
              {activeTab === "ai_risk" && (
                <div className="p-6 space-y-6">
                  {/* Verdict */}
                  <div className="bg-bg-secondary/50 rounded-lg p-4">
                    <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                      {t.riskTool.details.aiImpact}
                    </h4>
                    <p className="text-text-secondary leading-relaxed text-sm">
                      {getVerdict(selected)}
                    </p>
                  </div>

                  {/* Key metrics row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-bg-secondary/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-mono text-text-primary">
                        {selected.frey_osborne}%
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {t.riskTool.details.automation}
                      </p>
                    </div>
                    <div className="bg-bg-secondary/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-mono text-text-primary">
                        {selected.eloundou.toFixed(2)}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {t.riskTool.details.llm}
                      </p>
                    </div>
                    <div className="bg-bg-secondary/30 rounded-lg p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-lg font-semibold ${
                          selected.wef_trend?.includes("decline")
                            ? "text-risk-very-high"
                            : selected.wef_trend?.includes("growth")
                              ? "text-risk-very-low"
                              : "text-text-muted"
                        }`}
                      >
                        {wefTrendIcon(selected.wef_trend)}{" "}
                        {wefTrendLabel(selected.wef_trend, t.riskTool.details)}
                      </span>
                      <p className="text-xs text-text-muted mt-1">
                        {t.riskTool.details.wefOutlook}
                      </p>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-bg-secondary rounded-lg p-4">
                      <p className="text-xs text-text-muted mb-1">
                        Eloundou/OpenAI
                        <InfoTooltip text={t.riskTool.details.tooltipEloundou} />
                      </p>
                      <p className="font-mono font-bold text-2xl text-text-primary">
                        {selected.eloundou.toFixed(2)}{" "}
                        <span className="text-xs text-text-muted font-normal">
                          / 1.00
                        </span>
                      </p>
                      <div className="mt-2 h-2 bg-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-primary"
                          style={{
                            width: `${selected.eloundou * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-4">
                      <p className="text-xs text-text-muted mb-1">
                        Frey-Osborne
                        <InfoTooltip text={t.riskTool.details.tooltipFrey} />
                      </p>
                      <p className="font-mono font-bold text-2xl text-text-primary">
                        {selected.frey_osborne}%
                      </p>
                      <div className="mt-2 h-2 bg-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-primary"
                          style={{
                            width: `${selected.frey_osborne}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-4">
                      <p className="text-xs text-text-muted mb-1">
                        {t.riskTool.details.felten}
                        <InfoTooltip text={t.riskTool.details.tooltipFelten} />
                      </p>
                      <p className="font-semibold text-lg capitalize text-text-primary">
                        {({ very_high: t.riskTool.details.veryHigh, high: t.riskTool.details.high, moderate: t.riskTool.details.moderate, low: t.riskTool.details.low, very_low: t.common.veryLow } as Record<string, string>)[selected.felten] || riskLabel(selected.felten)}
                      </p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-4">
                      <p className="text-xs text-text-muted mb-1">
                        {t.riskTool.details.category}
                        <InfoTooltip text={t.riskTool.details.tooltipCategory} />
                      </p>
                      <p className="font-semibold text-sm text-text-primary">
                        {categoryLabel(selected.category, t.riskTool.details)}
                      </p>
                    </div>
                  </div>

                  {/* WEF Trend */}
                  {selected.wef_trend && (
                    <div className="bg-bg-secondary rounded-lg p-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-text-secondary">
                        {t.riskTool.details.wefTrend}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                          selected.wef_trend.includes("decline")
                            ? "bg-risk-very-high/15 text-risk-very-high"
                            : selected.wef_trend.includes("growth")
                              ? "bg-risk-very-low/15 text-risk-very-low"
                              : "bg-white/5 text-text-muted"
                        }`}
                      >
                        {wefTrendIcon(selected.wef_trend)}{" "}
                        {wefTrendLabel(selected.wef_trend, t.riskTool.details)}
                      </span>
                    </div>
                  )}

                  {/* Saudi context */}
                  <div className="bg-bg-secondary/50 rounded-lg p-4">
                    <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                      {t.riskTool.details.saudiContext}
                    </h4>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {getKSAContext(selected)}
                    </p>
                    <div className="mt-2 text-sm text-text-muted">
                      <span className="font-semibold text-text-secondary">
                        {t.riskTool.details.ksaRelevance}
                      </span>{" "}
                      <span className="capitalize">
                        {({ very_high: t.riskTool.details.veryHigh, high: t.riskTool.details.high, moderate: t.riskTool.details.moderate, low: t.riskTool.details.low } as Record<string, string>)[selected.ksa_relevance] || selected.ksa_relevance.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Demand rank */}
                  {(selected as Occupation).demand_rank_2024 && (
                    <div className="bg-bg-secondary/30 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-text-muted">
                        {t.riskTool.demandRank}
                      </span>
                      <span className="font-mono text-text-primary font-semibold">
                        #{(selected as Occupation).demand_rank_2024}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Salary */}
              {activeTab === "salary" && selected.salary_median_sar && (
                <div className="p-6 space-y-4">
                  <h4 className="text-sm font-semibold text-text-secondary">
                    {t.salary.title} ({t.salary.currency}{t.salary.perMonth})
                  </h4>

                  {/* Salary bars */}
                  {[
                    { label: t.salary.entry, value: selected.salary_entry_sar || 0 },
                    { label: t.salary.mid, value: selected.salary_median_sar },
                    { label: t.salary.senior, value: selected.salary_senior_sar || 0 },
                  ].map((bar) => (
                    <div key={bar.label} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-text-muted shrink-0">
                        {bar.label}
                      </span>
                      <div className="flex-1 h-7 bg-white/5 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(bar.value / 25000) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-cyan-500/60 rounded-full"
                        />
                        {/* National average reference line */}
                        {salaryContext && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400/70"
                            style={{
                              left: `${((showExpat ? salaryContext.nonsaudi_avg_monthly : salaryContext.saudi_avg_monthly) / 25000) * 100}%`,
                            }}
                            title={showExpat ? t.salary.nationalNonSaudi : t.salary.national}
                          />
                        )}
                      </div>
                      <span className="w-24 text-right font-mono text-sm text-text-primary shrink-0">
                        {formatNumber(bar.value, lang)}
                      </span>
                    </div>
                  ))}

                  {/* National average legend */}
                  {salaryContext && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-4 h-0.5 bg-yellow-400/70" />
                      <span className="text-xs text-text-muted">
                        {showExpat ? t.salary.nationalNonSaudi : t.salary.national}:{" "}
                        <span className="font-mono text-text-secondary">
                          {formatNumber(showExpat
                            ? salaryContext.nonsaudi_avg_monthly
                            : salaryContext.saudi_avg_monthly
                          , lang)}{" "}
                          {t.salary.currency}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Expat salary context */}
                  {showExpat && salaryContext && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3"
                    >
                      <p className="text-xs text-text-secondary">
                        {t.riskTool.details.expatSalary}
                      </p>
                    </motion.div>
                  )}

                  {/* Source & disclaimer */}
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-text-muted">
                    <span>{t.salary.source}: {lang === "ar" ? selected.salary_source_ar || selected.salary_source : lang === "fr" ? selected.salary_source_fr || selected.salary_source : selected.salary_source}</span>
                  </div>
                  <p className="text-xs text-text-muted/60">{t.salary.note}</p>
                </div>
              )}

              {/* TAB: Nitaqat */}
              {activeTab === "nitaqat" && (
                <div className="p-6 space-y-5">
                  <h4 className="text-sm font-semibold text-text-secondary">
                    {t.riskTool.nitaqat.title}
                  </h4>

                  {/* Nitaqat status badge */}
                  {(selected as Occupation).nitaqat_status === "reserved_saudi_only" ? (
                    <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-sm font-bold text-red-400">
                          {t.riskTool.nitaqat.reserved}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">
                        {t.riskTool.nitaqat.reservedDesc}
                      </p>
                    </div>
                  ) : (selected as Occupation).nitaqat_status === "sector_quota" ? (
                    <div className="bg-amber-950/30 border border-amber-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-sm font-bold text-amber-400">
                          {t.riskTool.nitaqat.sectorQuota}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">
                        {t.riskTool.nitaqat.sectorQuotaDesc}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-text-muted">
                        {t.riskTool.nitaqat.sectorQuotaDesc}
                      </p>
                    </div>
                  )}

                  {/* Saudization pressure from nitaqat_risk */}
                  {selected.nitaqat_risk && (
                    <div className="bg-bg-secondary/30 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-text-muted">
                        {t.riskTool.nitaqat.saudizationPressure}
                      </span>
                      <RiskBadge
                        category={scoreToCategory(
                          selected.nitaqat_risk === "very_high" ? 90 :
                          selected.nitaqat_risk === "high" ? 75 :
                          selected.nitaqat_risk === "moderate" ? 55 :
                          selected.nitaqat_risk === "low" ? 30 : 15
                        )}
                        score={0}
                        size="sm"
                      />
                    </div>
                  )}

                  {/* Expat double-exposure warning */}
                  {showExpat && selected.nitaqat_risk && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-risk-high/10 border border-risk-high/30 rounded-lg p-4"
                    >
                      <p className="text-sm font-semibold text-risk-high">
                        {t.riskTool.expatWarning}
                      </p>
                    </motion.div>
                  )}

                  {/* Tawteen decisions */}
                  <div>
                    <h5 className="text-xs uppercase tracking-wider text-text-muted mb-3">
                      {t.riskTool.nitaqat.taweenDecisions}
                    </h5>
                    {(() => {
                      const matches = matchTaweenDecisions(selected);
                      if (matches.length === 0) {
                        return (
                          <p className="text-sm text-text-muted italic">
                            {t.riskTool.nitaqat.noDecisions}
                          </p>
                        );
                      }
                      return (
                        <div className="space-y-3">
                          {matches.map((d, i) => (
                            <div
                              key={i}
                              className="bg-bg-secondary rounded-lg p-4 border border-white/5"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-text-primary">
                                  {lang === "ar" ? d.profession_ar || TAWTEEN_PROFESSION_AR[d.profession] || d.profession : lang === "fr" ? d.profession_fr || d.profession : d.profession}
                                </span>
                                <span className="font-mono text-sm text-accent-gold font-bold">
                                  {d.quota_pct}%{" "}
                                  <span className="text-xs text-text-muted font-normal">
                                    {t.riskTool.nitaqat.quotaPct}
                                  </span>
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                                <span className="bg-white/5 px-2 py-0.5 rounded">
                                  {lang === "ar" ? PHASE_AR[d.phase] || d.phase : lang === "fr" ? ({ "Phase 1": "Phase 1", "Phase 2": "Phase 2", "Phase 1-2": "Phases 1-2", Current: "En vigueur", Enforced: "Appliqué", Regional: "Régional" } as Record<string, string>)[d.phase] || d.phase : d.phase}
                                </span>
                                <span className="bg-white/5 px-2 py-0.5 rounded">
                                  {d.effective}
                                </span>
                              </div>
                              {d.note && (
                                <p className="text-xs text-text-muted mt-2">
                                  {lang === "ar" ? d.note_ar || d.note : lang === "fr" ? d.note_fr || d.note : d.note}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB: Reskilling */}
              {activeTab === "reskilling" && (
                <div className="p-6 space-y-4">
                  <h4 className="text-sm font-semibold text-text-secondary">
                    {t.riskTool.reskilling.title}
                  </h4>

                  {(() => {
                    const programs = (selected as Occupation).hrdf_programs;
                    if (!programs || programs.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-sm text-text-muted mb-4">
                            {t.riskTool.reskilling.noPrograms}
                          </p>
                          <a
                            href="https://www.hrdf.org.sa"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-lg text-sm font-medium transition-colors"
                          >
                            {t.riskTool.reskilling.visitHRDF} &rarr;
                          </a>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {programs.map((prog, i) => (
                          <div
                            key={i}
                            className="bg-bg-secondary rounded-lg p-4 border border-white/5"
                          >
                            <h5 className="text-sm font-bold text-text-primary">
                              {lang === "ar" && prog.name_ar
                                ? prog.name_ar
                                : prog.name}
                            </h5>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs">
                              <span className="text-text-muted">
                                <span className="font-semibold text-text-secondary">
                                  {t.riskTool.reskilling.type}:
                                </span>{" "}
                                {lang === "ar" ? PROGRAM_TYPE_AR[prog.type] || prog.type : lang === "fr" ? PROGRAM_TYPE_FR[prog.type] || prog.type : prog.type}
                              </span>
                              <span className="text-text-muted">
                                <span className="font-semibold text-text-secondary">
                                  {t.riskTool.reskilling.relevance}:
                                </span>{" "}
                                {lang === "ar" ? PROGRAM_RELEVANCE_AR[prog.relevance] || prog.relevance : lang === "fr" ? PROGRAM_RELEVANCE_FR[prog.relevance] || prog.relevance : prog.relevance}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 text-center">
                          <a
                            href="https://www.hrdf.org.sa"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent-primary hover:underline"
                          >
                            {t.riskTool.reskilling.visitHRDF} &rarr;
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* FOOTER */}
              <div className="p-4 border-t border-white/5 flex justify-between items-center">
                <Link
                  href={localizedHref(lang, `/job/${toSlug(selected.name_en)}`)}
                  className="text-xs text-accent-neon hover:text-cyan-300 transition-colors font-medium"
                >
                  {t.jobPage.viewFullAnalysis}
                </Link>
                <span className="text-xs text-text-muted">
                  {t.riskTool.details.rank}{rankedOccupations.indexOf(selected) + 1} {t.riskTool.rankOf} {rankedOccupations.length} {t.riskTool.occupationsCount}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default: show top high risk */}
        {!selected && !showNotFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-text-muted mt-8"
          >
            <p className="text-sm mb-6">
              {t.riskTool.notFoundSub}
            </p>
            <div className="flex overflow-x-auto mobile-scroll gap-2 pb-2">
              {allOccupations.slice(0, 12).map((occ) => (
                <button
                  key={occ.name_en}
                  onClick={() => handleSelect(occ)}
                  className="flex-shrink-0 min-h-10 px-3 py-1.5 bg-bg-card hover:bg-bg-card-hover rounded-full text-sm text-text-secondary hover:text-text-primary transition-colors border border-white/5"
                >
                  {occName(occ)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
