"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";
import FindJobTab from "@/components/job/FindJobTab";
import {
  type Occupation,
  type Sector,
  toSlug,
  riskLabel,
  riskLabelAr,
  riskLabelFr,
  riskBg,
  wefTrendLabel,
  wefTrendLabelAr,
  wefTrendLabelFr,
  fmt,
} from "@/lib/occupations";
import { getScoreHistory, getScoreTrend } from "@/data/score-history";
import ShareBar from "@/components/shared/ShareBar";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
interface TaweenDecision {
  profession: string;
  quota_pct: number;
  phase: string;
  effective: string;
  note: string;
}

interface Props {
  occupation: Occupation | null;
  related: Occupation[];
  sector: Sector | null;
  tawteen: TaweenDecision[];
  reserved: boolean;
}

/* ------------------------------------------------------------------ */
/* Score gauge component                                               */
/* ------------------------------------------------------------------ */
function ScoreGauge({ score }: { score: number }) {
  const pct = score / 100;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ * (1 - pct);

  const color =
    score >= 70
      ? "#DC2626"
      : score >= 45
        ? "#D97706"
        : score >= 25
          ? "#EAB308"
          : "#22C55E";

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" role="img" aria-label={`AI automation risk score: ${score} out of 100`}>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#1F2937"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-bold font-mono"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline progress bar                                                 */
/* ------------------------------------------------------------------ */
function InlineBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    value >= 70
      ? "bg-red-500"
      : value >= 45
        ? "bg-orange-500"
        : value >= 25
          ? "bg-yellow-500"
          : "bg-green-500";

  return (
    <div className="flex items-center gap-3 flex-1" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={`Score: ${value} out of ${max}`}>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-mono text-gray-300 w-12 text-right">
        {typeof value === "number" && value <= 1
          ? `${(value * 100).toFixed(0)}%`
          : value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Share block                                                         */
/* ------------------------------------------------------------------ */
function ShareBlock({ occ }: { occ: Occupation }) {
  const { t, lang } = useLang();
  const url = `https://www.ksashiftobservatory.online/job/${toSlug(occ.name_en)}`;
  const occName = lang === "ar" ? occ.name_ar : lang === "fr" ? occ.name_fr : occ.name_en;
  const text = t.jobPage.shareText
    .replace("{name}", occName)
    .replace("{score}", String(occ.composite));

  return <ShareBar url={url} text={text} />;
}

/* ================================================================== */
/* Main client component                                               */
/* ================================================================== */
export default function JobPageClient({
  occupation: occ,
  related,
  sector,
  tawteen,
  reserved,
}: Props) {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<
    "aiRisk" | "salary" | "nitaqat" | "reskilling" | "findJob"
  >("aiRisk");
  const dir = lang === "ar" ? "rtl" : "ltr";
  const jp = t.jobPage;

  /* ---- Not found state ---- */
  if (!occ) {
    return (
      <div
        className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center"
        dir={dir}
      >
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{jp.notFound}</h1>
          <p className="text-gray-400">{jp.notFoundSub}</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-cyan-500 text-black font-medium rounded-md hover:bg-cyan-400 transition-colors"
          >
            {jp.backToDashboard}
          </Link>
        </div>
      </div>
    );
  }

  const history = occ ? getScoreHistory(toSlug(occ.name_en), occ.composite) : [];
  const trend = occ ? getScoreTrend(toSlug(occ.name_en), occ.composite) : null;

  const rl = lang === "ar" ? riskLabelAr(occ.composite) : lang === "fr" ? riskLabelFr(occ.composite) : riskLabel(occ.composite);
  const sectorName = sector
    ? lang === "ar"
      ? sector.name_ar
      : lang === "fr"
        ? sector.name_fr
        : sector.name_en
    : occ.sector_id;
  const catLabel =
    occ.category === "substitution" ? jp.substitution : jp.augmentation;
  const wefLabel =
    lang === "ar"
      ? wefTrendLabelAr(occ.wef_trend)
      : lang === "fr"
        ? wefTrendLabelFr(occ.wef_trend)
        : wefTrendLabel(occ.wef_trend);

  const tabs = [
    { key: "aiRisk" as const, label: jp.tabs.aiRisk },
    { key: "salary" as const, label: jp.tabs.salary },
    { key: "nitaqat" as const, label: jp.tabs.nitaqat },
    { key: "reskilling" as const, label: jp.tabs.reskilling },
    { key: "findJob" as const, label: jp.tabs.findJob },
  ];

  /* ---- Verdict text ---- */
  const verdict =
    occ.composite >= 70
      ? jp.verdictVeryHigh
      : occ.composite >= 45
        ? jp.verdictHigh
        : occ.composite >= 25
          ? jp.verdictModerate
          : jp.verdictLow;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary" dir={dir}>
      {/* ── Top bar ── */}
      <div className="border-b border-gray-800 bg-[#0A0E17]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between text-sm">
          <Link
            href="/"
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            {jp.backToDashboard}
          </Link>
          <nav className="text-gray-500 text-xs">
            <Link href="/" className="hover:text-gray-300">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-400">{jp.breadcrumbJobs}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-200">{lang === "ar" ? occ.name_ar : lang === "fr" ? occ.name_fr : occ.name_en}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ── Hero section ── */}
        <section className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {lang === "ar" ? occ.name_ar : lang === "fr" ? occ.name_fr : occ.name_en}
            </h1>
            {lang !== "ar" && (
              <h2 className="text-lg text-gray-400 mt-1 font-medium" dir="rtl">
                {occ.name_ar}
              </h2>
            )}
            {lang === "ar" && (
              <h2 className="text-lg text-gray-400 mt-1 font-medium">
                {occ.name_en}
              </h2>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {/* Risk badge */}
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded ${riskBg(occ.composite)} text-black`}
              >
                {rl}
              </span>
              {/* Category */}
              <span className="px-2.5 py-1 text-xs font-medium rounded bg-gray-800 text-gray-300 border border-gray-700">
                {catLabel}
              </span>
              {/* WEF */}
              <span className="px-2.5 py-1 text-xs font-medium rounded bg-gray-800 text-cyan-400 border border-gray-700">
                {wefLabel}
              </span>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {jp.workforce}
                </div>
                <div className="text-lg font-mono text-white mt-0.5">
                  {fmt(occ.employment_est)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {jp.saudiPct}
                </div>
                <div className="text-lg font-mono text-white mt-0.5">
                  {occ.employment_saudi_pct}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {jp.sector}
                </div>
                <div className="text-sm text-gray-300 mt-0.5">
                  {sectorName}
                </div>
              </div>
            </div>
          </div>

          {/* Score gauge */}
          <div className="text-center md:text-left flex justify-center md:justify-start">
            <ScoreGauge score={occ.composite} />
          </div>
        </section>

        {/* ── Tab navigation ── */}
        <div className="border-b border-gray-800 flex gap-0 overflow-x-auto mobile-scroll">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 min-h-10 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="min-h-[300px]">
          {/* AI Risk tab */}
          {activeTab === "aiRisk" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                {jp.aiRiskAnalysis}
              </h3>

              {/* Score breakdown */}
              <div className="bg-[#0D1117] border border-gray-800 rounded-lg divide-y divide-gray-800">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-400">
                    {jp.automationProb}
                  </span>
                  <InlineBar value={occ.frey_osborne} />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-400">
                    {jp.gptExposure}
                  </span>
                  <InlineBar value={occ.eloundou * 100} />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-400">
                    {jp.feltenScore}
                  </span>
                  <div className="flex-1 flex justify-end">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        occ.felten === "very_high" || occ.felten === "high"
                          ? "bg-red-500/20 text-red-400"
                          : occ.felten === "moderate"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {(occ.felten || "N/A").replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="border-l-4 border-cyan-500 bg-cyan-500/5 px-4 py-3 rounded-r-lg">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {verdict}
                </p>
              </div>

              {/* Score Evolution */}
              <div className="border border-gray-800/50 rounded-md bg-gray-900/50 p-4 mt-4">
                <h4 className="text-xs uppercase tracking-widest text-cyan-400 border-l-2 border-cyan-500 pl-3 mb-4">
                  {t.jobPage.scoreEvolution}
                </h4>

                {/* Simple text-based sparkline (no Recharts dependency) */}
                <div className="flex items-end gap-1 h-16 mb-3">
                  {history.map((h) => {
                    const minScore = Math.min(...history.map(x => x.composite));
                    const maxScore = Math.max(...history.map(x => x.composite));
                    const range = maxScore - minScore || 1;
                    const heightPct = 30 + ((h.composite - minScore) / range) * 70;
                    return (
                      <div key={h.quarter} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-cyan-400">{h.composite}</span>
                        <div className="w-full flex justify-center">
                          <div
                            className="w-8 rounded-t bg-cyan-500/30 border border-cyan-500/50"
                            style={{ height: `${heightPct}%`, minHeight: '8px' }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500">{h.quarter}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Trend summary */}
                <div className="mt-3 text-sm">
                  {trend && trend.direction === "up" && (
                    <p className="text-red-400">
                      ▲ +{trend.delta} {t.jobPage.pointsSince} Q4-2025 · <span className="text-red-300 font-medium">{t.jobPage.riskIncreasing}</span>
                    </p>
                  )}
                  {trend && trend.direction === "down" && (
                    <p className="text-green-400">
                      ▼ {trend.delta} {t.jobPage.pointsSince} Q4-2025 · <span className="text-green-300 font-medium">{t.jobPage.riskDecreasing}</span>
                    </p>
                  )}
                  {trend && trend.direction === "stable" && (
                    <p className="text-gray-400">
                      ━ {t.jobPage.riskStable} {lang === "en" ? "since" : lang === "fr" ? "depuis" : "منذ"} Q4-2025
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-600 mt-2">{t.jobPage.nextUpdate}</p>
              </div>
            </div>
          )}

          {/* Salary tab */}
          {activeTab === "salary" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                {jp.salaryRange}
              </h3>

              <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6">
                  {[
                    { label: jp.entry, value: occ.salary_entry_sar },
                    { label: jp.median, value: occ.salary_median_sar },
                    { label: jp.senior, value: occ.salary_senior_sar },
                  ].map((s) => (
                    <div key={s.label} className="text-center flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {s.label}
                      </div>
                      <div className="text-xl font-mono text-white">
                        {fmt(s.value)}
                      </div>
                      <div className="text-xs text-gray-500">
                        SAR{jp.perMonth}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visual bar */}
                <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                    style={{
                      left: `${(occ.salary_entry_sar / 60000) * 100}%`,
                      width: `${((occ.salary_senior_sar - occ.salary_entry_sar) / 60000) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>0</span>
                  <span>SAR 60,000</span>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                {jp.salarySource}: {occ.salary_source}
              </p>
            </div>
          )}

          {/* Nitaqat tab */}
          {activeTab === "nitaqat" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                {jp.nitaqatStatus}
              </h3>

              {/* Status badge */}
              <div
                className={`p-4 rounded-lg border ${
                  occ.nitaqat_status === "reserved_saudi_only"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-gray-800/50 border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      occ.nitaqat_status === "reserved_saudi_only"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-white">
                    {occ.nitaqat_status === "reserved_saudi_only"
                      ? jp.reservedSaudiOnly
                      : jp.sectorQuota}
                  </span>
                </div>
                {reserved && (
                  <p className="text-sm text-red-400 mt-2">
                    {jp.reservedWarning}
                  </p>
                )}
              </div>

              {/* Tawteen decisions */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  {jp.relevantTawteen}
                </h4>
                {tawteen.length > 0 ? (
                  <div className="bg-[#0D1117] border border-gray-800 rounded-lg divide-y divide-gray-800">
                    {tawteen.map((td, i) => (
                      <div key={i} className="px-4 py-3 space-y-1">
                        <div className="text-sm text-white font-medium">
                          {td.profession}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>
                            {jp.quota}: {td.quota_pct}%
                          </span>
                          <span>
                            {jp.effective}: {td.effective}
                          </span>
                          <span>
                            {jp.phase}: {td.phase}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{jp.noTawteen}</p>
                )}
              </div>
            </div>
          )}

          {/* Reskilling tab */}
          {activeTab === "reskilling" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                {jp.hrdfPrograms}
              </h3>

              {occ.hrdf_programs && occ.hrdf_programs.length > 0 ? (
                <div className="grid gap-3">
                  {occ.hrdf_programs.map((p, i) => (
                    <div
                      key={i}
                      className="bg-[#0D1117] border border-gray-800 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-white">
                            {p.name}
                          </h4>
                          <span
                            className="text-xs text-gray-500 mt-0.5 block"
                            dir="rtl"
                          >
                            {p.name_ar}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {p.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        {p.relevance}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{jp.noPrograms}</p>
              )}
            </div>
          )}

          {/* Find this Job tab */}
          {activeTab === "findJob" && <FindJobTab occ={occ} />}
        </div>

        {/* ── Share section ── */}
        <section className="border-t border-gray-800 pt-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            {jp.shareTitle}
          </h3>
          <ShareBlock occ={occ} />
        </section>

        {/* ── Explore More ── */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <h3 className="text-sm uppercase tracking-widest text-cyan-400 font-semibold mb-4">
            {t.links.exploreMore}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <a href="/relocate" className="border border-gray-800/50 rounded-md p-3 hover:bg-gray-800/30 transition-colors block">
              <div className="text-white text-sm font-medium">{t.links.relocationCalculator}</div>
              <div className="text-gray-500 text-xs mt-1">{t.links.relocationCalcDesc}</div>
            </a>
            <a href="/prepare" className="border border-gray-800/50 rounded-md p-3 hover:bg-gray-800/30 transition-colors block">
              <div className="text-white text-sm font-medium">{t.links.checklistDepart}</div>
              <div className="text-gray-500 text-xs mt-1">{t.links.checklistDesc}</div>
            </a>
            <a href="/career" className="border border-gray-800/50 rounded-md p-3 hover:bg-gray-800/30 transition-colors block">
              <div className="text-white text-sm font-medium">{t.links.careerRecommender}</div>
              <div className="text-gray-500 text-xs mt-1">{t.links.careerDesc}</div>
            </a>
          </div>

          {/* Related occupations */}
          <h4 className="text-sm text-gray-400 mt-6 mb-3">{t.links.relatedOccupations}</h4>
          <div className="flex flex-wrap gap-2">
            {related.slice(0, 5).map((job) => (
              <a
                key={toSlug(job.name_en)}
                href={`/job/${toSlug(job.name_en)}`}
                className="text-xs border border-gray-800/50 rounded px-3 py-1.5 text-gray-300 hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
              >
                {lang === "ar" ? job.name_ar : lang === "fr" ? (job.name_fr || job.name_en) : job.name_en} — {job.composite}/100
              </a>
            ))}
          </div>
        </div>

        {/* ── Compare CTA ── */}
        <section className="border-t border-gray-800 pt-6 pb-12 text-center">
          <Link
            href="/career"
            className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-md transition-colors"
          >
            {jp.compareCta}
          </Link>
        </section>
      </main>
    </div>
  );
}
