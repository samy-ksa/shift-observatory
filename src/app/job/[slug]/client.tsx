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
  riskColor,
  riskBg,
  wefTrendLabel,
  wefTrendLabelAr,
  wefTrendLabelFr,
  fmt,
} from "@/lib/occupations";

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
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
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
    <div className="flex items-center gap-3 flex-1">
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
/* Share buttons                                                       */
/* ------------------------------------------------------------------ */
function ShareButtons({
  occ,
  t,
  lang,
}: {
  occ: Occupation;
  t: ReturnType<typeof useLang>["t"];
  lang: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.ksashiftobservatory.online/job/${toSlug(occ.name_en)}`;
  const occName = lang === "ar" ? occ.name_ar : lang === "fr" ? occ.name_fr : occ.name_en;
  const text = t.jobPage.shareText
    .replace("{name}", occName)
    .replace("{score}", String(occ.composite));

  const shareUrl = (base: string) =>
    `${base}${encodeURIComponent(text + " " + url)}`;

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-medium rounded transition-colors"
      >
        LinkedIn
      </a>
      <a
        href={shareUrl("https://twitter.com/intent/tweet?text=")}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors"
      >
        X / Twitter
      </a>
      <a
        href={shareUrl("https://wa.me/?text=")}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-medium rounded transition-colors"
      >
        WhatsApp
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded border border-gray-700 transition-colors"
      >
        {copied ? t.jobPage.copied : t.jobPage.copyLink}
      </button>
    </div>
  );
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
          <ScoreGauge score={occ.composite} />
        </section>

        {/* ── Tab navigation ── */}
        <div className="border-b border-gray-800 flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
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
            </div>
          )}

          {/* Salary tab */}
          {activeTab === "salary" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                {jp.salaryRange}
              </h3>

              <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-end mb-6">
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
          <ShareButtons occ={occ} t={t} lang={lang} />
        </section>

        {/* ── Related occupations ── */}
        <section className="border-t border-gray-800 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {jp.relatedTitle}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link
                key={r.name_en}
                href={`/job/${toSlug(r.name_en)}`}
                className="block bg-[#0D1117] border border-gray-800 rounded-lg p-4 hover:border-cyan-500/40 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                      {lang === "ar" ? r.name_ar : lang === "fr" ? r.name_fr : r.name_en}
                    </div>
                    <div
                      className="text-xs text-gray-500 truncate mt-0.5"
                      dir={lang === "ar" ? "ltr" : "rtl"}
                    >
                      {lang === "ar" ? r.name_en : r.name_ar}
                    </div>
                  </div>
                  <span
                    className={`ml-3 text-lg font-mono font-bold ${riskColor(r.composite)}`}
                  >
                    {r.composite}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

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
