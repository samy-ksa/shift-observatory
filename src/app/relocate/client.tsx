"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";
import LangToggle from "@/components/ui/LangToggle";
import {
  ORIGIN_CITIES,
  SAUDI_CITIES,
  SCHOOL_TIERS,
  calculateRelocation,
} from "@/data/relocation-data";
import type {
  HousingType,
  RelocationResult,
} from "@/data/relocation-data";
import { getAllOccupations, toSlug, riskColor, fmt } from "@/lib/occupations";
import type { Occupation } from "@/lib/occupations";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const allOccupations = getAllOccupations();

function fmtLocal(n: number, sym: string) {
  return sym + fmt(Math.abs(Math.round(n)));
}
function fmtSar(n: number) {
  return fmt(Math.round(n)) + " SAR";
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

  const origin = ORIGIN_CITIES.find((c) => c.id === originId)!;
  const saudi = SAUDI_CITIES.find((c) => c.id === saudiId)!;
  const schoolTier = SCHOOL_TIERS.find((s) => s.id === schoolTierId)!;
  const salaryNum = parseInt(salaryStr.replace(/[^0-9]/g, ""), 10) || 0;

  /* Occupation search filter */
  const filteredOccs = useMemo(() => {
    if (!occSearch.trim()) return allOccupations.slice(0, 20);
    const q = occSearch.toLowerCase();
    return allOccupations.filter(
      (o) =>
        o.name_en.toLowerCase().includes(q) ||
        o.name_ar.includes(q)
    ).slice(0, 20);
  }, [occSearch]);

  /* Calculate */
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
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleReset = () => {
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---- Occupation salary cross-ref ---- */
  const occSalaryNote = useMemo(() => {
    if (!selectedOcc) return null;
    const name = lang === "ar" ? selectedOcc.name_ar : selectedOcc.name_en;
    return {
      name,
      entry: fmt(selectedOcc.salary_entry_sar),
      senior: fmt(selectedOcc.salary_senior_sar),
      median: fmt(selectedOcc.salary_median_sar),
      composite: selectedOcc.composite,
      slug: toSlug(selectedOcc.name_en),
    };
  }, [selectedOcc, lang]);

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
        ? `${fmt(selectedOcc.salary_entry_sar)}-${fmt(selectedOcc.salary_senior_sar)} SAR`
        : "8,000-45,000 SAR";
      tips.push(r.tipEmergingMarket.replace("{range}", range));
    }
    return tips;
  }, [result, children, origin, selectedOcc, r]);

  /* ---- Bar chart data ---- */
  const barData = useMemo(() => {
    if (!result) return [];
    const cats = [
      { label: r.rent, origin: result.origin_costs.rent * origin.rateToSar, saudi: result.saudi_costs.rent },
      { label: r.food, origin: result.origin_costs.food * origin.rateToSar, saudi: result.saudi_costs.food },
      { label: r.transport, origin: result.origin_costs.transport * origin.rateToSar, saudi: result.saudi_costs.transport },
      { label: r.utilities, origin: result.origin_costs.utilities * origin.rateToSar, saudi: result.saudi_costs.utilities },
      { label: r.dining, origin: result.origin_costs.dining * origin.rateToSar, saudi: result.saudi_costs.dining },
    ];
    if (result.saudi_costs.school > 0) {
      cats.push({ label: r.school, origin: 0, saudi: result.saudi_costs.school });
    }
    const max = Math.max(...cats.flatMap((c) => [c.origin, c.saudi]));
    return cats.map((c) => ({ ...c, max }));
  }, [result, origin, r]);

  /* ================================================================ */
  /* RENDER                                                             */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-bg-primary" dir={dir}>
      <LangToggle />

      {/* ---- Header ---- */}
      <header className="max-w-5xl mx-auto px-4 pt-8 pb-2">
        <Link href="/" className="text-text-muted text-sm hover:text-text-secondary transition-colors">
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

      {/* ================================================================ */}
      {/* FORM                                                              */}
      {/* ================================================================ */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-bg-card/60 border border-white/10 rounded-xl overflow-hidden">
          {/* ---- YOUR CURRENT SITUATION ---- */}
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

              {/* Occupation */}
              <div className="relative">
                <label className="text-sm text-text-muted mb-1.5 block">{r.myOccupation}</label>
                <input
                  type="text"
                  value={occSearch}
                  onChange={(e) => { setOccSearch(e.target.value); setOccDropOpen(true); }}
                  onFocus={() => setOccDropOpen(true)}
                  placeholder={r.selectOccupation}
                  className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-text-primary text-sm focus:border-cyan-400 focus:outline-none"
                />
                {occDropOpen && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-bg-card border border-white/10 rounded-lg max-h-60 overflow-y-auto shadow-xl">
                    {filteredOccs.map((o) => (
                      <button
                        key={o.name_en}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center justify-between"
                        onClick={() => {
                          setSelectedOcc(o);
                          setOccSearch(lang === "ar" ? o.name_ar : o.name_en);
                          setOccDropOpen(false);
                        }}
                      >
                        <span className="text-text-primary">
                          {lang === "ar" ? o.name_ar : o.name_en}
                        </span>
                        <span className={`text-xs font-mono ${riskColor(o.composite)}`}>
                          {o.composite}/100
                        </span>
                      </button>
                    ))}
                    {filteredOccs.length === 0 && (
                      <div className="px-4 py-3 text-sm text-text-muted">No results</div>
                    )}
                  </div>
                )}
                {/* SHIFT salary cross-ref */}
                {occSalaryNote && (
                  <p className="text-xs text-cyan-400/80 mt-1.5 font-mono">
                    {r.shiftDataShows.replace("{occupation}", occSalaryNote.name)}{" "}
                    {r.salaryRange.replace("{entry}", occSalaryNote.entry).replace("{senior}", occSalaryNote.senior)}{" "}
                    ({r.median.replace("{median}", occSalaryNote.median)})
                  </p>
                )}
              </div>

              {/* Family */}
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">{r.family}</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg">-</button>
                    <span className="w-6 text-center font-mono text-text-primary">{adults}</span>
                    <button onClick={() => setAdults(Math.min(4, adults + 1))} className="w-8 h-8 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg">+</button>
                    <span className="text-xs text-text-muted">{r.adults}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg">-</button>
                    <span className="w-6 text-center font-mono text-text-primary">{children}</span>
                    <button onClick={() => setChildren(Math.min(6, children + 1))} className="w-8 h-8 rounded border border-white/10 text-text-muted hover:bg-white/5 text-lg">+</button>
                    <span className="text-xs text-text-muted">{r.children}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- SAUDI ARABIA OPTIONS ---- */}
          <div className="p-5 md:p-6">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-5">
              {r.saudiOptions}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Target city */}
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

              {/* Housing type */}
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

              {/* School tier */}
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
                      {s.monthly_sar > 0 ? ` — ${fmt(s.monthly_sar)} SAR${r.perMonth}` : ""}
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

      {/* ================================================================ */}
      {/* RESULTS                                                           */}
      {/* ================================================================ */}
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

          {/* ---- Side-by-side comparison ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/10 rounded-xl overflow-hidden">
            {/* Origin column */}
            <div className="bg-bg-card/40 p-5 md:p-6 border-b md:border-b-0 md:border-r border-white/10">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {lang === "ar" ? origin.name_ar : origin.name_en}
              </h3>

              {/* Income */}
              <div className="space-y-1 mb-5">
                <Row label={`${r.gross}:`} value={fmtLocal(result.gross_local, origin.currencySymbol) + r.perMonth} />
                <Row label={`${r.tax}: -${origin.taxRate}%`} value={`(${fmtLocal(result.tax_local, origin.currencySymbol)})`} className="text-red-400" />
                <Row label={`${r.net}:`} value={fmtLocal(result.net_local, origin.currencySymbol) + r.perMonth} className="text-text-primary font-bold" />
              </div>

              {/* Monthly costs */}
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
                <Row
                  label={`${r.savings}:`}
                  value={fmtLocal(result.origin_savings_local, origin.currencySymbol) + r.perMonth}
                  className={result.origin_savings_local >= 0 ? "text-emerald-400" : "text-red-400"}
                />
              </div>
            </div>

            {/* Saudi column */}
            <div className="bg-bg-card/60 p-5 md:p-6">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {lang === "ar" ? saudi.name_ar : saudi.name_en}
              </h3>

              {/* Income */}
              <div className="space-y-1 mb-5">
                <Row label={`Equivalent:`} value={fmtSar(result.gross_sar) + r.perMonth} />
                <Row label={`${r.tax}: 0%`} value={`(0 SAR)`} className="text-emerald-400" />
                <Row label={`${r.net}:`} value={fmtSar(result.net_sar) + r.perMonth} className="text-cyan-400 font-bold" />
              </div>

              {/* Monthly costs */}
              <h4 className="text-xs text-text-muted uppercase tracking-wider mb-3">{r.monthlyCosts}</h4>
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

          {/* ---- KEY INSIGHTS ---- */}
          <div className="mt-6 bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-5">
              {r.keyInsights}
            </h3>

            <div className="space-y-4 text-sm">
              {/* Tax savings */}
              <InsightRow
                icon="$"
                label={r.taxSavings}
                text={`+${fmtSar(result.tax_savings_sar)}${r.perMonth} (${fmtLocal(result.tax_savings_local, origin.currencySymbol)} ${r.taxSaved})`}
                color="text-emerald-400"
              />

              {/* Rent diff */}
              <InsightRow
                icon="H"
                label={r.rentLabel}
                text={`${housing === "compound" ? r.housingCompound : r.housingApt}: ${fmtSar(result.saudi_costs.rent)} vs ${fmtLocal(result.origin_costs.rent, origin.currencySymbol)} = ${result.rent_diff_pct > 0 ? "+" : ""}${result.rent_diff_pct}% ${result.rent_diff_pct > 0 ? r.moreExpensive : r.lessExpensive}`}
                color={result.rent_diff_pct > 0 ? "text-amber-400" : "text-emerald-400"}
              />

              {/* Schooling */}
              {children > 0 && (
                <InsightRow
                  icon="S"
                  label={r.schooling}
                  text={`~${fmtSar(result.school_cost_sar)}${r.perMonth}${origin.schoolFree ? ` (${r.freeInOrigin} ${lang === "ar" ? origin.name_ar : origin.name_en})` : ""}`}
                  color="text-amber-400"
                />
              )}

              {/* Mercer */}
              <InsightRow
                icon="M"
                label={r.mercer}
                text={`${lang === "ar" ? saudi.name_ar : saudi.name_en} #${saudi.mercerRank} vs ${lang === "ar" ? origin.name_ar : origin.name_en} #${origin.mercerRank} (${saudi.mercerRank > origin.mercerRank ? r.mercerCheaper : r.mercerPricier})`}
                color="text-blue-400"
              />

              {/* EOSB */}
              <InsightRow
                icon="B"
                label={r.eosb}
                text={`~${fmtSar(result.eosb_5yr_sar)} ${r.eosbAfter5yr}`}
                color="text-purple-400"
              />

              {/* AI Risk */}
              {occSalaryNote && (
                <InsightRow
                  icon="!"
                  label={r.aiRisk}
                  text={`${occSalaryNote.name}: ${occSalaryNote.composite}/100`}
                  color={riskColor(occSalaryNote.composite)}
                  link={`/job/${occSalaryNote.slug}`}
                  linkText={occSalaryNote.composite >= 45 ? r.considerTransition + " →" : undefined}
                />
              )}

              {/* Net verdict */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  {r.netVerdict}
                </h4>
                <p className="text-text-secondary leading-relaxed">
                  {r.verdictNeed} <span className="font-mono text-cyan-400 font-bold">{fmtSar(result.saudi_total_sar)}{r.perMonth}</span>.{" "}
                  {origin.taxRate > 0 && (
                    <>
                      {r.verdictSavings} <span className="font-mono text-emerald-400 font-bold">{fmtLocal(result.tax_savings_local, origin.currencySymbol)}{r.perMonth}</span>
                      {children > 0 && result.school_cost_sar > 0 ? ` — offset by schooling (${fmtSar(result.school_cost_sar)}) and ${housing === "compound" ? "compound" : "apartment"} housing costs.` : "."}
                    </>
                  )}
                </p>
              </div>

              {/* Negotiation tips */}
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

          {/* ---- COMPARISON BAR CHART ---- */}
          <div className="mt-6 bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-5">
              {r.comparisonChart}
            </h3>

            <div className="space-y-4">
              {barData.map((bar) => {
                const originPct = bar.max > 0 ? (bar.origin / bar.max) * 100 : 0;
                const saudiPct = bar.max > 0 ? (bar.saudi / bar.max) * 100 : 0;
                return (
                  <div key={bar.label}>
                    <div className="text-xs text-text-muted mb-1 font-medium">{bar.label}</div>
                    {/* Origin bar */}
                    <div className="flex items-center gap-3 mb-1">
                      <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                        <div
                          className="h-full bg-amber-400/60 rounded transition-all duration-500"
                          style={{ width: `${Math.max(originPct, 1)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-amber-400 w-28 text-right flex-shrink-0">
                        {lang === "ar" ? origin.name_ar : origin.name_en}: {fmtLocal(bar.origin / origin.rateToSar, origin.currencySymbol)}
                      </span>
                    </div>
                    {/* Saudi bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                        <div
                          className="h-full bg-cyan-400/60 rounded transition-all duration-500"
                          style={{ width: `${Math.max(saudiPct, 1)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-cyan-400 w-28 text-right flex-shrink-0">
                        {lang === "ar" ? saudi.name_ar : saudi.name_en}: {fmtSar(bar.saudi)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- Disclaimer ---- */}
          <p className="text-xs text-text-muted mt-6 max-w-3xl">{r.disclaimer}</p>

          {/* ---- Actions ---- */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5 transition-colors text-sm"
            >
              {r.tryAnother}
            </button>
          </div>
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
      <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-white/5 ${color} flex-shrink-0 mt-0.5`}>
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
