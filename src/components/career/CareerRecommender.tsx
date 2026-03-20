"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang, formatNumber } from "@/lib/i18n/context";
import {
  scoreToCategory,
  riskBg,
  riskColor,
  recommendTransitions,
} from "@/lib/utils";
import { exportCareerPDF } from "@/lib/export-pdf";
import data from "@/data/master.json";
import type { Occupation } from "@/lib/data-types";
import LangToggle from "@/components/ui/LangToggle";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shift-observatory.vercel.app";

const allOccupations: Occupation[] = [
  ...(data.occupations.high_risk as Occupation[]),
  ...(data.occupations.low_risk as Occupation[]),
].sort((a, b) => a.name_en.localeCompare(b.name_en));

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

function fromSlug(slug: string): Occupation | undefined {
  return allOccupations.find((o) => toSlug(o.name_en) === slug);
}

/* ── Display Mappings ── */
function fmtCategory(cat: string | undefined | null, lang: string): string {
  if (!cat) return "\u2014";
  const map: Record<string, { en: string; ar: string; fr: string }> = {
    substitution: { en: "Full Substitution", ar: "\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0643\u0627\u0645\u0644", fr: "Substitution complète" },
    substitution_partial: { en: "Partial Substitution", ar: "\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u062C\u0632\u0626\u064A", fr: "Substitution partielle" },
    augmentation: { en: "Augmentation", ar: "\u062A\u0639\u0632\u064A\u0632", fr: "Augmentation" },
  };
  const entry = map[cat];
  if (!entry) return cat;
  return lang === "ar" ? entry.ar : lang === "fr" ? entry.fr : entry.en;
}

function fmtWefTrend(trend: string | undefined | null, lang: string): string {
  if (!trend) return "\u2014";
  const map: Record<string, { en: string; ar: string; fr: string }> = {
    decline_brutal: { en: "\uD83D\uDCC9 Sharp Decline", ar: "\uD83D\uDCC9 \u062A\u0631\u0627\u062C\u0639 \u062D\u0627\u062F", fr: "\uD83D\uDCC9 D\u00E9clin rapide" },
    decline_moderate: { en: "\uD83D\uDCC9 Moderate Decline", ar: "\uD83D\uDCC9 \u062A\u0631\u0627\u062C\u0639 \u0645\u0639\u062A\u062F\u0644", fr: "\uD83D\uDCC9 D\u00E9clin mod\u00E9r\u00E9" },
    decline: { en: "\uD83D\uDCC9 Declining", ar: "\uD83D\uDCC9 \u062A\u0631\u0627\u062C\u0639", fr: "\uD83D\uDCC9 En d\u00E9clin" },
    growth_rapid: { en: "\uD83D\uDCC8 Rapid Growth", ar: "\uD83D\uDCC8 \u0646\u0645\u0648 \u0633\u0631\u064A\u0639", fr: "\uD83D\uDCC8 Croissance rapide" },
    growth_moderate: { en: "\uD83D\uDCC8 Moderate Growth", ar: "\uD83D\uDCC8 \u0646\u0645\u0648 \u0645\u0639\u062A\u062F\u0644", fr: "\uD83D\uDCC8 Croissance mod\u00E9r\u00E9e" },
    stable: { en: "\u27A1\uFE0F Stable", ar: "\u27A1\uFE0F \u0645\u0633\u062A\u0642\u0631", fr: "\u27A1\uFE0F Stable" },
  };
  const entry = map[trend];
  if (!entry) return trend;
  return lang === "ar" ? entry.ar : lang === "fr" ? entry.fr : entry.en;
}

function fmtNitaqatStatus(
  status: string | undefined | null,
  lang: string
): string {
  if (!status) return "\u2014";
  const map: Record<string, { en: string; ar: string; fr: string }> = {
    reserved_saudi_only: {
      en: "\u26D4 Saudi Only",
      ar: "\u26D4 \u0633\u0639\u0648\u062F\u064A\u0648\u0646 \u0641\u0642\u0637",
      fr: "\u26D4 Saoudiens uniquement",
    },
    sector_quota: {
      en: "\u2705 Sector Quota",
      ar: "\u2705 \u062D\u0635\u0629 \u0642\u0637\u0627\u0639\u064A\u0629",
      fr: "\u2705 Quota sectoriel",
    },
  };
  const entry = map[status];
  if (!entry) return status;
  return lang === "ar" ? entry.ar : lang === "fr" ? entry.fr : entry.en;
}

/* ── Autocomplete Dropdown ── */
function OccupationPicker({
  label,
  onSelect,
  lang,
}: {
  label: string;
  onSelect: (o: Occupation) => void;
  lang: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return allOccupations.slice(0, 12);
    const q = query.toLowerCase();
    return allOccupations
      .filter(
        (o) =>
          o.name_en.toLowerCase().includes(q) || o.name_ar.includes(query)
      )
      .slice(0, 12);
  }, [query]);

  return (
    <div className="w-full">
      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={label}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent-primary focus:outline-none text-sm"
        />
        {open && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-white/10 rounded-xl max-h-60 overflow-y-auto z-30">
            {filtered.map((occ) => (
              <button
                key={occ.name_en}
                onClick={() => {
                  onSelect(occ);
                  setQuery(lang === "ar" ? occ.name_ar : lang === "fr" && occ.name_fr ? occ.name_fr : occ.name_en);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="truncate">
                    <span className="text-white text-sm">
                      {lang === "ar" ? occ.name_ar : lang === "fr" ? occ.name_fr : occ.name_en}
                    </span>
                    {occ.emerging && (
                      <span className={`${lang === "ar" ? "mr-2" : "ml-2"} text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-semibold`}>
                        NEW
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-mono flex-shrink-0 ${riskBg(
                      scoreToCategory(occ.composite)
                    )} px-2 py-0.5 rounded-full`}
                  >
                    {occ.composite}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Mini Score Gauge ── */
function MiniGauge({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const cat = scoreToCategory(score);
  const color = riskColor(cat);
  const pct = score / 100;
  return (
    <div className="flex items-center gap-2">
      <div className={`${size === "sm" ? "w-12 h-1.5" : "w-16 h-2"} rounded-full bg-white/10 overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
      <span
        className={`font-mono font-bold ${size === "sm" ? "text-xs" : "text-sm"}`}
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

/* ── Demand Badge ── */
function DemandBadge({
  signal,
  t,
}: {
  signal: string;
  t: { highDemand: string; growing: string; stable: string; emerging: string };
}) {
  const config: Record<string, { label: string; color: string }> = {
    high_demand: { label: t.highDemand, color: "bg-green-500/20 text-green-400" },
    growing: { label: t.growing, color: "bg-blue-500/20 text-blue-400" },
    emerging: { label: t.emerging, color: "bg-purple-500/20 text-purple-400" },
    stable: { label: t.stable, color: "bg-gray-500/20 text-gray-400" },
  };
  const c = config[signal] || config.stable;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.color}`}>
      {c.label}
    </span>
  );
}

/* ── Difficulty Pill ── */
function DifficultyPill({
  difficulty,
  t,
}: {
  difficulty: string;
  t: { easy: string; moderate: string; hard: string };
}) {
  const config: Record<string, { label: string; icon: string; color: string }> = {
    easy: { label: t.easy, icon: "\uD83D\uDFE2", color: "text-green-400" },
    moderate: { label: t.moderate, icon: "\uD83D\uDFE1", color: "text-yellow-400" },
    hard: { label: t.hard, icon: "\uD83D\uDFE0", color: "text-orange-400" },
  };
  const c = config[difficulty] || config.hard;
  return (
    <span className={`text-xs font-medium ${c.color}`}>
      {c.icon} {c.label}
    </span>
  );
}

/* ════════════════════════════════════════════════
   Main CareerRecommender
   ════════════════════════════════════════════════ */
type SortMode = "best_match" | "highest_salary" | "lowest_risk" | "easiest";

export default function CareerRecommender() {
  const { t, lang, dir } = useLang();
  const c = t.career;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selected, setSelected] = useState<Occupation | null>(null);
  const [isExpat, setIsExpat] = useState(false);
  const [sortBy, setSortBy] = useState<SortMode>("best_match");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [careerEmail, setCareerEmail] = useState("");
  const [careerEmailStatus, setCareerEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Initialize from URL params
  useEffect(() => {
    const occ = searchParams.get("occ");
    const sort = searchParams.get("sort") as SortMode | null;
    if (occ) {
      const found = fromSlug(occ);
      if (found) setSelected(found);
    }
    if (sort && ["best_match", "highest_salary", "lowest_risk", "easiest"].includes(sort)) {
      setSortBy(sort);
    }
  }, [searchParams]);

  // Update URL when selections change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selected) params.set("occ", toSlug(selected.name_en));
    if (sortBy !== "best_match") params.set("sort", sortBy);
    const qs = params.toString();
    router.replace(qs ? `/career?${qs}` : "/career", { scroll: false });
  }, [selected, sortBy, router]);

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!selected) return [];
    return recommendTransitions(selected, allOccupations, isExpat);
  }, [selected, isExpat]);

  // Sort recommendations
  const sorted = useMemo(() => {
    const arr = [...recommendations];
    switch (sortBy) {
      case "highest_salary":
        arr.sort((a, b) => b.salary_change_pct - a.salary_change_pct);
        break;
      case "lowest_risk":
        arr.sort((a, b) => a.occupation.composite - b.occupation.composite);
        break;
      case "easiest":
        arr.sort((a, b) => b.skills_overlap - a.skills_overlap);
        break;
      default:
        // already sorted by score
        break;
    }
    return arr;
  }, [recommendations, sortBy]);

  // Share
  const shareUrl = useMemo(() => {
    if (!selected) return BASE_URL + "/career";
    return `${BASE_URL}/career?occ=${toSlug(selected.name_en)}`;
  }, [selected]);

  const shareText = useMemo(() => {
    if (!selected) return c.shareText;
    const name = lang === "ar" ? selected.name_ar : lang === "fr" ? selected.name_fr : selected.name_en;
    const topRec = sorted[0];
    if (!topRec) return c.shareText;
    const topName = lang === "ar" ? topRec.occupation.name_ar : lang === "fr" ? topRec.occupation.name_fr : topRec.occupation.name_en;
    return lang === "ar"
      ? `\uD83D\uDE80 \u0627\u0643\u062A\u0634\u0641\u062A \u0623\u0646 "${topName}" \u0647\u064A \u0623\u0641\u0636\u0644 \u062A\u062D\u0648\u0644 \u0645\u0647\u0646\u064A \u0645\u0646 "${name}" \u0639\u0628\u0631 \u0645\u0631\u0635\u062F \u0634\u064A\u0641\u062A!`
      : `\uD83D\uDE80 Discovered "${topName}" as my best AI-safe career transition from "${name}" on SHIFT Observatory!`;
  }, [selected, sorted, lang, c.shareText]);

  const handleShare = (platform: string) => {
    let url = "";
    switch (platform) {
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
        break;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // PDF
  const handlePdf = async () => {
    if (!selected || sorted.length === 0) return;
    setPdfLoading(true);
    try {
      await exportCareerPDF(
        {
          currentJob_en: selected.name_en,
          currentJob_ar: selected.name_ar,
          currentScore: selected.composite,
          currentCategory: scoreToCategory(selected.composite),
          transitions: sorted.slice(0, 5).map((r) => ({
            name_en: r.occupation.name_en,
            composite: r.occupation.composite,
            salaryChange: `${r.salary_change_pct > 0 ? "+" : ""}${r.salary_change_pct}%`,
            difficulty: r.transition_difficulty,
            emerging: r.is_emerging,
          })),
          status: isExpat ? "Expat" : "Saudi",
        },
        `shift-career-${toSlug(selected.name_en)}.pdf`
      );
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-20 md:pb-0" dir={dir}>
      <LangToggle />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-4xl mb-3 block">{"\uD83D\uDE80"}</span>
          <h1 className="text-3xl font-bold text-white">{c.title}</h1>
          <p className="text-text-muted mt-2 text-sm">{c.subtitle}</p>
        </div>

        {/* Occupation Picker + Status Toggle */}
        <div className="max-w-xl mx-auto mb-8 space-y-4">
          <OccupationPicker
            label={c.selectOccupation}
            onSelect={setSelected}
            lang={lang}
          />

          {/* Saudi / Expat Toggle */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsExpat(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !isExpat
                  ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                  : "bg-white/5 text-text-muted border border-white/10 hover:bg-white/10"
              }`}
            >
              {c.saudi}
            </button>
            <button
              onClick={() => setIsExpat(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isExpat
                  ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                  : "bg-white/5 text-text-muted border border-white/10 hover:bg-white/10"
              }`}
            >
              {c.expat}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.name_en}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* ── Current Risk Card ── */}
              <div className="bg-bg-card border border-white/5 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  {c.yourRisk}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg">
                      {lang === "ar" ? selected.name_ar : lang === "fr" ? selected.name_fr : selected.name_en}
                    </div>
                    <div className="text-text-muted text-xs mt-0.5">
                      {lang === "ar" ? selected.name_en : selected.name_ar}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${riskBg(scoreToCategory(selected.composite))}`}>
                        {fmtCategory(selected.category, lang)}
                      </span>
                      {selected.wef_trend && (
                        <span className="text-xs text-text-muted">
                          {fmtWefTrend(selected.wef_trend, lang)}
                        </span>
                      )}
                      {selected.nitaqat_status && (
                        <span className="text-xs text-text-muted">
                          {fmtNitaqatStatus(selected.nitaqat_status, lang)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-3xl font-mono font-bold ${riskBg(
                        scoreToCategory(selected.composite)
                      )} px-4 py-2 rounded-xl`}
                    >
                      {selected.composite}
                    </div>
                    <div className="text-xs text-text-muted">
                      /100
                      <br />
                      {c.score}
                    </div>
                  </div>
                </div>
                {/* Extra info row */}
                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-text-muted">
                  {selected.salary_median_sar && (
                    <span>{c.salary}: {formatNumber(selected.salary_median_sar, lang)} SAR</span>
                  )}
                  {selected.demand_rank_2024 && (
                    <span>{c.demandRank}: #{selected.demand_rank_2024}</span>
                  )}
                </div>
              </div>

              {/* ── Sort & Count ── */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {c.recommendations}{" "}
                  <span className="text-sm font-normal text-text-muted">
                    ({sorted.length})
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{c.sortBy}:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortMode)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-primary"
                  >
                    <option value="best_match">{c.sortBest}</option>
                    <option value="highest_salary">{c.sortSalary}</option>
                    <option value="lowest_risk">{c.sortRisk}</option>
                    <option value="easiest">{c.sortEasy}</option>
                  </select>
                </div>
              </div>

              {/* ── Recommendation Cards ── */}
              {sorted.length === 0 ? (
                <div className="text-center py-12 text-text-muted">{c.noResults}</div>
              ) : (
                <div className="space-y-3">
                  {sorted.map((rec, idx) => (
                    <motion.div
                      key={rec.occupation.name_en}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-bg-card border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
                    >
                      {/* Card header */}
                      <button
                        onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                        className="w-full text-left p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* Name + badges */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {rec.is_emerging && (
                                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                  {"\uD83C\uDD95"} {c.emerging}
                                </span>
                              )}
                              <DemandBadge signal={rec.demand_signal} t={c} />
                            </div>
                            <div className="text-white font-semibold mt-1">
                              {lang === "ar" ? rec.occupation.name_ar : lang === "fr" ? rec.occupation.name_fr : rec.occupation.name_en}
                            </div>
                            <div className="text-text-muted text-xs">
                              {lang === "ar" ? rec.occupation.name_en : rec.occupation.name_ar}
                            </div>
                          </div>

                          {/* Score gauge */}
                          <div className="flex-shrink-0">
                            <MiniGauge score={rec.occupation.composite} />
                          </div>
                        </div>

                        {/* Metrics row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                          {/* Risk reduction */}
                          <div>
                            <div className="text-[10px] text-text-muted uppercase">{c.riskReduction}</div>
                            <div className="text-green-400 text-sm font-bold">
                              {"\u25BC"} {rec.risk_reduction} {c.pointsLower}
                            </div>
                          </div>

                          {/* Salary change */}
                          <div>
                            <div className="text-[10px] text-text-muted uppercase">{c.salaryChange}</div>
                            <div className={`text-sm font-bold ${rec.salary_change_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {rec.salary_change_pct > 0 ? "+" : ""}{rec.salary_change_pct}%
                            </div>
                          </div>

                          {/* Skills overlap */}
                          <div>
                            <div className="text-[10px] text-text-muted uppercase">{c.skillsOverlap}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-accent-primary transition-all duration-500"
                                  style={{ width: `${rec.skills_overlap}%` }}
                                />
                              </div>
                              <span className="text-xs text-text-secondary">{rec.skills_overlap}%</span>
                            </div>
                          </div>

                          {/* Difficulty */}
                          <div>
                            <div className="text-[10px] text-text-muted uppercase">{c.difficulty}</div>
                            <DifficultyPill difficulty={rec.transition_difficulty} t={c} />
                          </div>
                        </div>

                        {/* Insight */}
                        <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                          {lang === "ar" ? rec.insight_ar : rec.insight}
                        </p>
                      </button>

                      {/* Expandable training path */}
                      <AnimatePresence>
                        {expandedIdx === idx && rec.training_path.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-white/5">
                              <div className="text-xs font-semibold text-accent-primary mb-2">
                                {c.trainingPath}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {rec.training_path.map((step, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-white/5 text-text-secondary px-3 py-1 rounded-full border border-white/5"
                                  >
                                    {i + 1}. {step}
                                  </span>
                                ))}
                              </div>
                              {/* Skills required */}
                              {rec.occupation.skills_required && rec.occupation.skills_required.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-xs font-semibold text-text-muted mb-1">
                                    {c.skillsRequired}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {rec.occupation.skills_required.map((skill, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ── Action Buttons ── */}
              {sorted.length > 0 && (
                <div className="space-y-4 mt-6">
                  {/* Email CTA */}
                  <div className="bg-bg-card border border-accent-primary/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-text-secondary mb-3">{c.emailCta}</p>
                    {careerEmailStatus === "success" ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <span className="text-green-400 text-sm">{"\u2713"} {t.email.success}</span>
                        <a
                          href="/reports/SHIFT-Q1-2026-AI-Risk-Report.pdf"
                          download
                          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {t.email.downloadBtn}
                        </a>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2 max-w-md mx-auto">
                          <input
                            type="email"
                            value={careerEmail}
                            onChange={(e) => {
                              setCareerEmail(e.target.value);
                              if (careerEmailStatus === "error") setCareerEmailStatus("idle");
                            }}
                            placeholder={t.email.placeholder}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary"
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (!careerEmail || !careerEmail.includes("@")) return;
                                setCareerEmailStatus("loading");
                                try {
                                  const res = await fetch("/api/subscribe", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      email: careerEmail,
                                      occupation: selected?.name_en || "",
                                      score: selected?.composite || 0,
                                      source: "career",
                                    }),
                                  });
                                  if (res.ok) { setCareerEmailStatus("success"); setCareerEmail(""); }
                                  else setCareerEmailStatus("error");
                                } catch { setCareerEmailStatus("error"); }
                              }
                            }}
                          />
                          <button
                            type="button"
                            disabled={careerEmailStatus === "loading"}
                            onClick={async () => {
                              if (!careerEmail || !careerEmail.includes("@")) return;
                              setCareerEmailStatus("loading");
                              try {
                                const res = await fetch("/api/subscribe", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    email: careerEmail,
                                    occupation: selected?.name_en || "",
                                    score: selected?.composite || 0,
                                    source: "career",
                                  }),
                                });
                                if (res.ok) { setCareerEmailStatus("success"); setCareerEmail(""); }
                                else setCareerEmailStatus("error");
                              } catch { setCareerEmailStatus("error"); }
                            }}
                            className="bg-accent-primary text-bg-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
                          >
                            {careerEmailStatus === "loading" ? (
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              c.sendPlan
                            )}
                          </button>
                        </div>
                        {careerEmailStatus === "error" && (
                          <p className="text-red-400 text-xs mt-2">{t.email.error}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Share + PDF */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={handlePdf}
                      disabled={pdfLoading}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {pdfLoading ? "..." : c.downloadPdf}
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="bg-[#0077B5]/20 text-[#0077B5] hover:bg-[#0077B5]/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      X / Twitter
                    </button>
                    <button
                      onClick={() => handleShare("whatsapp")}
                      className="bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
