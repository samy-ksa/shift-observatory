"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/context";
import { getAllOccupations, toSlug, type Occupation } from "@/lib/occupations";

const DEBOUNCE_MS = 150;

type Filter = "all" | "high" | "low";

function fuzzyMatch(occ: Occupation, q: string): boolean {
  const words = q.toLowerCase().trim().split(/\s+/);
  const hay = `${occ.name_en} ${occ.name_ar}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}

function riskTextColor(s: number) {
  return s >= 70 ? "text-red-400" : s >= 45 ? "text-orange-400" : s >= 25 ? "text-yellow-400" : "text-green-400";
}
function riskDotBg(s: number) {
  return s >= 70 ? "bg-red-400" : s >= 45 ? "bg-orange-400" : s >= 25 ? "bg-yellow-400" : "bg-green-400";
}

export default function MobileJobSearch() {
  const { t, lang } = useLang();
  const router = useRouter();
  const jd = t.jobsDropdown;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const placeholder = lang === "ar" ? "ابحث عن وظيفتك بين 146 مهنة..." : "Find your job among 146 occupations...";

  const allOccs = useMemo(
    () => getAllOccupations().sort((a, b) => (b.employment_est || 0) - (a.employment_est || 0)),
    []
  );

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedQ(query), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const results = useMemo(() => {
    let list = allOccs;
    if (filter === "high") list = list.filter((o) => o.composite >= 45);
    else if (filter === "low") list = list.filter((o) => o.composite < 45);
    if (debouncedQ.trim()) list = list.filter((o) => fuzzyMatch(o, debouncedQ));
    return list;
  }, [allOccs, filter, debouncedQ]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Auto-focus */
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
    else { setQuery(""); setDebouncedQ(""); setFilter("all"); }
  }, [open]);

  const handleSelect = useCallback((occ: Occupation) => {
    router.push(`/job/${toSlug(occ.name_en)}`);
    setOpen(false);
  }, [router]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: jd.filterAll },
    { key: "high", label: jd.filterHigh },
    { key: "low", label: jd.filterLow },
  ];

  return (
    <>
      {/* Sticky compact bar — mobile only */}
      <div className="md:hidden sticky top-12 z-[49] bg-[#0A0E17]/95 backdrop-blur-sm border-b border-gray-800/50">
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2.5 px-4 h-10 text-left"
        >
          <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-500 text-sm truncate">{placeholder}</span>
        </button>
      </div>

      {/* Full-screen overlay */}
      {open && (
        <div className="fixed inset-0 z-[70] bg-[#0A0E17] flex flex-col md:hidden">
          {/* Header: search + close */}
          <div className="flex items-center border-b border-gray-800 shrink-0">
            <div className="flex items-center flex-1 px-3">
              <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-white text-base py-3.5 px-3 focus:outline-none placeholder:text-gray-500 min-h-[48px]"
              />
            </div>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-3.5 text-gray-400 hover:text-white shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter chips — horizontal scroll */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800/50 shrink-0 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                  filter === f.key
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                    : "bg-transparent text-gray-500 border-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="text-xs text-gray-600 whitespace-nowrap ml-1">
              {results.length} {lang === "ar" ? "نتيجة" : "results"}
            </span>
          </div>

          {/* Results list — fills remaining space */}
          <div className="flex-1 overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500 text-sm">
                {jd.noResults}
              </div>
            ) : (
              results.map((occ) => (
                <button
                  key={occ.name_en}
                  onClick={() => handleSelect(occ)}
                  className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-800/30 active:bg-gray-800/50 text-left min-h-[48px]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm truncate">{occ.name_en}</div>
                    <div className="text-gray-600 text-xs truncate" dir="rtl">{occ.name_ar}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={`font-mono text-sm font-medium ${riskTextColor(occ.composite)}`}>
                      {occ.composite}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskDotBg(occ.composite)}`} />
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
