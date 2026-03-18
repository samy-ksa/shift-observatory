"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";
import {
  getAllOccupations,
  toSlug,
  riskLabel,
  riskLabelAr,
  riskColor,
  fmt,
  type Occupation,
} from "@/lib/occupations";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const INITIAL_COUNT = 12;

const POPULAR_SLUGS = [
  "construction-workers",
  "accountants-auditors",
  "registered-nurses",
  "software-developers",
  "data-entry-keyers",
  "call-center-agent",
  "heavy-truck-drivers",
  "teachers-preschool-primary",
];

type Filter = "all" | "high" | "moderate" | "low" | "reserved";

/* ------------------------------------------------------------------ */
/* Fuzzy search — splits query into words, matches any in en/ar name   */
/* ------------------------------------------------------------------ */
function fuzzyMatch(occ: Occupation, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const words = q.split(/\s+/);
  const haystack = `${occ.name_en} ${occ.name_ar}`.toLowerCase();
  return words.every((w) => haystack.includes(w));
}

/* ------------------------------------------------------------------ */
/* Risk dot component                                                  */
/* ------------------------------------------------------------------ */
function RiskDot({ score }: { score: number }) {
  const bg =
    score >= 70
      ? "bg-red-500"
      : score >= 45
        ? "bg-orange-500"
        : score >= 25
          ? "bg-yellow-500"
          : "bg-green-500";
  return <span className={`inline-block w-2 h-2 rounded-full ${bg}`} />;
}

/* ================================================================== */
/* Main component                                                      */
/* ================================================================== */
export default function OccupationDirectory() {
  const { t, lang } = useLang();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const ex = t.explore;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [debouncedQuery, setDebouncedQuery] = useState("");

  /* Debounce search input */
  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  /* All occupations sorted by workforce desc */
  const allOccs = useMemo(
    () =>
      getAllOccupations().sort(
        (a, b) => (b.employment_est || 0) - (a.employment_est || 0)
      ),
    []
  );

  /* Popular occupations */
  const popularOccs = useMemo(
    () =>
      POPULAR_SLUGS.map((s) =>
        allOccs.find((o) => toSlug(o.name_en) === s)
      ).filter(Boolean) as Occupation[],
    [allOccs]
  );

  /* Filter + search */
  const filtered = useMemo(() => {
    let list = allOccs;

    // Apply filter
    if (filter === "high") list = list.filter((o) => o.composite >= 70);
    else if (filter === "moderate")
      list = list.filter((o) => o.composite >= 45 && o.composite < 70);
    else if (filter === "low") list = list.filter((o) => o.composite < 45);
    else if (filter === "reserved")
      list = list.filter(
        (o) => o.nitaqat_status === "reserved_saudi_only"
      );

    // Apply search
    if (debouncedQuery.trim()) {
      list = list.filter((o) => fuzzyMatch(o, debouncedQuery));
    }

    return list;
  }, [allOccs, filter, debouncedQuery]);

  const isSearching = debouncedQuery.trim().length > 0;
  const visibleOccs =
    isSearching || expanded ? filtered : filtered.slice(0, INITIAL_COUNT);

  /* Filter chips config */
  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: ex.filterAll },
    { key: "high", label: ex.filterHighRisk },
    { key: "moderate", label: ex.filterModerate },
    { key: "low", label: ex.filterLowRisk },
    { key: "reserved", label: ex.filterReserved },
  ];

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto" dir={dir}>
      {/* Section header */}
      <div className="border-l-2 border-cyan-500 pl-3 mb-8">
        <h2 className="text-sm font-semibold tracking-widest text-cyan-400 uppercase">
          {ex.title}
        </h2>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ex.searchPlaceholder}
          className="w-full bg-gray-900/60 border border-gray-800 rounded-lg py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Popular chips */}
      {!isSearching && (
        <div className="mb-5 flex flex-wrap items-center gap-x-1 gap-y-1">
          <span className="text-xs text-gray-500 mr-1">{ex.popular}:</span>
          {popularOccs.map((occ, i) => (
            <span key={occ.name_en} className="flex items-center">
              <Link
                href={`/job/${toSlug(occ.name_en)}`}
                className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
              >
                {lang === "ar" ? occ.name_ar : occ.name_en}
              </Link>
              {i < popularOccs.length - 1 && (
                <span className="text-gray-600 mx-1.5">·</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setExpanded(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              filter === f.key
                ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/40"
                : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* No results */}
      {isSearching && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm mb-3">{ex.noResults}</p>
          <button
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
            }}
            className="text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors"
          >
            {ex.clearSearch}
          </button>
        </div>
      )}

      {/* Cards grid */}
      {visibleOccs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {visibleOccs.map((occ) => {
            const rl =
              lang === "ar"
                ? riskLabelAr(occ.composite)
                : riskLabel(occ.composite);
            return (
              <Link
                key={occ.name_en}
                href={`/job/${toSlug(occ.name_en)}`}
                className="group block border border-gray-800/50 rounded-md p-3 bg-gray-900/50 hover:bg-gray-800/30 hover:border-gray-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                      {occ.name_en}
                    </div>
                    <div
                      className="text-xs text-gray-500 truncate mt-0.5"
                      dir="rtl"
                    >
                      {occ.name_ar}
                    </div>
                  </div>
                  <span
                    className={`text-lg font-mono font-bold shrink-0 ${riskColor(occ.composite)}`}
                  >
                    {occ.composite}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <RiskDot score={occ.composite} />
                    <span className="text-xs text-gray-500">{rl}</span>
                  </div>
                  <span className="text-xs text-gray-600 font-mono">
                    {fmt(occ.employment_est)} {ex.workers}
                  </span>
                </div>
                {/* Arrow */}
                <div className="flex justify-end mt-1">
                  <span className="text-gray-700 group-hover:text-cyan-400 transition-colors text-xs">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Show all / Show less */}
      {!isSearching && filtered.length > INITIAL_COUNT && (
        <div className="text-center mt-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            {expanded ? ex.showLess : ex.showAll}
          </button>
        </div>
      )}
    </section>
  );
}
