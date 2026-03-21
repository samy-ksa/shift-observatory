"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";

const RadarChartSection = dynamic(
  () => import("./RadarChartSection"),
  {
    loading: () => (
      <div className="h-[500px] animate-pulse bg-gray-900/50 rounded-xl" />
    ),
    ssr: false,
  },
);
import { useLang } from "@/lib/i18n/context";
import LangToggle from "@/components/ui/LangToggle";
import ShareBar from "@/components/shared/ShareBar";
import EmailGateModal from "@/components/shared/EmailGateModal";
import {
  ORIGIN_CITIES,
  SAUDI_CITIES,
  SCHOOL_TIERS,
  calculateRelocation,
} from "@/data/relocation-data";
import type { HousingType, RelocationResult } from "@/data/relocation-data";
import {
  COST_DATABASE,
  CITY_EXCHANGE_RATES,
  COST_CATEGORIES,
  getPriceTrends,
  getCostsByCategory,
} from "@/data/relocation-costs";
import type { CityId, CostCategory, CostItem } from "@/data/relocation-costs";
import { getAllOccupations, toSlug, riskColor } from "@/lib/occupations";
import { generateRelocationReport } from "@/lib/export-relocation-pdf";
import type { Occupation } from "@/lib/occupations";

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */

const allOccupations = getAllOccupations();

type TabId =
  | "overview"
  | "groceries"
  | "dining"
  | "subscriptions"
  | "tech"
  | "transport"
  | "housing"
  | "utilities"
  | "education"
  | "lifestyle"
  | "ksa_fees";

const TAB_CATEGORY_MAP: Record<TabId, CostCategory[]> = {
  overview: [],
  groceries: ["groceries_staples", "groceries_branded"],
  dining: ["dining"],
  subscriptions: ["subscriptions"],
  tech: ["tech"],
  transport: ["transport"],
  housing: ["housing"],
  utilities: ["utilities", "telecom"],
  education: ["education"],
  lifestyle: ["fitness", "clothing"],
  ksa_fees: ["domestic_help", "government_fees", "healthcare"],
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function fmtN(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function fmtLocal(n: number, sym: string) {
  return sym + fmtN(Math.abs(Math.round(n)));
}
function fmtSar(n: number) {
  return fmtN(Math.round(n)) + " SAR";
}
function sarToLocal(sar: number, rate: number, sym: string) {
  if (rate <= 0) return "";
  return `~${sym}${(sar / rate).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** Trilingual name resolver */
function ln(lang: string, obj: { name_en: string; name_ar: string; name_fr?: string }): string {
  if (lang === "ar") return obj.name_ar;
  if (lang === "fr" && obj.name_fr) return obj.name_fr;
  return obj.name_en;
}
function lnLabel(lang: string, obj: { label_en: string; label_ar: string; label_fr?: string }): string {
  if (lang === "ar") return obj.label_ar;
  if (lang === "fr" && obj.label_fr) return obj.label_fr;
  return obj.label_en;
}
function lnCountry(lang: string, obj: { country_en: string; country_ar: string; country_fr?: string }): string {
  if (lang === "ar") return obj.country_ar;
  if (lang === "fr" && obj.country_fr) return obj.country_fr;
  return obj.country_en;
}
function lnCat(lang: string, obj: { name_en: string; name_ar: string; name_fr?: string }): string {
  if (lang === "ar") return obj.name_ar;
  if (lang === "fr" && obj.name_fr) return obj.name_fr;
  return obj.name_en;
}

function fuzzyScore(query: string, name: string): number {
  const q = query.toLowerCase();
  const n = name.toLowerCase();
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 60;
  let qi = 0;
  for (let i = 0; i < n.length && qi < q.length; i++) {
    if (n[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 40;
  const words = n.split(/\s+/);
  for (const w of words) {
    if (w.startsWith(q)) return 50;
  }
  return 0;
}

function toCostCityId(originId: string): CityId | null {
  const map: Record<string, CityId> = {
    paris: "paris", "new-york": "new_york", "san-francisco": "new_york",
    london: "london", dubai: "dubai", cairo: "cairo", amman: "amman",
    beirut: "beirut", mumbai: "mumbai", manila: "manila", toronto: "new_york",
    islamabad: "mumbai", sydney: "sydney", casablanca: "casablanca", tunis: "tunis",
  };
  return map[originId] || null;
}

function toSaudiCostCityId(saudiId: string): CityId {
  return saudiId as CityId;
}

/* ------------------------------------------------------------------ */
/* Tooltip Component                                                    */
/* ------------------------------------------------------------------ */

function Tip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((s) => !s)}
    >
      {children}
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-xs bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-md px-3 py-2 shadow-lg pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

/* Info callout box */
function InfoBox({ text }: { text: string }) {
  return (
    <div className="text-xs text-gray-500 bg-gray-900/30 border-l-2 border-gray-700 p-2 mt-1 leading-relaxed">
      <span className="text-gray-400 mr-1">ℹ️</span> {text}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                       */
/* ------------------------------------------------------------------ */

export default function RelocateClient({
  defaultOriginId,
  defaultSaudiId,
}: {
  defaultOriginId?: string;
  defaultSaudiId?: string;
} = {}) {
  const { t, lang, dir } = useLang();
  const r = t.relocate;
  const resultsRef = useRef<HTMLDivElement>(null);

  /* ---- Form state ---- */
  const [originId, setOriginId] = useState(defaultOriginId || "paris");
  const [salaryStr, setSalaryStr] = useState("");
  const [occSearch, setOccSearch] = useState("");
  const [occDropOpen, setOccDropOpen] = useState(false);
  const [selectedOcc, setSelectedOcc] = useState<Occupation | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [singleIncome, setSingleIncome] = useState(false);
  const [partnerSalaryStr, setPartnerSalaryStr] = useState("");
  const [saudiId, setSaudiId] = useState(defaultSaudiId || "riyadh");
  const [housing, setHousing] = useState<HousingType>("compound");
  const [schoolTierId, setSchoolTierId] = useState("midtier");
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const origin = ORIGIN_CITIES.find((c) => c.id === originId)!;
  const saudi = SAUDI_CITIES.find((c) => c.id === saudiId)!;
  const schoolTier = SCHOOL_TIERS.find((s) => s.id === schoolTierId)!;
  const salaryNum = parseInt(salaryStr.replace(/[^0-9]/g, ""), 10) || 0;
  const partnerSalaryNum = parseInt(partnerSalaryStr.replace(/[^0-9]/g, ""), 10) || 0;
  const combinedLocal = singleIncome ? salaryNum + partnerSalaryNum : salaryNum;

  /* ---- Fuzzy occupation search ---- */
  const filteredOccs = useMemo(() => {
    if (!occSearch.trim()) return [];
    const q = occSearch.trim();
    return allOccupations
      .map((o) => ({ occ: o, score: Math.max(fuzzyScore(q, o.name_en), fuzzyScore(q, o.name_ar)) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [occSearch]);

  /* ---- Calculate ---- */
  const result: RelocationResult | null = useMemo(() => {
    if (salaryNum <= 0) return null;
    return calculateRelocation({
      origin, saudi, salaryLocal: salaryNum, adults, children, housing, schoolTier,
    });
  }, [origin, saudi, salaryNum, adults, children, housing, schoolTier]);

  const handleCalculate = () => {
    if (!result) return;
    setShowResults(true);
    setActiveTab("overview");
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleReset = () => {
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---- Occupation salary info ---- */
  const occInfo = useMemo(() => {
    if (!selectedOcc) return null;
    const name = ln(lang, selectedOcc);
    return {
      name, entry: fmtN(selectedOcc.salary_entry_sar), senior: fmtN(selectedOcc.salary_senior_sar),
      median: fmtN(selectedOcc.salary_median_sar), composite: selectedOcc.composite, slug: toSlug(selectedOcc.name_en),
    };
  }, [selectedOcc, lang]);

  /* ---- Cost database city IDs ---- */
  const originCostId = toCostCityId(originId);
  const saudiCostId = toSaudiCostCityId(saudiId);
  const originRate = originCostId ? CITY_EXCHANGE_RATES[originCostId] : origin.rateToSar;

  /* ---- Category comparison data ---- */
  const getCategoryComparison = useCallback(
    (categories: CostCategory[]) => {
      if (!originCostId) return [];
      const items: { item: CostItem; originPrice: number; saudiPrice: number; originInSar: number; saudiInLocal: number; diffPct: number }[] = [];
      for (const cat of categories) {
        for (const ci of getCostsByCategory(cat)) {
          const oPrice = ci.prices[originCostId];
          const sPrice = ci.prices[saudiCostId];
          if (oPrice === undefined || sPrice === undefined) continue;
          const oRate = CITY_EXCHANGE_RATES[originCostId];
          const sRate = CITY_EXCHANGE_RATES[saudiCostId];
          const oSar = oPrice * oRate;
          const sSar = sPrice * sRate;
          const diff = oSar > 0 ? Math.round(((sSar - oSar) / oSar) * 100) : 0;
          items.push({ item: ci, originPrice: oPrice, saudiPrice: sPrice, originInSar: Math.round(oSar), saudiInLocal: oRate > 0 ? sSar / oRate : 0, diffPct: diff });
        }
      }
      return items;
    },
    [originCostId, saudiCostId]
  );

  /* ---- Tab item counts ---- */
  const tabCounts = useMemo(() => {
    const counts: Record<TabId, number> = {} as Record<TabId, number>;
    for (const [tabId, cats] of Object.entries(TAB_CATEGORY_MAP) as [TabId, CostCategory[]][]) {
      if (tabId === "overview") { counts[tabId] = 0; continue; }
      let count = 0;
      for (const cat of cats) {
        for (const ci of getCostsByCategory(cat)) {
          if (ci.prices[saudiCostId] !== undefined && (!originCostId || ci.prices[originCostId] !== undefined)) count++;
        }
      }
      counts[tabId] = count;
    }
    return counts;
  }, [originCostId, saudiCostId]);

  /* ---- Radar chart data ---- */
  const radarData = useMemo(() => {
    if (!originCostId) return [];
    const axes: { key: string; label: string; cats: CostCategory[] }[] = [
      { key: "housing", label: r.radarHousing, cats: ["housing"] },
      { key: "food", label: r.radarFood, cats: ["groceries_staples", "groceries_branded"] },
      { key: "transport", label: r.radarTransport, cats: ["transport"] },
      { key: "utilities", label: r.radarUtilities, cats: ["utilities", "telecom"] },
      { key: "dining", label: r.radarDining, cats: ["dining"] },
      { key: "education", label: r.radarEducation, cats: ["education"] },
      { key: "healthcare", label: r.radarHealthcare, cats: ["healthcare"] },
      { key: "lifestyle", label: r.radarLifestyle, cats: ["subscriptions", "fitness", "clothing"] },
    ];
    return axes.map((axis) => {
      let originTotal = 0, saudiTotal = 0, oCount = 0, sCount = 0;
      for (const cat of axis.cats) {
        for (const ci of getCostsByCategory(cat)) {
          const oPrice = ci.prices[originCostId];
          const sPrice = ci.prices[saudiCostId];
          if (oPrice !== undefined) { originTotal += oPrice * CITY_EXCHANGE_RATES[originCostId]; oCount++; }
          if (sPrice !== undefined) { saudiTotal += sPrice * CITY_EXCHANGE_RATES[saudiCostId]; sCount++; }
        }
      }
      const max = Math.max(originTotal, saudiTotal, 1);
      const diffPct = originTotal > 0 ? Math.round(((saudiTotal - originTotal) / originTotal) * 100) : 0;
      return {
        axis: axis.label, key: axis.key,
        origin: Math.round((originTotal / max) * 100),
        saudi: Math.round((saudiTotal / max) * 100),
        originSar: Math.round(originTotal), saudiSar: Math.round(saudiTotal),
        diffPct, oCount, sCount,
      };
    });
  }, [originCostId, saudiCostId, r]);

  /* Radar summary bullets — top 5 biggest differences */
  const radarBullets = useMemo(() => {
    if (!radarData.length) return [];
    return [...radarData]
      .filter((d) => d.oCount > 0 || d.sCount > 0)
      .sort((a, b) => Math.abs(b.diffPct) - Math.abs(a.diffPct))
      .slice(0, 5)
      .map((d) => ({
        label: d.axis,
        diffPct: d.diffPct,
        cheaper: d.diffPct < 0,
      }));
  }, [radarData]);

  /* ---- Price Pulse (city-specific) ---- */
  const priceTrends = useMemo(() => {
    return getPriceTrends().filter((item) => item.prices[saudiCostId] !== undefined);
  }, [saudiCostId]);

  /* ---- Derived values for verdict/negotiation ---- */
  const minSalary = result ? result.saudi_total_sar : 0;
  const recSalary = Math.round(minSalary * 1.2);
  const housingAllowance = Math.round(minSalary * 0.25);
  const transportAllowance = Math.round(minSalary * 0.10);
  const flightCount = adults + children;
  const flightCost = flightCount * 3000; // rough average

  /* ---- Schools for Education tab ---- */
  const schoolItems = useMemo(() => {
    return COST_DATABASE.filter((ci) => ci.category === "education" && ci.prices[saudiCostId] !== undefined);
  }, [saudiCostId]);

  /* ---- PDF export (delegates to export-relocation-pdf.ts) ---- */
  const generateRelocationPDF = useCallback(() => {
    if (!result) return;
    generateRelocationReport({
      lang,
      result,
      originName: ln(lang, origin),
      saudiName: ln(lang, saudi),
      originCurrency: origin.currency,
      originCurrencySymbol: origin.currencySymbol,
      originTaxRate: origin.taxRate,
      originId,
      saudiId,
      originMercer: result.origin_mercer,
      saudiMercer: result.saudi_mercer,
      adults,
      children,
      housing,
      schoolTierLabel: schoolTier.label_en,
      occupation: selectedOcc ? {
        name: ln(lang, selectedOcc),
        name_en: selectedOcc.name_en,
        composite: selectedOcc.composite,
        sector_id: selectedOcc.sector_id,
        wef_trend: selectedOcc.wef_trend,
        salary_median_sar: selectedOcc.salary_median_sar,
        salary_entry_sar: selectedOcc.salary_entry_sar,
        salary_senior_sar: selectedOcc.salary_senior_sar,
        category: selectedOcc.category,
        employment_est: selectedOcc.employment_est,
      } : undefined,
    });
  }, [result, lang, origin, saudi, originId, saudiId, selectedOcc, adults, children, housing, schoolTier]);

  /* ---- Email-gated PDF download ---- */
  const handlePDFClick = useCallback(() => {
    if (!result) return;
    const saved = localStorage.getItem("shift_reloc_email");
    if (saved) {
      generateRelocationPDF();
    } else {
      setShowEmailModal(true);
    }
  }, [result, generateRelocationPDF]);

  const handleEmailSubmit = useCallback(async (email: string) => {
    if (!result) return;
    setEmailLoading(true);
    try {
      await fetch("/api/relocation-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          originCity: ln("en", origin),
          originCountry: origin.country_en,
          currentSalary: salaryNum,
          currency: origin.currency,
          salarySAR: result.gross_sar,
          occupation: selectedOcc?.name_en || "",
          aiRiskScore: selectedOcc?.composite ?? null,
          adults,
          children,
          singleIncome,
          targetCity: ln("en", saudi),
          housing,
          schoolTier: schoolTierId,
          minSalaryKSA: result.saudi_total_sar,
          taxSavings: result.tax_savings_sar,
          language: lang,
        }),
      });
    } catch {
      // Silently continue — don't block PDF on API failure
    }
    localStorage.setItem("shift_reloc_email", email);
    setEmailLoading(false);
    setShowEmailModal(false);
    generateRelocationPDF();
  }, [result, origin, saudi, salaryNum, selectedOcc, adults, children, singleIncome, housing, schoolTierId, lang, generateRelocationPDF]);

  /* ---- Tab list ---- */
  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: r.tabOverview },
    { id: "groceries", label: r.tabGroceries },
    { id: "dining", label: r.tabDining },
    { id: "subscriptions", label: r.tabSubscriptions },
    { id: "tech", label: r.tabTech },
    { id: "transport", label: r.tabTransport },
    { id: "housing", label: r.tabHousing },
    { id: "utilities", label: r.tabUtilities },
    { id: "education", label: r.tabEducation },
    { id: "lifestyle", label: r.tabLifestyle },
    { id: "ksa_fees", label: r.tabKsaFees },
  ];

  const saudiName = ln(lang, saudi);
  const originName = ln(lang, origin);

  /* ================================================================ */
  /* RENDER                                                             */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-bg-primary overflow-x-hidden" dir={dir}>
      <LangToggle />

      {/* Header */}
      <header className="max-w-5xl mx-auto px-4 pt-8 pb-2">
        <Link href="/" className="text-text-muted text-sm hover:text-text-secondary transition-colors">&larr; {r.back}</Link>
        <div className="flex items-start justify-between mt-4 gap-4 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-text-primary tracking-wide break-words">{r.title}</h1>
            <p className="text-text-muted mt-1">{r.subtitle}</p>
          </div>
          <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-full px-4 py-1.5 flex-shrink-0">
            <Tip text={r.tooltipSar}><span className="text-emerald-400 font-bold text-sm border-b border-dotted border-emerald-400/50 cursor-help">{r.taxFree}</span></Tip>
          </div>
        </div>
      </header>

      {/* ---- HOW IT WORKS INFO BOX ---- */}
      <div className="max-w-5xl mx-auto px-4 mt-4">
        <InfoBox text={r.howItWorksText} />
      </div>

      {/* ============================================================ */}
      {/* FORM                                                          */}
      {/* ============================================================ */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-bg-card/60 border border-white/10 rounded-xl overflow-hidden">
          {/* YOUR CURRENT SITUATION */}
          <div className="p-5 md:p-6 border-b border-white/10">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-5">{r.currentSituation}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Origin city */}
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.iLiveIn}</label>
                <select value={originId} onChange={(e) => setOriginId(e.target.value)}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:border-cyan-400 focus:outline-none appearance-none cursor-pointer">
                  {ORIGIN_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>{`${ln(lang, c)}, ${lnCountry(lang, c)}`}</option>
                  ))}
                </select>
              </div>

              {/* Monthly salary */}
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.monthlySalary}</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" value={salaryStr}
                    onChange={(e) => setSalaryStr(e.target.value.replace(/[^0-9,]/g, ""))}
                    placeholder="5,000"
                    className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:border-cyan-400 focus:outline-none pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono">{origin.currency}</span>
                </div>
              </div>

              {/* Occupation — fuzzy search */}
              <div className="relative">
                <label className="text-sm text-text-muted mb-1.5 block">{r.myOccupation}</label>
                <input type="text" value={occSearch}
                  onChange={(e) => { setOccSearch(e.target.value); setOccDropOpen(true); if (selectedOcc) setSelectedOcc(null); }}
                  onFocus={() => occSearch.trim() && setOccDropOpen(true)}
                  placeholder={r.selectOccupation}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-cyan-400 focus:outline-none" />
                {occDropOpen && occSearch.trim() && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-bg-card border border-white/10 rounded-lg max-h-72 overflow-y-auto shadow-xl">
                    {filteredOccs.length > 0 ? filteredOccs.map(({ occ }) => (
                      <button key={occ.name_en}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        onClick={() => { setSelectedOcc(occ); setOccSearch(ln(lang, occ)); setOccDropOpen(false); }}>
                        <div className="flex items-center justify-between">
                          <span className="text-text-primary">{ln(lang, occ)}</span>
                          <span className={`text-xs font-mono ${riskColor(occ.composite)}`}>{occ.composite}/100</span>
                        </div>
                        <div className="text-xs text-text-muted mt-0.5 font-mono">{fmtN(occ.salary_entry_sar)}-{fmtN(occ.salary_senior_sar)} SAR{r.perMonth}</div>
                      </button>
                    )) : (
                      <div className="px-4 py-3 text-sm">
                        <span className="text-text-muted">{r.noMatch} </span>
                        <Link href="/career" className="text-cyan-400 hover:underline" onClick={() => setOccDropOpen(false)}>{r.browseAll} &rarr;</Link>
                      </div>
                    )}
                  </div>
                )}
                {selectedOcc && occInfo && (
                  <div className="mt-1.5 p-2 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">
                    <span className="text-xs text-cyan-400 font-medium">{r.matchedTo} </span>
                    <span className="text-xs text-text-primary font-medium">{occInfo.name}</span>
                    <span className="text-xs text-text-muted"> — AI Risk </span>
                    <span className={`text-xs font-mono font-bold ${riskColor(occInfo.composite)}`}>{occInfo.composite}/100</span>
                    <span className="text-xs text-text-muted"> — Salary </span>
                    <span className="text-xs font-mono text-text-secondary">{occInfo.entry}-{occInfo.senior} SAR{r.perMonth}</span>
                  </div>
                )}
                {!selectedOcc && occSearch.trim().length > 2 && !occDropOpen && (
                  <p className="text-xs text-text-muted mt-1">{r.customJob}</p>
                )}
              </div>

              {/* Family */}
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.family}</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="min-w-11 min-h-11 md:w-8 md:h-8 md:min-w-0 md:min-h-0 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg">-</button>
                    <span className="w-6 text-center font-mono text-text-primary">{adults}</span>
                    <button onClick={() => setAdults(Math.min(4, adults + 1))} className="min-w-11 min-h-11 md:w-8 md:h-8 md:min-w-0 md:min-h-0 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg">+</button>
                    <span className="text-xs text-text-muted">{r.adults}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="min-w-11 min-h-11 md:w-8 md:h-8 md:min-w-0 md:min-h-0 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg">-</button>
                    <span className="w-6 text-center font-mono text-text-primary">{children}</span>
                    <button onClick={() => setChildren(Math.min(6, children + 1))} className="min-w-11 min-h-11 md:w-8 md:h-8 md:min-w-0 md:min-h-0 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg">+</button>
                    <span className="text-xs text-text-muted">{r.children}</span>
                  </div>
                </div>
              </div>

              {/* ---- SINGLE INCOME TOGGLE ---- */}
              {adults >= 2 && (
                <div className="md:col-span-2">
                  <label className="text-sm text-text-muted mb-1.5 block">{r.incomeMode}</label>
                  <div className="flex gap-2 mb-3">
                    {[false, true].map((val) => (
                      <button key={String(val)} onClick={() => setSingleIncome(val)}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                          singleIncome === val ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-text-muted hover:bg-white/5"
                        }`}>
                        {val ? r.oneWorksKsa : r.bothWork}
                      </button>
                    ))}
                  </div>
                  {singleIncome && (
                    <div className="relative">
                      <label className="text-xs text-text-muted mb-1 block">{r.partnerSalary}</label>
                      <div className="relative">
                        <input type="text" inputMode="numeric" value={partnerSalaryStr}
                          onChange={(e) => setPartnerSalaryStr(e.target.value.replace(/[^0-9,]/g, ""))}
                          placeholder="2,500"
                          className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:border-cyan-400 focus:outline-none pr-16" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono">{origin.currency}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SAUDI ARABIA OPTIONS */}
          <div className="p-5 md:p-6">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-5">{r.saudiOptions}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.targetCity}</label>
                <select value={saudiId} onChange={(e) => setSaudiId(e.target.value)}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:border-cyan-400 focus:outline-none appearance-none cursor-pointer">
                  {SAUDI_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>{ln(lang, c)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.housing}</label>
                <div className="flex gap-2 w-full">
                  {(["apartment", "compound"] as HousingType[]).map((h) => (
                    <button key={h} onClick={() => setHousing(h)}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        housing === h ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-text-muted hover:bg-white/5"
                      }`}>
                      {h === "apartment" ? r.housingApt : (
                        <Tip text={r.tooltipCompound}><span className="border-b border-dotted border-current cursor-help">{r.housingCompound}</span></Tip>
                      )}
                    </button>
                  ))}
                </div>
                {housing === "compound" && <InfoBox text={r.compoundInfo} />}
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.schoolTier}</label>
                <select value={schoolTierId} onChange={(e) => setSchoolTierId(e.target.value)}
                  disabled={children === 0}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:border-cyan-400 focus:outline-none appearance-none cursor-pointer disabled:opacity-40">
                  {SCHOOL_TIERS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lnLabel(lang, s)}
                      {s.monthly_sar > 0 ? ` — ${fmtN(s.monthly_sar)} SAR${r.perMonth}` : ""}
                    </option>
                  ))}
                </select>
                {children > 0 && <InfoBox text={r.schoolTierInfo} />}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 z-50 md:static md:z-auto bg-bg-primary/95 backdrop-blur-md py-3 md:py-0 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none">
          <button onClick={handleCalculate} disabled={salaryNum <= 0}
            className="mt-6 w-full min-h-14 md:w-auto md:min-h-0 px-10 py-3.5 bg-cyan-400 text-bg-primary font-bold rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide">
            {r.calculate} &rarr;
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RESULTS                                                        */}
      {/* ============================================================ */}
      {showResults && result && (
        <motion.div ref={resultsRef} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto px-4 pb-20">

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
            <span className="text-xs font-bold text-cyan-400 tracking-[0.3em]">{r.results}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          </div>

          {/* ---- EXCHANGE RATE BANNER ---- */}
          <div className="flex flex-wrap items-center justify-end gap-2 mb-4 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-mono">
              {r.exchangeRate.replace("{currency}", origin.currency).replace("{rate}", origin.rateToSar.toFixed(2))}
              {origin.currency === "USD" ? " (fixed peg)" : ""}
            </span>
            <span className="text-gray-600">|</span>
            <span>{r.exchangeRateUpdated}</span>
          </div>
          <p className="text-[10px] text-gray-600 text-right mb-4">{r.exchangeRatePeg}</p>

          {/* ---- SINGLE INCOME WARNING ---- */}
          {singleIncome && partnerSalaryNum > 0 && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-amber-400 mb-2">⚠️ {r.singleIncomeAlert}</h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                {r.singleIncomeWarning
                  .replace("{origin}", originName)
                  .replace("{combined}", fmtLocal(combinedLocal, origin.currencySymbol))
                  .replace("{single}", fmtLocal(salaryNum, origin.currencySymbol) + ` (${fmtSar(result.gross_sar)})`)}
              </p>
              <p className="text-sm text-amber-400 font-mono mt-2">
                {r.incomeReduction.replace("{pct}", String(Math.round((partnerSalaryNum / combinedLocal) * 100)))}
              </p>
              <p className="text-xs text-text-muted mt-3 mb-2">{r.toCompensate}</p>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• {r.tipHousingCover.replace("{rent}", fmtN(result.saudi_costs.rent)).replace("{type}", housing === "compound" ? r.housingCompound : r.housingApt)}</li>
                {children > 0 && <li>• {r.tipEducationAllow}</li>}
                <li>• {r.tipFlights.replace("{count}", String(flightCount)).replace("{cost}", fmtN(flightCost))}</li>
                <li>• {r.tipSpousalSupport}</li>
              </ul>
            </div>
          )}

          {/* ---- PRICE PULSE TICKER ---- */}
          {priceTrends.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-md p-3 mb-6">
              <div className="text-xs uppercase tracking-widest text-cyan-400 mb-0.5 font-bold">{r.pricePulse} — {r.pricePulseDate}</div>
              <div className="text-[10px] text-gray-500 mb-2">{r.pricePulseSubtitle.replace("{city}", saudiName)}</div>
              <div className="overflow-x-auto tabs-scroll">
                <div className="inline-flex items-center gap-0 text-xs font-mono">
                  {priceTrends.map((item, i) => {
                    const price = item.prices[saudiCostId];
                    return (
                      <span key={item.id} className="inline-flex items-center">
                        {i > 0 && <span className="text-gray-700 mx-2">|</span>}
                        <span className={item.trend === "up" ? "text-red-400" : "text-green-400"}>{item.trend === "up" ? "▲" : "▼"}</span>
                        <span className="text-text-secondary ml-1">{ln(lang, item)}</span>
                        {price !== undefined && <span className="text-text-muted ml-1">{fmtN(price)} SAR</span>}
                        <span className={`ml-1 ${item.trend === "up" ? "text-red-400" : "text-green-400"}`}>
                          {item.trendPct! > 0 ? "+" : ""}{item.trendPct}%
                        </span>
                        <span className="text-gray-600 ml-1">{r.pricePulseVs}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ---- TAB NAVIGATION with item counts ---- */}
          <div className="relative mb-6">
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none md:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none md:hidden" />
            <div className="overflow-x-auto tabs-scroll mobile-scroll -mx-4 px-4">
              <div className="flex flex-wrap md:flex-wrap gap-0">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id ? "text-white border-b-2 border-cyan-400" : "text-gray-500 hover:text-gray-300"
                    }`}>
                    {tab.label}
                    {tab.id !== "overview" && tabCounts[tab.id] > 0 && (
                      <span className="text-gray-600 ml-1">({tabCounts[tab.id]})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ---- OVERVIEW TAB ---- */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* ═══════ NET VERDICT HERO ═══════ */}
              <div className="bg-gray-900/80 border border-cyan-500/30 rounded-xl p-6">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-5">{r.netVerdict}</h3>

                {/* Minimum salary */}
                <div className="mb-4">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1.5">{r.minimumSalary}</p>
                  <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-cyan-400/60 rounded-full" style={{ width: `${Math.min((minSalary / (recSalary * 1.2)) * 100, 100)}%` }} />
                  </div>
                  <p className="font-mono text-lg text-cyan-400 font-bold">
                    {fmtSar(minSalary)} <span className="text-gray-500 text-sm">({sarToLocal(minSalary, originRate, origin.currencySymbol)})</span>
                  </p>
                </div>

                {/* Recommended salary */}
                <div className="mb-4">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1.5">{r.recommendedSalary}</p>
                  <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-emerald-400/60 rounded-full" style={{ width: `${Math.min((recSalary / (recSalary * 1.2)) * 100, 100)}%` }} />
                  </div>
                  <p className="font-mono text-lg text-emerald-400 font-bold">
                    {fmtSar(recSalary)} <span className="text-gray-500 text-sm">({sarToLocal(recSalary, originRate, origin.currencySymbol)})</span>
                  </p>
                  <p className="text-xs text-gray-500">{r.withSavingsBuffer}</p>
                </div>

                {/* Tax savings */}
                {origin.taxRate > 0 && (
                  <div className="mb-4 pt-3 border-t border-white/10">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{r.yourTaxSavings}</p>
                    <p className="font-mono text-lg text-emerald-400 font-bold">
                      +{fmtSar(result.tax_savings_sar)}{r.perMonth} <span className="text-gray-500 text-sm">({fmtLocal(result.tax_savings_local, origin.currencySymbol)})</span>
                    </p>
                    <p className="text-xs text-gray-500">{r.moneyYouKeep}</p>
                  </div>
                )}

                {/* EOSB */}
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                    <Tip text={r.tooltipEosb}><span className="border-b border-dotted border-gray-500 cursor-help">{r.eosbAfterLabel}</span></Tip>
                  </p>
                  <p className="font-mono text-lg text-purple-400 font-bold">
                    ~{fmtSar(result.eosb_5yr_sar)} <span className="text-gray-500 text-sm">({sarToLocal(result.eosb_5yr_sar, originRate, origin.currencySymbol)})</span>
                  </p>
                  <p className="text-xs text-gray-500">{r.taxFreeSeverance}</p>
                </div>
              </div>

              {/* ═══════ NEGOTIATION CHECKLIST ═══════ */}
              <div className="bg-bg-card/60 border border-yellow-500/20 rounded-xl p-5 md:p-6">
                <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-[0.2em] mb-4">📋 {r.packageChecklist}</h3>
                <div className="space-y-2 text-sm">
                  <CheckItem text={r.checkBaseSalary.replace("{min}", fmtN(minSalary)).replace("{rec}", fmtN(recSalary))} />
                  <CheckItem text={r.checkHousing.replace("{amount}", fmtN(housingAllowance))} />
                  {housingAllowance < result.saudi_costs.rent && (
                    <p className="text-xs text-amber-400 ml-7">
                      → {r.checkHousingGap.replace("{type}", housing === "compound" ? r.housingCompound : r.housingApt).replace("{rent}", fmtN(result.saudi_costs.rent))}
                    </p>
                  )}
                  {children > 0 && (
                    <>
                      <CheckItem text={r.checkEducation.replace("{needed}", fmtN(schoolTier.monthly_sar * 12)).replace("{tier}", lnLabel(lang, schoolTier))} />
                      {schoolTier.monthly_sar * 12 > 40000 && (
                        <p className="text-xs text-amber-400 ml-7">
                          → {r.checkEducationGap.replace("{gap}", fmtN(schoolTier.monthly_sar * 12 - 40000))}
                        </p>
                      )}
                    </>
                  )}
                  <CheckItem text={r.checkFlights.replace("{count}", String(flightCount)).replace("{cost}", fmtN(flightCost))} />
                  <CheckItem text={r.checkTransport.replace("{amount}", fmtN(transportAllowance))} />
                  <CheckItem text={r.checkMedical} />
                  <CheckItem text={r.checkLeave} />
                </div>

                {origin.taxRate > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-xs text-yellow-400 font-bold mb-1">💡 PRO TIP</p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {r.proTip
                        .replace("{amount}", fmtSar(result.tax_savings_sar))
                        .replace("{origin}", originName)
                        .replace("{originNet}", fmtLocal(result.net_local, origin.currencySymbol))
                        .replace("{needed}", fmtSar(minSalary))}
                    </p>
                  </div>
                )}
              </div>

              {/* ═══════ SIDE-BY-SIDE COMPARISON ═══════ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/10 rounded-xl overflow-hidden">
                {/* Origin */}
                <div className="bg-bg-card/40 p-5 md:p-6 border-b md:border-b-0 md:border-r border-white/10">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4A853]" />{originName}
                  </h3>
                  <div className="space-y-1 mb-5">
                    <Row label={`${r.gross}:`} value={fmtLocal(result.gross_local, origin.currencySymbol) + r.perMonth} />
                    <Row label={`${r.tax}: -${origin.taxRate}%`} value={`(${fmtLocal(result.tax_local, origin.currencySymbol)})`} className="text-red-400" />
                    <Row label={`${r.net}:`} value={fmtLocal(result.net_local, origin.currencySymbol) + r.perMonth} className="text-text-primary font-bold" />
                  </div>
                  <h4 className="text-xs text-text-muted uppercase tracking-wider mb-3">{r.monthlyCosts}</h4>
                  <div className="space-y-1.5">
                    <Row label={`${r.rent}:`} value={fmtLocal(result.origin_costs.rent, origin.currencySymbol)} />
                    <Row label={`${r.food}:`} value={fmtLocal(result.origin_costs.food, origin.currencySymbol)} />
                    <Row label={`${r.transport}:`} value={fmtLocal(result.origin_costs.transport, origin.currencySymbol)} />
                    <Row label={`${r.utilities}:`} value={fmtLocal(result.origin_costs.utilities, origin.currencySymbol)} />
                    <Row label={`${r.dining}:`} value={fmtLocal(result.origin_costs.dining, origin.currencySymbol)} />
                    <div className="border-t border-white/10 pt-1.5 mt-2">
                      <Row label={`${r.total}:`} value={fmtLocal(result.origin_total_local, origin.currencySymbol)} className="font-bold text-text-primary" />
                    </div>
                  </div>
                  {/* Savings with explainer */}
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <Row label={`${r.savings}:`}
                      value={`${result.origin_savings_local >= 0 ? "" : "-"}${fmtLocal(result.origin_savings_local, origin.currencySymbol)}${r.perMonth}`}
                      className={result.origin_savings_local >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"} />
                  </div>
                </div>

                {/* Saudi */}
                <div className="bg-bg-card/60 p-5 md:p-6">
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />{saudiName}
                  </h3>
                  <div className="space-y-1 mb-5">
                    <Row label={`${r.equivalent}:`} value={fmtSar(result.gross_sar) + r.perMonth} />
                    <Row label={`${r.tax}: 0%`} value="(0 SAR)" className="text-emerald-400" />
                    <Row label={`${r.net}:`} value={fmtSar(result.net_sar) + r.perMonth} className="text-cyan-400 font-bold" />
                  </div>
                  <h4 className="text-xs text-text-muted uppercase tracking-wider mb-3">{r.monthlyCosts}</h4>
                  <div className="space-y-1.5">
                    <DualRow label={`${r.rent}:`} sar={result.saudi_costs.rent} rate={originRate} sym={origin.currencySymbol} />
                    <DualRow label={`${r.food}:`} sar={result.saudi_costs.food} rate={originRate} sym={origin.currencySymbol} />
                    <DualRow label={`${r.transport}:`} sar={result.saudi_costs.transport} rate={originRate} sym={origin.currencySymbol} />
                    <DualRow label={`${r.utilities}:`} sar={result.saudi_costs.utilities} rate={originRate} sym={origin.currencySymbol} />
                    <DualRow label={`${r.dining}:`} sar={result.saudi_costs.dining} rate={originRate} sym={origin.currencySymbol} />
                    {result.saudi_costs.school > 0 && (
                      <DualRow label={`${r.school}:`} sar={result.saudi_costs.school} rate={originRate} sym={origin.currencySymbol} />
                    )}
                    {result.saudi_costs.dep_fee > 0 && (
                      <DualRow label={<Tip text={r.tooltipDepFee}><span className="border-b border-dotted border-gray-500 cursor-help">{r.depFee}:</span></Tip>}
                        sar={result.saudi_costs.dep_fee} rate={originRate} sym={origin.currencySymbol} />
                    )}
                    <div className="border-t border-white/10 pt-1.5 mt-2">
                      <DualRow label={`${r.total}:`} sar={result.saudi_total_sar} rate={originRate} sym={origin.currencySymbol} bold />
                    </div>
                  </div>
                  {/* Savings with explainer */}
                  <div className="mt-3 pt-2 border-t border-white/10">
                    <div className={`text-sm font-bold ${result.saudi_savings_sar >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      <div className="flex justify-between">
                        <span>{r.savings}:</span>
                        <span className="font-mono">{fmtSar(result.saudi_savings_sar)}{r.perMonth}</span>
                      </div>
                    </div>
                    {/* Explicit savings explanation */}
                    <div className="mt-2 text-xs leading-relaxed">
                      {result.saudi_savings_sar >= 0 ? (
                        <p className="text-emerald-400">
                          ✅ {r.youSave.replace("{amount}", fmtSar(result.saudi_savings_sar)).replace("{city}", saudiName).replace("{origin}", originName)}
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-red-400">
                            ⚠️ {r.youSpend.replace("{amount}", fmtSar(Math.abs(result.saudi_savings_sar))).replace("{city}", saudiName).replace("{origin}", originName)}
                          </p>
                          {origin.taxRate > 0 && (
                            <>
                              <p className="text-text-muted">→ {r.taxOffset.replace("{amount}", fmtSar(result.tax_savings_sar))}</p>
                              <p className="text-text-muted">
                                → {r.netPosition.replace("{amount}", fmtSar(result.saudi_savings_sar + result.tax_savings_sar))}
                                {Math.abs(result.saudi_savings_sar + result.tax_savings_sar) < 2000 && ` (${r.almostBreakeven})`}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════ RADAR CHART (lazy loaded — Recharts) ═══════ */}
              <RadarChartSection
                radarData={radarData}
                radarBullets={radarBullets}
                originName={originName}
                saudiName={saudiName}
                originRate={originRate}
                currencySymbol={origin.currencySymbol}
                fmtLocal={fmtLocal}
                fmtSar={fmtSar}
                r={{
                  radarTitle: r.radarTitle,
                  perMonth: r.perMonth,
                  radarSummary: r.radarSummary,
                  radarCheaperBy: r.radarCheaperBy,
                  radarPricierBy: r.radarPricierBy,
                }}
              />

              {/* ═══════ BAR CHART with dual currency & diff lines ═══════ */}
              <div className="bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-5">{r.comparisonChart}</h3>
                <div className="space-y-5">
                  {[
                    { label: r.rent, o: result.origin_costs.rent, s: result.saudi_costs.rent },
                    { label: r.food, o: result.origin_costs.food, s: result.saudi_costs.food },
                    { label: r.transport, o: result.origin_costs.transport, s: result.saudi_costs.transport },
                    { label: r.utilities, o: result.origin_costs.utilities, s: result.saudi_costs.utilities },
                    { label: r.dining, o: result.origin_costs.dining, s: result.saudi_costs.dining },
                  ].map((bar) => {
                    const oSar = bar.o * origin.rateToSar;
                    const max = Math.max(oSar, bar.s, 1);
                    const diffPct = oSar > 0 ? Math.round(((bar.s - oSar) / oSar) * 100) : 0;
                    return (
                      <div key={bar.label}>
                        <div className="text-xs text-text-muted mb-1.5 font-medium">{bar.label}</div>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="flex-1 h-5 bg-gray-800/30 rounded overflow-hidden">
                            <div className="h-full bg-[#D4A853]/60 rounded transition-all duration-500" style={{ width: `${(oSar / max) * 100}%` }} />
                          </div>
                          <span className="text-xs font-mono text-[#D4A853] w-40 text-right flex-shrink-0">
                            {fmtLocal(bar.o, origin.currencySymbol)} <span className="text-gray-600">({fmtSar(oSar)})</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-5 bg-gray-800/30 rounded overflow-hidden">
                            <div className="h-full bg-cyan-400/60 rounded transition-all duration-500" style={{ width: `${(bar.s / max) * 100}%` }} />
                          </div>
                          <span className="text-xs font-mono text-cyan-400 w-40 text-right flex-shrink-0">
                            {fmtSar(bar.s)} <span className="text-gray-600">({sarToLocal(bar.s, originRate, origin.currencySymbol)})</span>
                          </span>
                        </div>
                        {/* Diff line */}
                        <div className={`text-[10px] font-mono mt-0.5 text-center ${diffPct < 0 ? "text-green-400" : diffPct > 0 ? "text-red-400" : "text-gray-500"}`}>
                          ── {diffPct > 0 ? "+" : ""}{diffPct}% ──
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Pulse GRID */}
              {priceTrends.length > 0 && (
                <div className="bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-1">{r.pricePulse} — {r.pricePulseDate}</h3>
                  <p className="text-[10px] text-gray-500 mb-4">{r.pricePulseSubtitle.replace("{city}", saudiName)}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">{r.ppItem}</th>
                          <th className="text-right py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">{r.ppCity}</th>
                          <th className="text-right py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">{r.ppPrice} (SAR)</th>
                          {originCostId && (
                            <th className="text-right py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                              {r.ppOriginPrice.replace("{currency}", origin.currency)}
                            </th>
                          )}
                          <th className="text-center py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">{r.ppTrend}</th>
                          <th className="text-right py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">{r.ppChange}</th>
                          <th className="text-right py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">{r.pricePulseVs}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceTrends.map((item, i) => {
                          const price = item.prices[saudiCostId];
                          return (
                            <tr key={item.id} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                              <td className="py-2 px-3 text-text-secondary">{ln(lang, item)}</td>
                              <td className="py-2 px-3 text-right text-text-muted text-xs">{saudiName}</td>
                              <td className="py-2 px-3 text-right font-mono text-text-primary">{price !== undefined ? fmtN(price) + " SAR" : "—"}</td>
                              {originCostId && (
                                <td className="py-2 px-3 text-right font-mono text-gray-500">
                                  {price !== undefined ? sarToLocal(price, originRate, origin.currencySymbol) : "—"}
                                </td>
                              )}
                              <td className="py-2 px-3 text-center">
                                <span className={item.trend === "up" ? "text-red-400" : "text-green-400"}>
                                  {item.trend === "up" ? "▲" : "▼"}
                                </span>
                              </td>
                              <td className={`py-2 px-3 text-right font-mono ${item.trend === "up" ? "text-red-400" : "text-green-400"}`}>
                                {item.trendPct! > 0 ? "+" : ""}{item.trendPct}%
                              </td>
                              <td className="py-2 px-3 text-right text-gray-600 text-xs">{r.pricePulseVs}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- EDUCATION TAB ---- */}
          {activeTab === "education" && (
            <div className="space-y-6">
              <CategoryTable categories={TAB_CATEGORY_MAP.education} originCostId={originCostId} origin={origin} saudi={saudi} lang={lang} r={r} getCategoryComparison={getCategoryComparison} />
              {schoolItems.length > 0 && (
                <div className="bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">{r.schoolsInCity.replace("{city}", saudiName)}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {schoolItems.map((si) => {
                      const fee = si.prices[saudiCostId]!;
                      return (
                        <div key={si.id} className="border border-gray-800/50 rounded-md p-3 bg-gray-900/50">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm text-text-primary font-medium">{ln(lang, si)}</p>
                              <span className="inline-block mt-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">{si.subcategory}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-mono text-text-primary font-bold">{fmtN(fee)} SAR</p>
                              <p className="text-[10px] text-gray-500">{sarToLocal(fee, originRate, origin.currencySymbol)} {r.perYear}</p>
                              {si.trend === "up" && <span className="text-[10px] text-red-400 font-mono">▲ +{si.trendPct}%</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- CATEGORY TABS ---- */}
          {activeTab !== "overview" && activeTab !== "education" && (
            <CategoryTable categories={TAB_CATEGORY_MAP[activeTab]} originCostId={originCostId} origin={origin} saudi={saudi} lang={lang} r={r} getCategoryComparison={getCategoryComparison} />
          )}

          {/* ---- SHARE + ACTIONS ---- */}
          <div className="mt-8 space-y-3">
            <div className="border border-cyan-500/30 rounded-lg p-5 bg-gradient-to-r from-cyan-500/5 to-transparent">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wide mb-1">
                    {lang === "fr" ? "VOTRE RAPPORT PERSONNALIS\u00C9" : lang === "ar" ? "\u062A\u0642\u0631\u064A\u0631\u0643 \u0627\u0644\u0634\u062E\u0635\u064A" : "YOUR PERSONALIZED REPORT"}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {lang === "fr"
                      ? "Analyse compl\u00E8te de 8 pages : revenus, co\u00FBts, n\u00E9gociation, risque IA et objectifs salariaux."
                      : lang === "ar"
                      ? "\u062A\u062D\u0644\u064A\u0644 \u0643\u0627\u0645\u0644 \u0645\u0646 8 \u0635\u0641\u062D\u0627\u062A: \u0627\u0644\u062F\u062E\u0644\u060C \u0627\u0644\u062A\u0643\u0627\u0644\u064A\u0641\u060C \u0627\u0644\u062A\u0641\u0627\u0648\u0636\u060C \u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0648\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u0631\u0627\u062A\u0628."
                      : "Complete 8-page analysis: income, costs, negotiation, AI risk and salary targets."}
                  </p>
                </div>
              </div>
              <button
                onClick={handlePDFClick}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold min-h-14 rounded-lg text-base transition-colors flex items-center justify-center gap-2"
              >
                📄 {lang === "fr" ? "T\u00E9l\u00E9charger mon rapport gratuit \u2192" : lang === "ar" ? "\u062A\u062D\u0645\u064A\u0644 \u062A\u0642\u0631\u064A\u0631\u064A \u0627\u0644\u0645\u062C\u0627\u0646\u064A \u2190" : "Download my free report \u2192"}
              </button>
            </div>
            <ShareBar
              url={`https://www.ksashiftobservatory.online/relocate/${originId}-to-${saudiId}`}
              text={(() => {
                const originN = ln(lang, origin);
                const saudiN = ln(lang, saudi);
                return r.shareText.replace("{origin}", originN).replace("{saudi}", saudiN).replace("{amount}", fmtN(result.tax_savings_sar));
              })()}
            />
            <button onClick={handleReset} className="w-full md:w-auto px-5 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5 transition-colors text-sm">{r.tryAnother}</button>
          </div>

          <p className="text-xs text-text-muted mt-6 max-w-3xl">{r.disclaimer} {r.exchangeRateNote}</p>
        </motion.div>
      )}

      {/* ---- POPULAR COMPARISONS — internal links for SEO ---- */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">
          {lang === "ar" ? "\u0645\u0642\u0627\u0631\u0646\u0627\u062A \u0634\u0627\u0626\u0639\u0629" : lang === "fr" ? "COMPARAISONS POPULAIRES" : "POPULAR COMPARISONS"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            ["paris", "riyadh"], ["london", "riyadh"], ["new-york", "riyadh"], ["cairo", "riyadh"],
            ["paris", "jeddah"], ["mumbai", "jeddah"], ["dubai", "riyadh"], ["manila", "dammam"],
            ["sydney", "riyadh"], ["amman", "jeddah"], ["casablanca", "riyadh"], ["tunis", "jeddah"],
            ["london", "jeddah"], ["beirut", "riyadh"], ["new-york", "jeddah"], ["cairo", "makkah"],
          ].map(([o, s]) => {
            const oCity = ORIGIN_CITIES.find((c) => c.id === o);
            const sCity = SAUDI_CITIES.find((c) => c.id === s);
            if (!oCity || !sCity) return null;
            return (
              <Link key={`${o}-${s}`} href={`/relocate/${o}-to-${s}`}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-text-muted hover:text-cyan-400 hover:border-cyan-400/30 transition-colors">
                {`${ln(lang, oCity)} \u2192 ${ln(lang, sCity)}`}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Hidden scrollbar CSS */}
      <style jsx global>{`
        .tabs-scroll::-webkit-scrollbar { display: none; }
        .tabs-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Email gate modal for PDF download */}
      <EmailGateModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        loading={emailLoading}
        lang={lang}
      />
    </div>
  );
}

/* ================================================================== */
/* Sub-components                                                       */
/* ================================================================== */

function Row({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex justify-between items-center text-sm ${className || "text-text-muted"}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function DualRow({ label, sar, rate, sym, bold }: { label: React.ReactNode; sar: number; rate: number; sym: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center text-sm ${bold ? "font-bold text-text-primary" : "text-text-muted"}`}>
      <span>{label}</span>
      <span className="font-mono">
        {fmtSar(sar)} <span className="text-gray-500 text-xs">({sarToLocal(sar, rate, sym)})</span>
      </span>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-text-secondary">
      <span className="text-emerald-400 mt-0.5 flex-shrink-0">✅</span>
      <span>{text}</span>
    </div>
  );
}

function CategoryTable({ categories, originCostId, origin, saudi, lang, r, getCategoryComparison }: {
  categories: CostCategory[];
  originCostId: CityId | null;
  origin: { name_en: string; name_ar: string; name_fr?: string; currency: string; currencySymbol: string };
  saudi: { name_en: string; name_ar: string; name_fr?: string };
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  r: any;
  getCategoryComparison: (cats: CostCategory[]) => {
    item: CostItem; originPrice: number; saudiPrice: number; originInSar: number; saudiInLocal: number; diffPct: number;
  }[];
}) {
  const data = getCategoryComparison(categories);
  if (!originCostId || data.length === 0) {
    return (
      <div className="bg-bg-card/60 border border-white/10 rounded-xl p-8 text-center text-text-muted text-sm">
        No comparison data available for this city combination.
      </div>
    );
  }

  const originLabel = ln(lang, origin as { name_en: string; name_ar: string; name_fr?: string });
  const saudiLabel = ln(lang, saudi as { name_en: string; name_ar: string; name_fr?: string });
  const catNames = categories.map((c) => lnCat(lang, COST_CATEGORIES[c]) || c).join(" & ");

  return (
    <div className="bg-bg-card/60 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02]">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{catNames}</span>
        <span className="text-xs text-text-muted ml-2">— {originLabel} {r.vsCity} {saudiLabel}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="text-left py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium">{r.thItem}</th>
              <th className="text-right py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium whitespace-nowrap">
                {r.thOriginPrice.replace("{city}", originLabel).replace("{currency}", origin.currency)}
              </th>
              <th className="text-right py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium whitespace-nowrap">
                {r.thSaudiPrice.replace("{city}", saudiLabel).replace("{currency}", "SAR")}
              </th>
              <th className="text-right py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium whitespace-nowrap">~{origin.currency}</th>
              <th className="text-right py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium">{r.thDiff}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.item.id} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                <td className="py-2 px-4 text-text-secondary">
                  {ln(lang, row.item)}
                  {row.item.trend && row.item.trend !== "stable" && (
                    <span className={`ml-1 text-[10px] ${row.item.trend === "up" ? "text-red-400" : "text-green-400"}`}>
                      {row.item.trend === "up" ? "▲" : "▼"}
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 text-right font-mono text-text-primary whitespace-nowrap">
                  {origin.currencySymbol}{row.originPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-4 text-right font-mono text-text-primary whitespace-nowrap">
                  {row.saudiPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })} SAR
                </td>
                <td className="py-2 px-4 text-right font-mono text-gray-500 whitespace-nowrap">
                  ~{origin.currencySymbol}{row.saudiInLocal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </td>
                <td className={`py-2 px-4 text-right font-mono whitespace-nowrap ${
                  row.diffPct < 0 ? "text-green-400" : row.diffPct > 0 ? "text-red-400" : "text-text-muted"
                }`}>
                  {row.diffPct > 0 ? "+" : ""}{row.diffPct}% {row.diffPct < -5 ? "▼" : row.diffPct > 5 ? "▲" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
