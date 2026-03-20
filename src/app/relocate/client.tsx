"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useLang } from "@/lib/i18n/context";
import LangToggle from "@/components/ui/LangToggle";
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

/** Simple fuzzy match score: how well does query match name */
function fuzzyScore(query: string, name: string): number {
  const q = query.toLowerCase();
  const n = name.toLowerCase();
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 60;
  // Check if all query chars appear in order
  let qi = 0;
  for (let i = 0; i < n.length && qi < q.length; i++) {
    if (n[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 40;
  // Partial word match
  const words = n.split(/\s+/);
  for (const w of words) {
    if (w.startsWith(q)) return 50;
  }
  return 0;
}

/** Map origin city id to CityId for cost database */
function toCostCityId(originId: string): CityId | null {
  const map: Record<string, CityId> = {
    paris: "paris",
    "new-york": "new_york",
    "san-francisco": "new_york", // use NY prices
    london: "london",
    dubai: "dubai",
    cairo: "cairo",
    amman: "amman",
    beirut: "beirut",
    mumbai: "mumbai",
    manila: "manila",
    toronto: "new_york", // use NY prices (both USD-ish)
    islamabad: "mumbai", // use Mumbai as proxy
    sydney: "sydney",
    casablanca: "casablanca",
    tunis: "tunis",
  };
  return map[originId] || null;
}

function toSaudiCostCityId(saudiId: string): CityId {
  return saudiId as CityId;
}

/* ------------------------------------------------------------------ */
/* Main Component                                                       */
/* ------------------------------------------------------------------ */

export default function RelocateClient() {
  const { t, lang, dir } = useLang();
  const r = t.relocate;
  const resultsRef = useRef<HTMLDivElement>(null);

  /* ---- Form state ---- */
  const [originId, setOriginId] = useState("paris");
  const [salaryStr, setSalaryStr] = useState("");
  const [occSearch, setOccSearch] = useState("");
  const [occDropOpen, setOccDropOpen] = useState(false);
  const [selectedOcc, setSelectedOcc] = useState<Occupation | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [saudiId, setSaudiId] = useState("riyadh");
  const [housing, setHousing] = useState<HousingType>("compound");
  const [schoolTierId, setSchoolTierId] = useState("midtier");
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const origin = ORIGIN_CITIES.find((c) => c.id === originId)!;
  const saudi = SAUDI_CITIES.find((c) => c.id === saudiId)!;
  const schoolTier = SCHOOL_TIERS.find((s) => s.id === schoolTierId)!;
  const salaryNum = parseInt(salaryStr.replace(/[^0-9]/g, ""), 10) || 0;

  /* ---- Fuzzy occupation search ---- */
  const filteredOccs = useMemo(() => {
    if (!occSearch.trim()) return [];
    const q = occSearch.trim();
    const scored = allOccupations
      .map((o) => ({
        occ: o,
        score: Math.max(fuzzyScore(q, o.name_en), fuzzyScore(q, o.name_ar)),
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 5);
  }, [occSearch]);

  /* ---- Calculate ---- */
  const result: RelocationResult | null = useMemo(() => {
    if (salaryNum <= 0) return null;
    return calculateRelocation({
      origin,
      saudi,
      salaryLocal: salaryNum,
      adults,
      children,
      housing,
      schoolTier,
    });
  }, [origin, saudi, salaryNum, adults, children, housing, schoolTier]);

  const handleCalculate = () => {
    if (!result) return;
    setShowResults(true);
    setActiveTab("overview");
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleReset = () => {
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---- Occupation salary info ---- */
  const occInfo = useMemo(() => {
    if (!selectedOcc) return null;
    const name = lang === "ar" ? selectedOcc.name_ar : selectedOcc.name_en;
    return {
      name,
      entry: fmtN(selectedOcc.salary_entry_sar),
      senior: fmtN(selectedOcc.salary_senior_sar),
      median: fmtN(selectedOcc.salary_median_sar),
      composite: selectedOcc.composite,
      slug: toSlug(selectedOcc.name_en),
    };
  }, [selectedOcc, lang]);

  /* ---- Cost database city IDs ---- */
  const originCostId = toCostCityId(originId);
  const saudiCostId = toSaudiCostCityId(saudiId);

  /* ---- Category comparison data ---- */
  const getCategoryComparison = useCallback(
    (categories: CostCategory[]) => {
      if (!originCostId) return [];
      const items: {
        item: CostItem;
        originPrice: number;
        saudiPrice: number;
        originInSar: number;
        diffPct: number;
      }[] = [];
      for (const cat of categories) {
        const catItems = getCostsByCategory(cat);
        for (const ci of catItems) {
          const oPrice = ci.prices[originCostId];
          const sPrice = ci.prices[saudiCostId];
          if (oPrice === undefined || sPrice === undefined) continue;
          const oRate = CITY_EXCHANGE_RATES[originCostId];
          const sRate = CITY_EXCHANGE_RATES[saudiCostId];
          const oSar = oPrice * oRate;
          const sSar = sPrice * sRate;
          const diff = oSar > 0 ? Math.round(((sSar - oSar) / oSar) * 100) : 0;
          items.push({
            item: ci,
            originPrice: oPrice,
            saudiPrice: sPrice,
            originInSar: Math.round(oSar),
            diffPct: diff,
          });
        }
      }
      return items;
    },
    [originCostId, saudiCostId]
  );

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
      let originTotal = 0,
        saudiTotal = 0;
      for (const cat of axis.cats) {
        for (const ci of getCostsByCategory(cat)) {
          const oPrice = ci.prices[originCostId];
          const sPrice = ci.prices[saudiCostId];
          if (oPrice === undefined || sPrice === undefined) continue;
          originTotal += oPrice * CITY_EXCHANGE_RATES[originCostId];
          saudiTotal += sPrice * CITY_EXCHANGE_RATES[saudiCostId];
        }
      }
      const max = Math.max(originTotal, saudiTotal, 1);
      return {
        axis: axis.label,
        origin: Math.round((originTotal / max) * 100),
        saudi: Math.round((saudiTotal / max) * 100),
      };
    });
  }, [originCostId, saudiCostId, r]);

  /* ---- Price Pulse ---- */
  const priceTrends = useMemo(() => getPriceTrends(), []);

  /* ---- Negotiation tips ---- */
  const negTips = useMemo(() => {
    if (!result) return [];
    const tips: string[] = [];
    if (children === 0) {
      tips.push(r.tipNoChildren);
    } else {
      tips.push(r.tipWithChildren);
    }
    if (origin.taxRate >= 25) {
      tips.push(r.tipHighTax.replace("{amount}", fmtSar(result.tax_savings_sar)));
    }
    if (origin.mercerRank > 100) {
      const range = selectedOcc
        ? `${fmtN(selectedOcc.salary_entry_sar)}-${fmtN(selectedOcc.salary_senior_sar)} SAR`
        : "8,000-45,000 SAR";
      tips.push(r.tipEmergingMarket.replace("{range}", range));
    }
    return tips;
  }, [result, children, origin, selectedOcc, r]);

  /* ---- Schools for Education tab ---- */
  const schoolItems = useMemo(() => {
    return COST_DATABASE.filter(
      (ci) => ci.category === "education" && ci.prices[saudiCostId] !== undefined
    );
  }, [saudiCostId]);

  /* ---- Share ---- */
  const handleShareLinkedIn = () => {
    if (!result) return;
    const originName = lang === "ar" ? origin.name_ar : origin.name_en;
    const saudiName = lang === "ar" ? saudi.name_ar : saudi.name_en;
    const text = r.shareText
      .replace("{origin}", originName)
      .replace("{saudi}", saudiName)
      .replace("{amount}", fmtN(result.tax_savings_sar));
    const url = "https://www.ksashiftobservatory.online/relocate";
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

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

  /* ================================================================ */
  /* RENDER                                                             */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-bg-primary" dir={dir}>
      <LangToggle />

      {/* Header */}
      <header className="max-w-5xl mx-auto px-4 pt-8 pb-2">
        <Link
          href="/"
          className="text-text-muted text-sm hover:text-text-secondary transition-colors"
        >
          &larr; {r.back}
        </Link>
        <div className="flex items-start justify-between mt-4 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-wide">
              {r.title}
            </h1>
            <p className="text-text-muted mt-1">{r.subtitle}</p>
          </div>
          <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-full px-4 py-1.5 flex-shrink-0">
            <span className="text-emerald-400 font-bold text-sm">{r.taxFree}</span>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* FORM                                                          */}
      {/* ============================================================ */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-bg-card/60 border border-white/10 rounded-xl overflow-hidden">
          {/* YOUR CURRENT SITUATION */}
          <div className="p-5 md:p-6 border-b border-white/10">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-5">
              {r.currentSituation}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Origin city */}
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.iLiveIn}</label>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:border-cyan-400 focus:outline-none appearance-none cursor-pointer"
                >
                  {ORIGIN_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === "ar"
                        ? `${c.name_ar}، ${c.country_ar}`
                        : `${c.name_en}, ${c.country_en}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly salary */}
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.monthlySalary}</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={salaryStr}
                    onChange={(e) => setSalaryStr(e.target.value.replace(/[^0-9,]/g, ""))}
                    placeholder="5,000"
                    className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:border-cyan-400 focus:outline-none pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono">
                    {origin.currency}
                  </span>
                </div>
              </div>

              {/* Occupation — fuzzy search */}
              <div className="relative">
                <label className="text-sm text-text-muted mb-1.5 block">{r.myOccupation}</label>
                <input
                  type="text"
                  value={occSearch}
                  onChange={(e) => {
                    setOccSearch(e.target.value);
                    setOccDropOpen(true);
                    if (selectedOcc) setSelectedOcc(null);
                  }}
                  onFocus={() => occSearch.trim() && setOccDropOpen(true)}
                  placeholder={r.selectOccupation}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-cyan-400 focus:outline-none"
                />
                {occDropOpen && occSearch.trim() && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-bg-card border border-white/10 rounded-lg max-h-72 overflow-y-auto shadow-xl">
                    {filteredOccs.length > 0 ? (
                      filteredOccs.map(({ occ }) => (
                        <button
                          key={occ.name_en}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                          onClick={() => {
                            setSelectedOcc(occ);
                            setOccSearch(lang === "ar" ? occ.name_ar : occ.name_en);
                            setOccDropOpen(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-text-primary">
                              {lang === "ar" ? occ.name_ar : occ.name_en}
                            </span>
                            <span className={`text-xs font-mono ${riskColor(occ.composite)}`}>
                              {occ.composite}/100
                            </span>
                          </div>
                          <div className="text-xs text-text-muted mt-0.5 font-mono">
                            {fmtN(occ.salary_entry_sar)}-{fmtN(occ.salary_senior_sar)} SAR{r.perMonth}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm">
                        <span className="text-text-muted">{r.noMatch} </span>
                        <Link
                          href="/career"
                          className="text-cyan-400 hover:underline"
                          onClick={() => setOccDropOpen(false)}
                        >
                          {r.browseAll} &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                {/* Match indicator */}
                {selectedOcc && occInfo && (
                  <div className="mt-1.5 p-2 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">
                    <span className="text-xs text-cyan-400 font-medium">{r.matchedTo} </span>
                    <span className="text-xs text-text-primary font-medium">{occInfo.name}</span>
                    <span className="text-xs text-text-muted"> — AI Risk </span>
                    <span className={`text-xs font-mono font-bold ${riskColor(occInfo.composite)}`}>
                      {occInfo.composite}/100
                    </span>
                    <span className="text-xs text-text-muted"> — Salary </span>
                    <span className="text-xs font-mono text-text-secondary">
                      {occInfo.entry}-{occInfo.senior} SAR{r.perMonth}
                    </span>
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
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono text-text-primary">{adults}</span>
                    <button
                      onClick={() => setAdults(Math.min(4, adults + 1))}
                      className="w-8 h-8 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg"
                    >
                      +
                    </button>
                    <span className="text-xs text-text-muted">{r.adults}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-8 h-8 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-mono text-text-primary">{children}</span>
                    <button
                      onClick={() => setChildren(Math.min(6, children + 1))}
                      className="w-8 h-8 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg"
                    >
                      +
                    </button>
                    <span className="text-xs text-text-muted">{r.children}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SAUDI ARABIA OPTIONS */}
          <div className="p-5 md:p-6">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-5">
              {r.saudiOptions}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.targetCity}</label>
                <select
                  value={saudiId}
                  onChange={(e) => setSaudiId(e.target.value)}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:border-cyan-400 focus:outline-none appearance-none cursor-pointer"
                >
                  {SAUDI_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === "ar" ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.housing}</label>
                <div className="flex gap-2">
                  {(["apartment", "compound"] as HousingType[]).map((h) => (
                    <button
                      key={h}
                      onClick={() => setHousing(h)}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        housing === h
                          ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                          : "border-white/10 text-text-muted hover:bg-white/5"
                      }`}
                    >
                      {h === "apartment" ? r.housingApt : r.housingCompound}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.schoolTier}</label>
                <select
                  value={schoolTierId}
                  onChange={(e) => setSchoolTierId(e.target.value)}
                  disabled={children === 0}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary font-mono text-sm focus:border-cyan-400 focus:outline-none appearance-none cursor-pointer disabled:opacity-40"
                >
                  {SCHOOL_TIERS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === "ar" ? s.label_ar : s.label_en}
                      {s.monthly_sar > 0 ? ` — ${fmtN(s.monthly_sar)} SAR${r.perMonth}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Calculate button */}
        <button
          onClick={handleCalculate}
          disabled={salaryNum <= 0}
          className="mt-6 w-full sm:w-auto px-10 py-3.5 bg-cyan-400 text-bg-primary font-bold rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide"
        >
          {r.calculate} &rarr;
        </button>
      </div>

      {/* ============================================================ */}
      {/* RESULTS                                                        */}
      {/* ============================================================ */}
      {showResults && result && (
        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto px-4 pb-20"
        >
          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
            <span className="text-xs font-bold text-cyan-400 tracking-[0.3em]">{r.results}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          </div>

          {/* ---- PRICE PULSE TICKER ---- */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-md p-2 mb-6">
            <div className="text-xs uppercase tracking-widest text-cyan-400 mb-1 font-bold">
              {r.pricePulse} — {r.pricePulseDate}
            </div>
            <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="inline-flex items-center gap-0 text-xs font-mono">
                {priceTrends.map((item, i) => (
                  <span key={item.id} className="inline-flex items-center">
                    {i > 0 && <span className="text-gray-700 mx-2">|</span>}
                    <span className={item.trend === "up" ? "text-red-400" : "text-green-400"}>
                      {item.trend === "up" ? "\u25B2" : "\u25BC"}
                    </span>
                    <span className="text-text-secondary ml-1">
                      {lang === "ar" ? item.name_ar : item.name_en}
                    </span>
                    <span
                      className={`ml-1 ${item.trend === "up" ? "text-red-400" : "text-green-400"}`}
                    >
                      {item.trendPct! > 0 ? "+" : ""}
                      {item.trendPct}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ---- TAB NAVIGATION ---- */}
          <div className="overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4">
            <div className="inline-flex items-center gap-0 border border-white/10 rounded-lg overflow-hidden bg-bg-card/40">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-cyan-400/10 text-cyan-400 border-b-2 border-cyan-400"
                      : "text-text-muted hover:text-text-secondary hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ---- OVERVIEW TAB ---- */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Side-by-side income comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/10 rounded-xl overflow-hidden">
                {/* Origin */}
                <div className="bg-bg-card/40 p-5 md:p-6 border-b md:border-b-0 md:border-r border-white/10">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {lang === "ar" ? origin.name_ar : origin.name_en}
                  </h3>
                  <div className="space-y-1 mb-5">
                    <Row
                      label={`${r.gross}:`}
                      value={fmtLocal(result.gross_local, origin.currencySymbol) + r.perMonth}
                    />
                    <Row
                      label={`${r.tax}: -${origin.taxRate}%`}
                      value={`(${fmtLocal(result.tax_local, origin.currencySymbol)})`}
                      className="text-red-400"
                    />
                    <Row
                      label={`${r.net}:`}
                      value={fmtLocal(result.net_local, origin.currencySymbol) + r.perMonth}
                      className="text-text-primary font-bold"
                    />
                  </div>
                  <h4 className="text-xs text-text-muted uppercase tracking-wider mb-3">
                    {r.monthlyCosts}
                  </h4>
                  <div className="space-y-1.5">
                    <Row label={`${r.rent}:`} value={fmtLocal(result.origin_costs.rent, origin.currencySymbol)} />
                    <Row label={`${r.food}:`} value={fmtLocal(result.origin_costs.food, origin.currencySymbol)} />
                    <Row label={`${r.transport}:`} value={fmtLocal(result.origin_costs.transport, origin.currencySymbol)} />
                    <Row label={`${r.utilities}:`} value={fmtLocal(result.origin_costs.utilities, origin.currencySymbol)} />
                    <Row label={`${r.dining}:`} value={fmtLocal(result.origin_costs.dining, origin.currencySymbol)} />
                    <div className="border-t border-white/10 pt-1.5 mt-2">
                      <Row label={`${r.total}:`} value={fmtLocal(result.origin_total_local, origin.currencySymbol)} className="font-bold text-text-primary" />
                    </div>
                    <Row
                      label={`${r.savings}:`}
                      value={fmtLocal(result.origin_savings_local, origin.currencySymbol) + r.perMonth}
                      className={result.origin_savings_local >= 0 ? "text-emerald-400" : "text-red-400"}
                    />
                  </div>
                </div>

                {/* Saudi */}
                <div className="bg-bg-card/60 p-5 md:p-6">
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {lang === "ar" ? saudi.name_ar : saudi.name_en}
                  </h3>
                  <div className="space-y-1 mb-5">
                    <Row label="Equivalent:" value={fmtSar(result.gross_sar) + r.perMonth} />
                    <Row label={`${r.tax}: 0%`} value="(0 SAR)" className="text-emerald-400" />
                    <Row
                      label={`${r.net}:`}
                      value={fmtSar(result.net_sar) + r.perMonth}
                      className="text-cyan-400 font-bold"
                    />
                  </div>
                  <h4 className="text-xs text-text-muted uppercase tracking-wider mb-3">
                    {r.monthlyCosts}
                  </h4>
                  <div className="space-y-1.5">
                    <Row label={`${r.rent}:`} value={fmtSar(result.saudi_costs.rent)} />
                    <Row label={`${r.food}:`} value={fmtSar(result.saudi_costs.food)} />
                    <Row label={`${r.transport}:`} value={fmtSar(result.saudi_costs.transport)} />
                    <Row label={`${r.utilities}:`} value={fmtSar(result.saudi_costs.utilities)} />
                    <Row label={`${r.dining}:`} value={fmtSar(result.saudi_costs.dining)} />
                    {result.saudi_costs.school > 0 && (
                      <Row label={`${r.school}:`} value={fmtSar(result.saudi_costs.school)} />
                    )}
                    {result.saudi_costs.dep_fee > 0 && (
                      <Row label={`${r.depFee}:`} value={fmtSar(result.saudi_costs.dep_fee)} />
                    )}
                    <div className="border-t border-white/10 pt-1.5 mt-2">
                      <Row label={`${r.total}:`} value={fmtSar(result.saudi_total_sar)} className="font-bold text-text-primary" />
                    </div>
                    <Row
                      label={`${r.savings}:`}
                      value={fmtSar(result.saudi_savings_sar) + r.perMonth}
                      className={result.saudi_savings_sar >= 0 ? "text-emerald-400" : "text-red-400"}
                    />
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-5">
                  {r.keyInsights}
                </h3>
                <div className="space-y-4 text-sm">
                  <InsightRow icon="$" label={r.taxSavings} color="text-emerald-400" text={`+${fmtSar(result.tax_savings_sar)}${r.perMonth} (${fmtLocal(result.tax_savings_local, origin.currencySymbol)} ${r.taxSaved})`} />
                  <InsightRow icon="H" label={r.rentLabel} color={result.rent_diff_pct > 0 ? "text-amber-400" : "text-emerald-400"} text={`${housing === "compound" ? r.housingCompound : r.housingApt}: ${fmtSar(result.saudi_costs.rent)} vs ${fmtLocal(result.origin_costs.rent, origin.currencySymbol)} = ${result.rent_diff_pct > 0 ? "+" : ""}${result.rent_diff_pct}% ${result.rent_diff_pct > 0 ? r.moreExpensive : r.lessExpensive}`} />
                  {children > 0 && (
                    <InsightRow icon="S" label={r.schooling} color="text-amber-400" text={`~${fmtSar(result.school_cost_sar)}${r.perMonth}${origin.schoolFree ? ` (${r.freeInOrigin} ${lang === "ar" ? origin.name_ar : origin.name_en})` : ""}`} />
                  )}
                  <InsightRow icon="M" label={r.mercer} color="text-blue-400" text={`${lang === "ar" ? saudi.name_ar : saudi.name_en} #${saudi.mercerRank} vs ${lang === "ar" ? origin.name_ar : origin.name_en} #${origin.mercerRank} (${saudi.mercerRank > origin.mercerRank ? r.mercerCheaper : r.mercerPricier})`} />
                  <InsightRow icon="B" label={r.eosb} color="text-purple-400" text={`~${fmtSar(result.eosb_5yr_sar)} ${r.eosbAfter5yr}`} />
                  {occInfo && (
                    <InsightRow
                      icon="!"
                      label={r.aiRisk}
                      color={riskColor(occInfo.composite)}
                      text={`${occInfo.name}: ${occInfo.composite}/100`}
                      link={`/job/${occInfo.slug}`}
                      linkText={occInfo.composite >= 45 ? r.considerTransition + " \u2192" : undefined}
                    />
                  )}
                  {/* Verdict */}
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                      {r.netVerdict}
                    </h4>
                    <p className="text-text-secondary leading-relaxed">
                      {r.verdictNeed}{" "}
                      <span className="font-mono text-cyan-400 font-bold">
                        {fmtSar(result.saudi_total_sar)}
                        {r.perMonth}
                      </span>
                      .{" "}
                      {origin.taxRate > 0 && (
                        <>
                          {r.verdictSavings}{" "}
                          <span className="font-mono text-emerald-400 font-bold">
                            {fmtLocal(result.tax_savings_local, origin.currencySymbol)}
                            {r.perMonth}
                          </span>
                          .
                        </>
                      )}
                    </p>
                  </div>
                  {/* Tips */}
                  {negTips.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
                        {r.negotiate}
                      </h4>
                      <ul className="space-y-1.5">
                        {negTips.map((tip, i) => (
                          <li key={i} className="text-text-secondary flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">&#9656;</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Radar Chart */}
              {radarData.length > 0 && (
                <div className="bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">
                    {r.radarTitle}
                  </h3>
                  <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                          dataKey="axis"
                          tick={{ fill: "#9CA3AF", fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name={lang === "ar" ? origin.name_ar : origin.name_en}
                          dataKey="origin"
                          stroke="#F59E0B"
                          fill="#F59E0B"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Radar
                          name={lang === "ar" ? saudi.name_ar : saudi.name_en}
                          dataKey="saudi"
                          stroke="#22D3EE"
                          fill="#22D3EE"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Price Pulse grid */}
              <div className="bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">
                  {r.pricePulse} — {r.pricePulseDate}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                          {r.ppItem}
                        </th>
                        <th className="text-right py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                          {r.ppPrice}
                        </th>
                        <th className="text-center py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                          {r.ppTrend}
                        </th>
                        <th className="text-right py-2 px-3 text-xs text-text-muted uppercase tracking-wider font-medium">
                          {r.ppChange}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceTrends.map((item, i) => {
                        const price = item.prices[saudiCostId];
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                          >
                            <td className="py-2 px-3 text-text-secondary">
                              {lang === "ar" ? item.name_ar : item.name_en}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-text-primary">
                              {price !== undefined ? fmtN(price) + " SAR" : "—"}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={
                                  item.trend === "up" ? "text-red-400" : "text-green-400"
                                }
                              >
                                {item.trend === "up" ? "\u25B2" : "\u25BC"}
                              </span>
                            </td>
                            <td
                              className={`py-2 px-3 text-right font-mono ${
                                item.trend === "up" ? "text-red-400" : "text-green-400"
                              }`}
                            >
                              {item.trendPct! > 0 ? "+" : ""}
                              {item.trendPct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary bar chart */}
              <div className="bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-5">
                  {r.comparisonChart}
                </h3>
                <div className="space-y-4">
                  {[
                    { label: r.rent, o: result.origin_costs.rent, s: result.saudi_costs.rent },
                    { label: r.food, o: result.origin_costs.food, s: result.saudi_costs.food },
                    { label: r.transport, o: result.origin_costs.transport, s: result.saudi_costs.transport },
                    { label: r.utilities, o: result.origin_costs.utilities, s: result.saudi_costs.utilities },
                    { label: r.dining, o: result.origin_costs.dining, s: result.saudi_costs.dining },
                  ].map((bar) => {
                    const oSar = bar.o * origin.rateToSar;
                    const max = Math.max(oSar, bar.s, 1);
                    return (
                      <div key={bar.label}>
                        <div className="text-xs text-text-muted mb-1 font-medium">{bar.label}</div>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                            <div className="h-full bg-amber-400/60 rounded" style={{ width: `${(oSar / max) * 100}%` }} />
                          </div>
                          <span className="text-xs font-mono text-amber-400 w-28 text-right flex-shrink-0">
                            {fmtLocal(bar.o, origin.currencySymbol)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                            <div className="h-full bg-cyan-400/60 rounded" style={{ width: `${(bar.s / max) * 100}%` }} />
                          </div>
                          <span className="text-xs font-mono text-cyan-400 w-28 text-right flex-shrink-0">
                            {fmtSar(bar.s)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ---- EDUCATION TAB ---- */}
          {activeTab === "education" && (
            <div className="space-y-6">
              {/* Category comparison table */}
              <CategoryTable
                categories={TAB_CATEGORY_MAP.education}
                originCostId={originCostId}

                origin={origin}
                saudi={saudi}
                lang={lang}
                r={r}
                getCategoryComparison={getCategoryComparison}
              />

              {/* School cards */}
              {schoolItems.length > 0 && (
                <div className="bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">
                    {r.schoolsInCity.replace(
                      "{city}",
                      lang === "ar" ? saudi.name_ar : saudi.name_en
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {schoolItems.map((si) => {
                      const fee = si.prices[saudiCostId]!;
                      const currLabel = si.subcategory;
                      return (
                        <div
                          key={si.id}
                          className="border border-gray-800/50 rounded-md p-3 bg-gray-900/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm text-text-primary font-medium">
                                {lang === "ar" ? si.name_ar : si.name_en}
                              </p>
                              <span className="inline-block mt-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                                {currLabel}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-mono text-text-primary font-bold">
                                {fmtN(fee)} SAR
                              </p>
                              <p className="text-[10px] text-text-muted">{r.perYear}</p>
                              {si.trend === "up" && (
                                <span className="text-[10px] text-red-400 font-mono">
                                  {"\u25B2"} +{si.trendPct}%
                                </span>
                              )}
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

          {/* ---- CATEGORY TABS (non-overview, non-education) ---- */}
          {activeTab !== "overview" && activeTab !== "education" && (
            <CategoryTable
              categories={TAB_CATEGORY_MAP[activeTab]}
              originCostId={originCostId}
              origin={origin}
              saudi={saudi}
              lang={lang}
              r={r}
              getCategoryComparison={getCategoryComparison}
            />
          )}

          {/* ---- SHARE + ACTIONS ---- */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleShareLinkedIn}
              className="px-5 py-2.5 bg-[#0A66C2] text-white rounded-lg text-sm font-medium hover:bg-[#004182] transition-colors"
            >
              {r.shareLinkedIn}
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5 transition-colors text-sm"
            >
              {r.tryAnother}
            </button>
          </div>

          <p className="text-xs text-text-muted mt-6 max-w-3xl">{r.disclaimer}</p>
        </motion.div>
      )}
    </div>
  );
}

/* ================================================================== */
/* Sub-components                                                       */
/* ================================================================== */

function Row({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-center text-sm ${className || "text-text-muted"}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function InsightRow({
  icon,
  label,
  text,
  color,
  link,
  linkText,
}: {
  icon: string;
  label: string;
  text: string;
  color: string;
  link?: string;
  linkText?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-white/5 ${color} flex-shrink-0 mt-0.5`}
      >
        {icon}
      </span>
      <div>
        <span className={`font-bold ${color}`}>{label}: </span>
        <span className="text-text-secondary">{text}</span>
        {link && linkText && (
          <>
            {" "}
            <Link href={link} className="text-cyan-400 hover:underline text-xs">
              {linkText}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

/* ---- Category Comparison Table ---- */
function CategoryTable({
  categories,
  originCostId,
  origin,
  saudi,
  lang,
  r,
  getCategoryComparison,
}: {
  categories: CostCategory[];
  originCostId: CityId | null;
  origin: { name_en: string; name_ar: string; currency: string; currencySymbol: string };
  saudi: { name_en: string; name_ar: string };
  /* saudiCostId used internally by getCategoryComparison */
  lang: string;
  r: { thItem: string; thOriginPrice: string; thSaudiPrice: string; thInSar: string; thDiff: string; cheaper: string; pricier: string; vsCity: string };
  getCategoryComparison: (cats: CostCategory[]) => {
    item: CostItem;
    originPrice: number;
    saudiPrice: number;
    originInSar: number;
    diffPct: number;
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

  const originLabel = lang === "ar" ? origin.name_ar : origin.name_en;
  const saudiLabel = lang === "ar" ? saudi.name_ar : saudi.name_en;
  const catNames = categories
    .map((c) => COST_CATEGORIES[c]?.name_en || c)
    .join(" & ");

  return (
    <div className="bg-bg-card/60 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02]">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
          {catNames}
        </span>
        <span className="text-xs text-text-muted ml-2">
          — {originLabel} {r.vsCity} {saudiLabel}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="text-left py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium">
                {r.thItem}
              </th>
              <th className="text-right py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium whitespace-nowrap">
                {r.thOriginPrice
                  .replace("{city}", originLabel)
                  .replace("{currency}", origin.currency)}
              </th>
              <th className="text-right py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium whitespace-nowrap">
                {r.thSaudiPrice
                  .replace("{city}", saudiLabel)
                  .replace("{currency}", "SAR")}
              </th>
              <th className="text-right py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium">
                {r.thInSar}
              </th>
              <th className="text-right py-2.5 px-4 text-xs text-text-muted uppercase tracking-wider font-medium">
                {r.thDiff}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.item.id}
                className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
              >
                <td className="py-2 px-4 text-text-secondary">
                  {lang === "ar" ? row.item.name_ar : row.item.name_en}
                  {row.item.trend && row.item.trend !== "stable" && (
                    <span
                      className={`ml-1 text-[10px] ${row.item.trend === "up" ? "text-red-400" : "text-green-400"}`}
                    >
                      {row.item.trend === "up" ? "\u25B2" : "\u25BC"}
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 text-right font-mono text-text-primary whitespace-nowrap">
                  {origin.currencySymbol}
                  {row.originPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-4 text-right font-mono text-text-primary whitespace-nowrap">
                  {row.saudiPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })} SAR
                </td>
                <td className="py-2 px-4 text-right font-mono text-text-muted whitespace-nowrap">
                  {fmtN(row.originInSar)} SAR
                </td>
                <td
                  className={`py-2 px-4 text-right font-mono whitespace-nowrap ${
                    row.diffPct < 0 ? "text-green-400" : row.diffPct > 0 ? "text-red-400" : "text-text-muted"
                  }`}
                >
                  {row.diffPct > 0 ? "+" : ""}
                  {row.diffPct}%{" "}
                  {row.diffPct < -5 ? "\u25BC" : row.diffPct > 5 ? "\u25B2" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
