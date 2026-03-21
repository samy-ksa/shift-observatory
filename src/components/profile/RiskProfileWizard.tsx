"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang, formatNumber } from "@/lib/i18n/context";
import { scoreToCategory, riskBg, riskColor } from "@/lib/utils";
import { exportProfilePDF } from "@/lib/export-pdf";
import data from "@/data/master.json";
import type { Occupation, HRDFProgram } from "@/lib/data-types";
import LangToggle from "@/components/ui/LangToggle";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shift-observatory.vercel.app";

/* ── Data ── */
interface Region {
  name_en: string;
  name_ar: string;
  ai_risk_score: number;
  total: number;
  pct_saudi: number;
}

interface Sector {
  id: string;
  name_en: string;
  name_ar: string;
  ai_risk_score: number;
  total: number;
  pct_saudi: number;
}

const allOccupations: Occupation[] = [
  ...(data.occupations.high_risk as Occupation[]),
  ...(data.occupations.low_risk as Occupation[]),
].sort((a, b) => b.composite - a.composite);

const regions = data.regions as Region[];
const sectors = data.sectors as Sector[];

/* ── Score Calculation ── */
function computeScore(
  occ: Occupation,
  sector: Sector,
  region: Region,
  status: "saudi" | "expat"
) {
  const occRisk = occ.composite;
  const sectorRisk = sector.ai_risk_score;
  const regionRisk = region.ai_risk_score;

  let nitaqatMod = 0;
  if (status === "expat") {
    nitaqatMod =
      occ.nitaqat_status === "reserved_saudi_only" ? 20 : 5;
  }

  let wefMod = 0;
  if (occ.wef_trend) {
    if (occ.wef_trend.includes("decline")) wefMod = 10;
    else if (occ.wef_trend.includes("growth")) wefMod = -10;
  }

  const raw =
    occRisk * 0.6 +
    sectorRisk * 0.2 +
    regionRisk * 0.1 +
    nitaqatMod +
    wefMod;

  return Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
}

/* ── Gauge Component ── */
function ScoreGauge({ score }: { score: number }) {
  const cat = scoreToCategory(score);
  const color = riskColor(cat);
  const circumference = 2 * Math.PI * 70;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
        />
        <motion.circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold font-mono"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-text-muted">/100</span>
      </div>
    </div>
  );
}

/* ── Main Wizard ── */
export default function RiskProfileWizard() {
  const { t, lang } = useLang();
  const p = t.profile;

  // Wizard state
  const [step, setStep] = useState(1);
  const [selectedOcc, setSelectedOcc] = useState<Occupation | null>(null);
  const [status, setStatus] = useState<"saudi" | "expat">("saudi");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  // Occupation search
  const [query, setQuery] = useState("");
  const [showBrowseAll, setShowBrowseAll] = useState(false);

  // Email
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // PDF
  const [pdfLoading, setPdfLoading] = useState(false);

  /* ── Fuzzy matching: split input into words, score by matching word count ── */
  const fuzzyMatches = useMemo(() => {
    if (!query.trim()) return [];
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
    if (words.length === 0) return [];

    const scored = allOccupations.map((occ) => {
      const nameEn = occ.name_en.toLowerCase();
      const nameAr = occ.name_ar;
      let matchCount = 0;
      for (const word of words) {
        if (nameEn.includes(word) || nameAr.includes(word)) {
          matchCount++;
        }
      }
      return { occ, matchCount };
    });

    return scored
      .filter((s) => s.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount || b.occ.composite - a.occ.composite)
      .slice(0, 5)
      .map((s) => s.occ);
  }, [query]);

  const handleSelectOcc = useCallback((occ: Occupation) => {
    setSelectedOcc(occ);
    setQuery("");
    setShowBrowseAll(false);
  }, []);

  // Score computation
  const score = useMemo(() => {
    if (!selectedOcc || !selectedSector || !selectedRegion) return null;
    return computeScore(selectedOcc, selectedSector, selectedRegion, status);
  }, [selectedOcc, selectedSector, selectedRegion, status]);

  const breakdown = useMemo(() => {
    if (!selectedOcc || !selectedSector || !selectedRegion) return null;

    const occContrib = Math.round(selectedOcc.composite * 0.6 * 10) / 10;
    const sectorContrib = Math.round(selectedSector.ai_risk_score * 0.2 * 10) / 10;
    const regionContrib = Math.round(selectedRegion.ai_risk_score * 0.1 * 10) / 10;

    let nitaqatMod = 0;
    if (status === "expat") {
      nitaqatMod = selectedOcc.nitaqat_status === "reserved_saudi_only" ? 20 : 5;
    }

    let wefMod = 0;
    if (selectedOcc.wef_trend) {
      if (selectedOcc.wef_trend.includes("decline")) wefMod = 10;
      else if (selectedOcc.wef_trend.includes("growth")) wefMod = -10;
    }

    return [
      { label: p.occupationRisk, value: occContrib, weight: "60%" },
      { label: p.sectorPressure, value: sectorContrib, weight: "20%" },
      { label: p.regionExposure, value: regionContrib, weight: "10%" },
      { label: p.nitaqatImpact, value: nitaqatMod, weight: "" },
      { label: p.wefTrend, value: wefMod, weight: "" },
    ];
  }, [selectedOcc, selectedSector, selectedRegion, status, p]);

  const findings = useMemo(() => {
    if (!selectedOcc || !selectedSector || !selectedRegion || score === null) return [];
    const items: string[] = [];

    const occCat = scoreToCategory(selectedOcc.composite);
    if (occCat === "very_high" || occCat === "high") {
      items.push(
        lang === "ar"
          ? `\u0645\u0647\u0646\u062A\u0643 "${selectedOcc.name_ar}" \u0645\u0639\u0631\u0636\u0629 \u0628\u0634\u0643\u0644 \u0643\u0628\u064A\u0631 \u0644\u0644\u0623\u062A\u0645\u062A\u0629 \u0628\u062F\u0631\u062C\u0629 ${selectedOcc.composite}/100.`
          : `Your occupation "${selectedOcc.name_en}" faces ${occCat === "very_high" ? "very high" : "high"} automation risk at ${selectedOcc.composite}/100.`
      );
    } else {
      items.push(
        lang === "ar"
          ? `\u0645\u0647\u0646\u062A\u0643 "${selectedOcc.name_ar}" \u0644\u062F\u064A\u0647\u0627 \u0645\u0633\u062A\u0648\u0649 \u0645\u062E\u0627\u0637\u0631 ${selectedOcc.composite}/100.`
          : `Your occupation "${selectedOcc.name_en}" has a risk level of ${selectedOcc.composite}/100.`
      );
    }

    if (status === "expat" && selectedOcc.nitaqat_status === "reserved_saudi_only") {
      items.push(
        lang === "ar"
          ? "\u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0646\u0629 \u0645\u062D\u0635\u0648\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u064A\u0646 \u0641\u0642\u0637 - \u062E\u0637\u0631 \u0645\u0632\u062F\u0648\u062C \u0644\u0644\u0648\u0627\u0641\u062F\u064A\u0646."
          : "This profession is reserved for Saudi nationals only \u2014 double jeopardy for expats."
      );
    } else if (status === "expat") {
      items.push(
        lang === "ar"
          ? "\u0643\u0648\u0627\u0641\u062F\u060C \u062A\u0648\u0627\u062C\u0647 \u0636\u063A\u0637 \u0633\u0639\u0648\u062F\u0629 \u0625\u0636\u0627\u0641\u064A \u0628\u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0644\u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A."
          : "As an expat, you face additional Saudization pressure on top of AI risk."
      );
    }

    if (selectedSector.ai_risk_score > 50) {
      items.push(
        lang === "ar"
          ? `\u0642\u0637\u0627\u0639 "${selectedSector.name_ar}" \u064A\u062A\u0639\u0631\u0636 \u0644\u0636\u063A\u0637 \u0630\u0643\u0627\u0621 \u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0645\u0631\u062A\u0641\u0639 (${selectedSector.ai_risk_score}/100).`
          : `The "${selectedSector.name_en}" sector faces high AI pressure (${selectedSector.ai_risk_score}/100).`
      );
    }

    if (selectedOcc.wef_trend?.includes("decline")) {
      items.push(
        lang === "ar"
          ? "\u0627\u0644\u0645\u0646\u062A\u062F\u0649 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A \u0627\u0644\u0639\u0627\u0644\u0645\u064A \u064A\u0635\u0646\u0641 \u0647\u0630\u0627 \u0627\u0644\u062F\u0648\u0631 \u0636\u0645\u0646 \u0627\u0644\u0645\u0647\u0646 \u0627\u0644\u0645\u062A\u0631\u0627\u062C\u0639\u0629."
          : "The WEF classifies this role among declining occupations."
      );
    } else if (selectedOcc.wef_trend?.includes("growth")) {
      items.push(
        lang === "ar"
          ? "\u0627\u0644\u0645\u0646\u062A\u062F\u0649 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A \u0627\u0644\u0639\u0627\u0644\u0645\u064A \u064A\u0635\u0646\u0641 \u0647\u0630\u0627 \u0627\u0644\u062F\u0648\u0631 \u0636\u0645\u0646 \u0627\u0644\u0645\u0647\u0646 \u0627\u0644\u0646\u0627\u0645\u064A\u0629 - \u0625\u0634\u0627\u0631\u0629 \u0625\u064A\u062C\u0627\u0628\u064A\u0629."
          : "The WEF classifies this role among growing occupations \u2014 a positive signal."
      );
    }

    return items;
  }, [selectedOcc, selectedSector, selectedRegion, status, score, lang]);

  const handleEmailSubmit = async () => {
    if (!email || !email.includes("@") || !selectedOcc || !selectedRegion || !selectedSector) return;
    setEmailStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          occupation: selectedOcc.name_en,
          status,
          region: selectedRegion.name_en,
          sector: selectedSector.name_en,
          score,
          source: "risk_profile",
        }),
      });
      if (res.ok) {
        setEmailStatus("success");
        setEmail("");
      } else {
        setEmailStatus("error");
      }
    } catch {
      setEmailStatus("error");
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setSelectedOcc(null);
    setStatus("saudi");
    setSelectedRegion(null);
    setSelectedSector(null);
    setQuery("");
    setEmailStatus("idle");
    setEmail("");
  };

  // ── Share text with emojis ──
  const shareText = useMemo(() => {
    if (!selectedOcc || score === null) return "";
    return lang === "ar"
      ? `\uD83C\uDFAF \u062F\u0631\u062C\u0629 \u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u064A \u0647\u064A ${score}/100 \u0644\u0645\u0647\u0646\u0629 "${selectedOcc.name_ar}" \u2014 \u0627\u0643\u062A\u0634\u0641 \u062F\u0631\u062C\u062A\u0643 \u0639\u0644\u0649 \u0645\u0631\u0635\u062F \u0634\u064A\u0641\u062A!`
      : `\uD83C\uDFAF My AI risk score is ${score}/100 for "${selectedOcc.name_en}" \u2014 Find your score on SHIFT Observatory!`;
  }, [selectedOcc, score, lang]);

  // ── Share URL (uses env var) ──
  const shareUrl = `${BASE_URL}/profile`;

  // ── Share handler with localhost warning ──
  const handleShare = (platform: string) => {
    if (BASE_URL.includes("localhost")) {
      console.warn(
        "[SHIFT] Sharing with localhost URL. Set NEXT_PUBLIC_SITE_URL for production."
      );
    }

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

  // ── PDF handler (direct jsPDF) ──
  const handlePdf = async () => {
    if (!selectedOcc || !selectedSector || !selectedRegion || score === null || !breakdown) return;
    setPdfLoading(true);
    try {
      const cat = scoreToCategory(score);
      const catMap: Record<string, string> = {
        very_low: "Very Low",
        low: "Low",
        moderate: "Moderate",
        high: "High",
        very_high: "Very High",
      };

      await exportProfilePDF(
        {
          occupationName: selectedOcc.name_en,
          occupationNameAr: selectedOcc.name_ar,
          score,
          category: catMap[cat] || cat,
          breakdown: breakdown.map((b) => ({
            label: b.label,
            value: b.value,
            weight: b.weight,
          })),
          findings: findings.map((f) =>
            // Use English findings for PDF
            f
          ),
          hrdfPrograms: (selectedOcc.hrdf_programs || []).map((prog: HRDFProgram) => ({
            name: prog.name,
            type: prog.type,
            relevance: prog.relevance,
          })),
          sectorName: selectedSector.name_en,
          regionName: selectedRegion.name_en,
          status: status === "saudi" ? "Saudi National" : "Expat",
        },
        `shift-risk-profile-${selectedOcc.name_en.toLowerCase().replace(/\s+/g, "-")}.pdf`
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedOcc;
      case 2: return true;
      case 3: return !!selectedRegion;
      case 4: return !!selectedSector;
      default: return false;
    }
  };

  const stepLabels = [p.step1, p.step2, p.step3, p.step4];

  const showResults = step === 5;

  return (
    <div className="min-h-screen bg-bg-primary pb-20 md:pb-0">
      <LangToggle />
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mt-4">{p.title}</h1>
        </div>

        {/* Step indicator */}
        {!showResults && (
          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto mobile-scroll text-xs">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (i + 1 < step) setStep(i + 1);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i + 1 === step
                      ? "bg-accent-primary text-black"
                      : i + 1 < step
                      ? "bg-accent-primary/30 text-accent-primary cursor-pointer hover:bg-accent-primary/50"
                      : "bg-white/5 text-text-muted"
                  }`}
                  aria-label={label}
                >
                  {i + 1 < step ? "\u2713" : i + 1}
                </button>
                {i < stepLabels.length - 1 && (
                  <div className={`w-8 h-0.5 ${i + 1 < step ? "bg-accent-primary/50" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── Step 1: Occupation (fuzzy free-text search) ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-white text-center">{p.step1}</h2>

              {/* ── Confirmed selection ── */}
              {selectedOcc ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-bg-card border border-accent-primary/30 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-accent-primary font-medium mb-1">
                          {lang === "ar" ? "تم المطابقة مع:" : lang === "fr" ? "Correspondance :" : "Matched to:"}
                        </p>
                        <p className="text-white font-semibold text-lg leading-tight">
                          {lang === "ar" ? selectedOcc.name_ar : lang === "fr" && selectedOcc.name_fr ? selectedOcc.name_fr : selectedOcc.name_en}
                        </p>
                        <p className="text-text-muted text-sm mt-0.5">
                          {lang === "ar" ? selectedOcc.name_en : selectedOcc.name_ar}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className={`text-2xl font-mono font-bold ${riskBg(scoreToCategory(selectedOcc.composite))} px-3 py-1 rounded-lg`}>
                          {selectedOcc.composite}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOcc(null);
                            setQuery("");
                          }}
                          className="text-accent-primary text-xs hover:underline underline-offset-2"
                        >
                          {lang === "ar" ? "تغيير" : lang === "fr" ? "Modifier" : "Change"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ── Search input + results ── */
                <div className="space-y-4">
                  {/* Search field */}
                  <div>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setShowBrowseAll(false);
                        }}
                        placeholder={t.riskTool.placeholder}
                        autoFocus
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-accent-primary focus:outline-none text-base"
                      />
                    </div>
                    <p className="text-text-muted text-xs mt-2 text-center">
                      {lang === "ar"
                        ? "اكتب مسمى وظيفتك — سنجد أقرب تطابق من 146 مهنة مسجّلة"
                        : "Type your job title — we'll find the closest match from 146 scored occupations"}
                    </p>
                  </div>

                  {/* Fuzzy match results as clickable cards */}
                  {query.trim().length > 1 && fuzzyMatches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      {fuzzyMatches.map((occ) => {
                        const cat = scoreToCategory(occ.composite);
                        return (
                          <button
                            key={occ.rank}
                            onClick={() => handleSelectOcc(occ)}
                            className="w-full text-left bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-accent-primary/40 rounded-xl px-4 py-3 transition-all group"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate group-hover:text-accent-primary transition-colors">
                                  {lang === "ar" ? occ.name_ar : lang === "fr" && occ.name_fr ? occ.name_fr : occ.name_en}
                                </p>
                                <p className="text-text-muted text-xs truncate mt-0.5">
                                  {lang === "ar" ? occ.name_en : occ.name_ar}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-sm font-mono font-bold ${riskBg(cat)} px-2.5 py-1 rounded-lg`}>
                                  {occ.composite}
                                </span>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${riskBg(cat)}`}>
                                  {(() => {
                                    const m: Record<string, string> = lang === "ar"
                                      ? { very_low: "منخفض جداً", low: "منخفض", moderate: "متوسط", high: "مرتفع", very_high: "مرتفع جداً" }
                                      : { very_low: "Very Low", low: "Low", moderate: "Moderate", high: "High", very_high: "Very High" };
                                    return m[cat] || cat;
                                  })()}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* No matches found */}
                  {query.trim().length > 2 && fuzzyMatches.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.03] border border-white/10 rounded-xl p-5 text-center space-y-3"
                    >
                      <p className="text-text-secondary text-sm">
                        {lang === "ar"
                          ? "لم يتم العثور على تطابق. جرّب مصطلحات أوسع مثل \"تسويق\" أو \"مهندس\" أو \"سائق\" أو \"محاسبة\"."
                          : 'No exact match found. Try broader terms like "marketing", "engineer", "driver", or "accounting".'}
                      </p>
                      <button
                        onClick={() => setShowBrowseAll(true)}
                        className="text-accent-primary text-sm font-medium hover:underline underline-offset-2"
                      >
                        {lang === "ar"
                          ? "تصفح جميع المهن الـ 146 ←"
                          : "Browse all 146 occupations →"}
                      </button>
                    </motion.div>
                  )}

                  {/* Browse all panel */}
                  {showBrowseAll && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-bg-card border border-white/10 rounded-xl overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-white/5 flex justify-between items-center">
                        <span className="text-xs text-text-muted font-medium">
                          {lang === "ar" ? "جميع المهن (146)" : lang === "fr" ? "Tous les métiers (146)" : "All occupations (146)"}
                        </span>
                        <button
                          onClick={() => setShowBrowseAll(false)}
                          className="text-text-muted hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                        {allOccupations.map((occ) => (
                          <button
                            key={occ.rank}
                            onClick={() => handleSelectOcc(occ)}
                            className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-white text-sm truncate block">
                                {lang === "ar" ? occ.name_ar : lang === "fr" && occ.name_fr ? occ.name_fr : occ.name_en}
                              </span>
                              <span className="text-text-muted text-xs truncate block">
                                {lang === "ar" ? occ.name_en : occ.name_ar}
                              </span>
                            </div>
                            <span className={`text-xs font-mono font-bold flex-shrink-0 ${riskBg(scoreToCategory(occ.composite))} px-2 py-0.5 rounded-md`}>
                              {occ.composite}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Status ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-white text-center">{p.step2}</h2>

              <div className="space-y-3">
                {(["saudi", "expat"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                      status === s
                        ? "border-accent-primary bg-accent-primary/10 text-white"
                        : "border-white/10 bg-white/5 text-text-secondary hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        status === s ? "border-accent-primary" : "border-white/30"
                      }`}>
                        {status === s && (
                          <div className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
                        )}
                      </div>
                      <span className="font-medium">{s === "saudi" ? p.saudi : p.expat}</span>
                    </div>
                  </button>
                ))}
              </div>

              {status === "expat" && selectedOcc?.nitaqat_status === "reserved_saudi_only" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
                >
                  <span className="font-bold">{"\u26A0"}</span> {p.reservedWarning}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Step 3: Region ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-white text-center">{p.step3}</h2>

              <select
                value={selectedRegion ? selectedRegion.name_en : ""}
                onChange={(e) => {
                  const r = regions.find((r) => r.name_en === e.target.value);
                  setSelectedRegion(r || null);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary focus:outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-bg-primary text-text-muted">
                  {lang === "ar" ? "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0646\u0637\u0642\u0629..." : lang === "fr" ? "Sélectionner la région..." : "Select region..."}
                </option>
                {regions.map((r) => (
                  <option
                    key={r.name_en}
                    value={r.name_en}
                    className="bg-bg-primary text-white"
                  >
                    {lang === "ar" ? r.name_ar : r.name_en}
                  </option>
                ))}
              </select>

              {selectedRegion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-bg-card border border-white/5 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">
                        {lang === "ar" ? selectedRegion.name_ar : selectedRegion.name_en}
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        {formatNumber(selectedRegion.total, lang)} {lang === "ar" ? "\u0639\u0627\u0645\u0644" : lang === "fr" ? "travailleurs" : "workers"} {"\u00B7"}{" "}
                        {selectedRegion.pct_saudi}% {lang === "ar" ? "\u0633\u0639\u0648\u062F\u064A\u0648\u0646" : lang === "fr" ? "Saoudiens" : "Saudi"}
                      </div>
                    </div>
                    <div className={`text-lg font-mono font-bold ${riskBg(scoreToCategory(selectedRegion.ai_risk_score))} px-3 py-1 rounded-lg`}>
                      {selectedRegion.ai_risk_score}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Step 4: Sector ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-white text-center">{p.step4}</h2>

              <select
                value={selectedSector ? selectedSector.id : ""}
                onChange={(e) => {
                  const s = sectors.find((s) => s.id === e.target.value);
                  setSelectedSector(s || null);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-primary focus:outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-bg-primary text-text-muted">
                  {lang === "ar" ? "\u0627\u062E\u062A\u0631 \u0627\u0644\u0642\u0637\u0627\u0639..." : lang === "fr" ? "Sélectionner le secteur..." : "Select sector..."}
                </option>
                {sectors.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    className="bg-bg-primary text-white"
                  >
                    {lang === "ar" ? s.name_ar : s.name_en}
                  </option>
                ))}
              </select>

              {selectedSector && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-bg-card border border-white/5 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">
                        {lang === "ar" ? selectedSector.name_ar : selectedSector.name_en}
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        {formatNumber(selectedSector.total, lang)} {lang === "ar" ? "\u0639\u0627\u0645\u0644" : lang === "fr" ? "travailleurs" : "workers"} {"\u00B7"}{" "}
                        {selectedSector.pct_saudi}% {lang === "ar" ? "\u0633\u0639\u0648\u062F\u064A\u0648\u0646" : lang === "fr" ? "Saoudiens" : "Saudi"}
                      </div>
                    </div>
                    <div className={`text-lg font-mono font-bold ${riskBg(scoreToCategory(selectedSector.ai_risk_score))} px-3 py-1 rounded-lg`}>
                      {selectedSector.ai_risk_score}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Results ── */}
          {showResults && score !== null && breakdown && selectedOcc && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-semibold text-white text-center">{p.results}</h2>

              {/* Score Gauge */}
              <div className="text-center">
                <ScoreGauge score={score} />
                <p className="text-text-muted mt-2">{p.overall}</p>
                <div className={`inline-block mt-2 ${riskBg(scoreToCategory(score))} px-3 py-1 rounded-full text-sm font-medium`}>
                  {(() => {
                    const cat = scoreToCategory(score);
                    const map: Record<string, string> = {
                      very_low: t.common.veryLow,
                      low: t.common.low,
                      moderate: t.common.moderate,
                      high: t.common.high,
                      very_high: t.common.veryHigh,
                    };
                    return map[cat] || cat;
                  })()}
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="bg-bg-card border border-white/5 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-white">{p.breakdown}</h3>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {breakdown.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-text-secondary">{row.label}</td>
                        <td className="px-4 py-3 text-text-muted text-xs">{row.weight}</td>
                        <td className={`px-4 py-3 font-mono font-bold text-right ${
                          row.value > 0 ? "text-risk-high" : row.value < 0 ? "text-emerald-400" : "text-text-muted"
                        }`}>
                          {row.value > 0 ? "+" : ""}{row.value}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-white/5">
                      <td className="px-4 py-3 font-bold text-white">{p.overall}</td>
                      <td></td>
                      <td className="px-4 py-3 font-mono font-bold text-right text-white">{score}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Key Findings */}
              {findings.length > 0 && (
                <div className="bg-bg-card border border-white/5 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">{p.findings}</h3>
                  <ul className="space-y-2">
                    {findings.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text-secondary">
                        <span className="text-accent-primary flex-shrink-0">{"\u2022"}</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* HRDF Programs */}
              {selectedOcc.hrdf_programs && selectedOcc.hrdf_programs.length > 0 && (
                <div className="bg-bg-card border border-white/5 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">{p.actions}</h3>
                  <div className="space-y-3">
                    {selectedOcc.hrdf_programs.map((prog: HRDFProgram, i: number) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">
                            {lang === "ar" ? prog.name_ar : prog.name}
                          </div>
                          <div className="text-xs text-text-muted mt-0.5">
                            {prog.type} {"\u00B7"} {prog.relevance}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Capture */}
              <div className="bg-bg-card border border-white/5 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">{p.emailCta}</h3>
                {emailStatus === "success" ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <span className="text-green-400 text-sm">{"\u2713"} {t.email.success}</span>
                    <a
                      href="/reports/SHIFT-Q1-2026-AI-Risk-Report.pdf"
                      download
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-sm px-4 py-2 min-h-11 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t.email.downloadBtn}
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailStatus === "error") setEmailStatus("idle");
                        }}
                        placeholder={t.email.placeholder}
                        className="w-full flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-accent-primary focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                      />
                      <button
                        onClick={handleEmailSubmit}
                        disabled={emailStatus === "loading"}
                        className="w-full md:w-auto bg-accent-primary hover:bg-accent-primary/80 text-black font-semibold px-4 py-2 min-h-11 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
                      >
                        {emailStatus === "loading" ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          p.send
                        )}
                      </button>
                    </div>
                    {emailStatus === "error" && (
                      <p className="text-red-400 text-xs mt-2">{t.email.error}</p>
                    )}
                  </>
                )}
              </div>

              {/* Share & PDF Buttons */}
              <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center">
                <button
                  onClick={handlePdf}
                  disabled={pdfLoading}
                  className="w-full md:w-auto bg-white/10 text-white hover:bg-white/20 px-4 py-2 min-h-11 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {pdfLoading ? "..." : (lang === "ar" ? "\u062A\u062D\u0645\u064A\u0644 PDF" : lang === "fr" ? "Télécharger PDF" : "Download PDF")}
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="w-full md:w-auto bg-[#0077B5]/20 text-[#0077B5] hover:bg-[#0077B5]/30 px-4 py-2 min-h-11 rounded-lg text-sm font-medium transition-colors"
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="w-full md:w-auto bg-white/10 text-white hover:bg-white/20 px-4 py-2 min-h-11 rounded-lg text-sm font-medium transition-colors"
                >
                  X / Twitter
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="w-full md:w-auto bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 px-4 py-2 min-h-11 rounded-lg text-sm font-medium transition-colors"
                >
                  WhatsApp
                </button>
              </div>

              {/* Start Over */}
              <div className="text-center">
                <button
                  onClick={handleStartOver}
                  className="text-text-muted hover:text-white text-sm underline underline-offset-4 transition-colors"
                >
                  {p.startOver}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {!showResults && (
          <div className="flex flex-col-reverse md:flex-row justify-between gap-3 mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              className={`w-full md:w-auto px-6 py-2.5 min-h-11 rounded-xl text-sm font-medium transition-colors ${
                step === 1
                  ? "invisible"
                  : "bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10"
              }`}
            >
              {p.back}
            </button>

            <button
              onClick={() => {
                if (canProceed()) {
                  setStep(step + 1);
                }
              }}
              disabled={!canProceed()}
              className="w-full md:w-auto px-6 py-2.5 min-h-11 rounded-xl text-sm font-semibold bg-accent-primary text-black hover:bg-accent-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {step === 4 ? p.results : p.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
