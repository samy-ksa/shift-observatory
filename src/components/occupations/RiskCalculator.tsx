"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import RiskBadge from "@/components/shared/RiskBadge";
import { riskLabel, scoreToCategory } from "@/lib/utils";
import InfoTooltip from "@/components/shared/InfoTooltip";
import { useLang, formatNumber } from "@/lib/i18n/context";
import data from "@/data/master.json";
import type { Occupation, SalaryContext, TaweenDecision } from "@/lib/data-types";

const salaryContext = (data as Record<string, unknown>).salary_context as SalaryContext | undefined;

const taweenDecisions = (
  (data as Record<string, unknown>).nitaqat as
    | { tawteen_decisions_2024_2025?: TaweenDecision[] }
    | undefined
)?.tawteen_decisions_2024_2025 ?? [];

// Build sets for grouping
const highRiskNames = new Set(
  (data.occupations.high_risk as Occupation[]).map((o) => o.name_en)
);

const allOccupations: Occupation[] = [
  ...data.occupations.high_risk,
  ...data.occupations.low_risk,
].sort((a, b) => b.composite - a.composite) as Occupation[];

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    substitution: "Full Substitution",
    substitution_partial: "Partial Substitution",
    augmentation: "Augmentation (AI as co-pilot)",
  };
  return map[cat] || cat;
}

const wefTrendLabels: Record<string, string> = {
  decline_brutal: "Rapid Decline",
  decline: "Declining",
  stable: "Stable",
  growth: "Growing",
};

function wefTrendLabel(trend?: string): string {
  if (!trend) return "N/A";
  return wefTrendLabels[trend] || trend.replace(/_/g, " ");
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

type OccTab = "ai_risk" | "salary" | "nitaqat" | "reskilling";

export default function RiskCalculator() {
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Occupation | null>(null);
  const [showExpat, setShowExpat] = useState(false);
  const [activeTab, setActiveTab] = useState<OccTab>("ai_risk");

  const occName = (occ: Occupation) =>
    lang === "ar" && occ.name_ar ? occ.name_ar : occ.name_en;

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    if (selected && (query === selected.name_en || query === selected.name_ar)) return [];
    return fuzzyMatch(query, allOccupations);
  }, [query, selected]);

  // Split filtered into high risk / low risk groups
  const highRiskFiltered = useMemo(
    () => filtered.filter((o) => highRiskNames.has(o.name_en)),
    [filtered]
  );
  const lowRiskFiltered = useMemo(
    () => filtered.filter((o) => !highRiskNames.has(o.name_en)),
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
    if (occ.composite > 85) return t.riskTool.verdicts.severe;
    if (occ.composite > 65) return t.riskTool.verdicts.significant;
    if (occ.composite > 40) return t.riskTool.verdicts.moderate;
    return t.riskTool.verdicts.protected;
  }

  // KSA context text
  function getKSAContext(occ: Occupation): string {
    const contexts: Record<string, string> = {
      very_high: `This occupation is highly relevant in the Saudi market. With ${occ.nitaqat_risk === "very_high" ? "aggressive Saudization targets" : "a large expatriate workforce"}, the double pressure of AI automation and Nitaqat compliance creates unique challenges.`,
      high: `This occupation is significant in Saudi Arabia's economy, particularly in the context of Vision 2030 economic diversification.`,
      moderate: `This role exists in the Saudi market but may have different dynamics compared to Western economies due to the Nitaqat system and Vision 2030 priorities.`,
    };
    return (
      contexts[occ.ksa_relevance] ||
      "This occupation is present in the Saudi labor market."
    );
  }

  const tabClass = (tab: OccTab) =>
    `flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
      activeTab === tab
        ? "text-text-primary border-b-2 border-accent-primary"
        : "text-text-muted hover:text-text-secondary"
    }`;

  // Grouped dropdown item renderer
  const renderDropdownItem = (occ: Occupation) => (
    <button
      key={occ.name_en}
      onClick={() => handleSelect(occ)}
      className="w-full text-left px-4 py-3 hover:bg-bg-card-hover transition-colors flex items-center justify-between"
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
              className="bg-bg-card rounded-2xl card-glow overflow-hidden border border-white/5"
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
                      AI Risk Score:{" "}
                      <span className="text-text-primary font-mono">
                        {selected.composite.toFixed(1)}
                      </span>{" "}
                      / 100
                    </span>
                    <span>{t.common.veryHigh}</span>
                  </div>
                  <div className="h-4 bg-bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selected.composite}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
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
                      AI Impact Assessment
                    </h4>
                    <p className="text-text-secondary leading-relaxed text-sm">
                      {getVerdict(selected)}
                    </p>
                  </div>

                  {/* Key metrics row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-bg-secondary/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-mono text-text-primary">
                        {selected.frey_osborne}%
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        Automation prob.
                      </p>
                    </div>
                    <div className="bg-bg-secondary/30 rounded-lg p-3 text-center">
                      <p className="text-2xl font-mono text-text-primary">
                        {selected.eloundou.toFixed(2)}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        LLM exposure
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
                        {wefTrendLabel(selected.wef_trend)}
                      </span>
                      <p className="text-xs text-text-muted mt-1">
                        WEF 2030 outlook
                      </p>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-bg-secondary rounded-lg p-4">
                      <p className="text-xs text-text-muted mb-1">
                        Eloundou/OpenAI
                        <InfoTooltip text="Measures what percentage of an occupation's tasks could be significantly impacted by Large Language Models (like ChatGPT). 0 = no impact, 1 = all tasks affected. Source: OpenAI/UPenn 2023." />
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
                        <InfoTooltip text="Probability that this occupation will be automated within the next 10-20 years, based on the original Oxford University study of 702 occupations. Published in 2017, before the GenAI revolution." />
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
                        Felten AIOE
                        <InfoTooltip text="AI Occupational Exposure Index: measures how well current AI capabilities (language, vision, reasoning) map to the tasks required by this occupation. Updated annually." />
                      </p>
                      <p className="font-semibold text-lg capitalize text-text-primary">
                        {riskLabel(selected.felten)}
                      </p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-4">
                      <p className="text-xs text-text-muted mb-1">
                        Category
                        <InfoTooltip text="Substitution = AI replaces the worker entirely. Partial Substitution = some tasks automated, others remain. Augmentation = AI makes the worker more productive but doesn't replace them." />
                      </p>
                      <p className="font-semibold text-sm text-text-primary">
                        {categoryLabel(selected.category)}
                      </p>
                    </div>
                  </div>

                  {/* WEF Trend */}
                  {selected.wef_trend && (
                    <div className="bg-bg-secondary rounded-lg p-4 flex items-center gap-3">
                      <span className="text-sm font-semibold text-text-secondary">
                        WEF 2030 Trend:
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
                        {wefTrendLabel(selected.wef_trend)}
                      </span>
                    </div>
                  )}

                  {/* Saudi context */}
                  <div className="bg-bg-secondary/50 rounded-lg p-4">
                    <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                      Saudi Arabia Context
                    </h4>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {getKSAContext(selected)}
                    </p>
                    <div className="mt-2 text-sm text-text-muted">
                      <span className="font-semibold text-text-secondary">
                        KSA Relevance:
                      </span>{" "}
                      <span className="capitalize">
                        {selected.ksa_relevance.replace(/_/g, " ")}
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
                        {lang === "ar"
                          ? "رواتب الوافدين عادةً أقل بنسبة 40-60% من المواطنين السعوديين لنفس الأدوار"
                          : "Expat salaries are typically 40-60% lower than Saudi nationals for equivalent roles"}
                      </p>
                    </motion.div>
                  )}

                  {/* Source & disclaimer */}
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs text-text-muted">
                    <span>{t.salary.source}: {selected.salary_source}</span>
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
                                  {lang === "ar" && TAWTEEN_PROFESSION_AR[d.profession] ? TAWTEEN_PROFESSION_AR[d.profession] : d.profession}
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
                                  {lang === "ar" && PHASE_AR[d.phase] ? PHASE_AR[d.phase] : d.phase}
                                </span>
                                <span className="bg-white/5 px-2 py-0.5 rounded">
                                  {d.effective}
                                </span>
                              </div>
                              {d.note && (
                                <p className="text-xs text-text-muted mt-2">
                                  {d.note}
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
                                {prog.type}
                              </span>
                              <span className="text-text-muted">
                                <span className="font-semibold text-text-secondary">
                                  {t.riskTool.reskilling.relevance}:
                                </span>{" "}
                                {prog.relevance}
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
              <div className="p-4 border-t border-white/5 flex justify-end items-center">
                <span className="text-xs text-text-muted">
                  Rank #{selected.rank} {t.riskTool.rankOf} {allOccupations.length} {t.riskTool.occupationsCount}
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
            <div className="flex flex-wrap justify-center gap-2">
              {allOccupations.slice(0, 12).map((occ) => (
                <button
                  key={occ.name_en}
                  onClick={() => handleSelect(occ)}
                  className="px-3 py-1.5 bg-bg-card hover:bg-bg-card-hover rounded-full text-sm text-text-secondary hover:text-text-primary transition-colors border border-white/5"
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
