"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/context";
import { type Occupation, fmt } from "@/lib/occupations";
import {
  JOB_REQUIREMENTS,
  getCategoryForSector,
  type OccupationCategory,
} from "@/data/job-requirements";
import masterData from "@/data/master.json";

/* ------------------------------------------------------------------ */
/* Employer type                                                       */
/* ------------------------------------------------------------------ */
interface Employer {
  name: string;
  sector: string;
  sector_ar?: string;
  employees: number;
}

const allEmployers = (masterData as Record<string, unknown>)
  .top_employers as Employer[];

/* ------------------------------------------------------------------ */
/* Sector → employer matching                                          */
/* ------------------------------------------------------------------ */
const SECTOR_EMPLOYER_MAP: Record<OccupationCategory, string[]> = {
  healthcare: ["Healthcare", "Health"],
  engineering: ["Construction", "Engineering", "Oil & Gas", "Manufacturing", "Energy", "Utilities"],
  finance: ["Banking", "Finance", "Insurance", "Financial"],
  it: ["Technology", "IT", "Telecom", "Telecommunications"],
  construction: ["Construction", "Infrastructure", "Real Estate"],
  sales_marketing: ["Retail", "FMCG", "Consumer", "Marketing", "Wholesale"],
  education: ["Education", "Training", "University"],
  legal: ["Professional Services", "Consulting", "Legal"],
  hospitality: ["Hospitality", "Tourism", "Food", "Entertainment", "Catering"],
  admin: ["Conglomerate", "Services", "Staffing", "HR"],
  logistics: ["Logistics", "Transport", "Shipping", "Delivery", "Supply Chain"],
  security: ["Security", "Defense", "Military", "Safety"],
};

function getRelevantEmployers(cat: OccupationCategory): Employer[] {
  const keywords = SECTOR_EMPLOYER_MAP[cat] || [];
  const matched = allEmployers.filter((e) =>
    keywords.some((k) => e.sector.toLowerCase().includes(k.toLowerCase()))
  );
  // If no match, return largest employers as fallback
  return (matched.length > 0 ? matched : allEmployers).slice(0, 5);
}

/* ------------------------------------------------------------------ */
/* Job boards                                                          */
/* ------------------------------------------------------------------ */
function getJobBoards(nameEn: string) {
  const q = encodeURIComponent(nameEn);
  return [
    { name: "LinkedIn Jobs", url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=Saudi%20Arabia` },
    { name: "Jadarat (\u062C\u062F\u0627\u0631\u0627\u062A)", url: "https://jadarat.sa", note: "Official Saudi government portal" },
    { name: "Bayt.com", url: `https://www.bayt.com/en/saudi-arabia/jobs/?keyword=${q}` },
    { name: "GulfTalent", url: `https://www.gulftalent.com/jobs/saudi-arabia?keyword=${q}` },
    { name: "Naukrigulf", url: `https://www.naukrigulf.com/jobs-in-saudi-arabia?keyword=${q}` },
  ];
}

/* ------------------------------------------------------------------ */
/* Demand badge                                                        */
/* ------------------------------------------------------------------ */
function DemandBadge({ occ, fj }: { occ: Occupation; fj: ReturnType<typeof useLang>["t"]["findJob"] }) {
  const trend = occ.wef_trend || "";
  let label: string;
  let cls: string;

  if (trend.includes("growth_rapid") || trend.includes("growth_organic")) {
    label = fj.demandHigh;
    cls = "bg-green-500/15 text-green-400 border-green-500/30";
  } else if (trend.includes("growth")) {
    label = fj.demandGrowing;
    cls = "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  } else if (trend === "stable") {
    label = fj.demandStable;
    cls = "bg-gray-500/15 text-gray-400 border-gray-500/30";
  } else {
    label = fj.demandDeclining;
    cls = "bg-orange-500/15 text-orange-400 border-orange-500/30";
  }

  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded border ${cls}`}>
      {label}
    </span>
  );
}

/* ================================================================== */
/* Main component                                                      */
/* ================================================================== */
export default function FindJobTab({ occ }: { occ: Occupation }) {
  const { t, lang } = useLang();
  const fj = t.findJob;
  const isAr = lang === "ar";

  const cat = getCategoryForSector(occ.sector_id);
  const reqs = JOB_REQUIREMENTS[cat];
  const employers = getRelevantEmployers(cat);
  const jobBoards = getJobBoards(occ.name_en);

  /* -- Section header helper -- */
  const SH = ({ title }: { title: string }) => (
    <div className="border-l-2 border-cyan-500 pl-3 mb-4">
      <h4 className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
        {title}
      </h4>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* ═══════════ BLOCK 1: REQUIREMENTS ═══════════ */}
      <div>
        <SH title={fj.requirements} />

        {/* Degree */}
        <div className="border border-gray-800/50 rounded-md bg-gray-900/50 p-4 mb-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {fj.degree}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {isAr ? reqs.degree.ar : reqs.degree.en}
          </p>
        </div>

        {/* Certifications */}
        <div className="border border-gray-800/50 rounded-md bg-gray-900/50 p-4 mb-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            {fj.certifications}
          </div>
          <div className="space-y-2">
            {reqs.certifications.map((c) => (
              <div
                key={c.name}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-1.5 border-b border-gray-800/30 last:border-0"
              >
                <span className="text-sm text-white font-medium flex-1">
                  {c.name}
                </span>
                <span className="text-xs text-gray-500">{c.body}</span>
                <span className="text-xs text-gray-600 italic">{c.timeline}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="border border-gray-800/50 rounded-md bg-gray-900/50 p-4 mb-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            {fj.skills}
          </div>
          <div className="flex flex-wrap gap-2">
            {reqs.topSkills.map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-1 border border-cyan-500/30 rounded text-cyan-400"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Competitive Edge */}
        <div className="border border-gray-800/50 rounded-md bg-gray-900/50 p-4 mb-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            {fj.edge}
          </div>
          <div className="grid gap-2">
            {reqs.competitiveEdge.map((e) => (
              <div
                key={e}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <span className="text-amber-400 shrink-0">{"\u2605"}</span>
                <span>{e}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GCC Advantage */}
        <div className="border-l-2 border-amber-500 bg-amber-500/5 p-3 rounded-r-lg">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            {fj.gccAdvantage}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {isAr ? reqs.gccAdvantage.ar : reqs.gccAdvantage.en}
          </p>
        </div>
      </div>

      {/* ═══════════ BLOCK 2: MARKET ═══════════ */}
      <div>
        <SH title={fj.market} />

        {/* Demand badge */}
        <div className="mb-4">
          <DemandBadge occ={occ} fj={fj} />
          {"demand_rank" in occ &&
            typeof (occ as Record<string, unknown>).demand_rank === "number" &&
            ((occ as Record<string, unknown>).demand_rank as number) <= 15 && (
              <span className="ml-2 text-xs text-cyan-400">{fj.topDemand}</span>
            )}
        </div>

        {/* Salary package */}
        <div className="border border-gray-800/50 rounded-md bg-gray-900/50 p-4 mb-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            {fj.salaryPackage}
          </div>
          <div className="flex gap-6 mb-3">
            {[
              { label: "Entry", value: occ.salary_entry_sar },
              { label: "Median", value: occ.salary_median_sar },
              { label: "Senior", value: occ.salary_senior_sar },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-mono text-white">{fmt(s.value)}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {fj.packageNote}
          </p>
        </div>

        {/* Visa status */}
        <div
          className={`border rounded-md p-4 ${
            occ.nitaqat_status === "reserved_saudi_only"
              ? "border-red-500/30 bg-red-500/5"
              : "border-gray-800/50 bg-gray-900/50"
          }`}
        >
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            {fj.visa}
          </div>
          {occ.nitaqat_status === "reserved_saudi_only" ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-400 text-sm">{"\u26A0\uFE0F"}</span>
                <span className="text-sm font-semibold text-red-400">
                  {fj.visaReserved}
                </span>
              </div>
              <p className="text-sm text-gray-400">{fj.visaReservedNote}</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-400 text-sm">{"\u2713"}</span>
                <span className="text-sm font-semibold text-green-400">
                  {fj.visaOpen}
                </span>
              </div>
              <ol className="space-y-1.5 mb-3">
                {fj.visaOpenSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-gray-600 font-mono text-xs mt-0.5">
                      {i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-gray-500">{fj.visaTimeline}</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ BLOCK 3: WHO'S HIRING ═══════════ */}
      <div>
        <SH title={fj.employers} />

        {/* Top employers */}
        <div className="grid gap-2 mb-4">
          {employers.map((e) => (
            <div
              key={e.name}
              className="flex items-center justify-between border border-gray-800/50 rounded-md bg-gray-900/50 px-4 py-2.5"
            >
              <div>
                <span className="text-sm text-white font-medium">{e.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {isAr && e.sector_ar ? e.sector_ar : e.sector}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {fmt(e.employees)} {fj.employees}
              </span>
            </div>
          ))}
        </div>

        {/* Job boards */}
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          {fj.jobBoards}
        </div>
        <div className="flex flex-col gap-2 w-full">
          {jobBoards.map((jb) => (
            <a
              key={jb.name}
              href={jb.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-full transition-colors w-full"
            >
              {jb.name}
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ))}
        </div>

        {/* Relocation calculator link */}
        <div className="mt-6 border border-cyan-500/20 bg-cyan-400/5 rounded-lg p-4">
          <Link
            href="/relocate"
            className="flex items-center gap-3 group"
          >
            <span className="text-lg font-semibold text-cyan-400">$</span>
            <div>
              <p className="text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors">
                {isAr
                  ? "هل تخطط للانتقال لهذه الوظيفة؟ قارن تكلفة المعيشة ←"
                  : lang === "fr"
                  ? "Vous envisagez de d\u00e9m\u00e9nager pour ce poste ? Comparez le co\u00fbt de la vie \u2192"
                  : "Planning to relocate for this job? Compare cost of living \u2192"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAr
                  ? "احسب راتبك الحقيقي وقوتك الشرائية في السعودية"
                  : lang === "fr"
                  ? "Calculez votre vrai salaire et pouvoir d\u2019achat en Arabie Saoudite"
                  : "Calculate your real salary and purchasing power in Saudi Arabia"}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
