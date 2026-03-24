"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/context";
import {
  getAllOccupations,
  toSlug,
  type Occupation,
} from "@/lib/occupations";
import { findClosestOccupations } from "@/lib/occupation-matcher";
import { getScoreTrend } from "@/data/score-history";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const SEARCH_MAX = 10;
const DEBOUNCE_MS = 150;

type Filter = "all" | "high" | "moderate" | "low";

/* ------------------------------------------------------------------ */
/* Fuzzy match                                                         */
/* ------------------------------------------------------------------ */
function fuzzyMatch(occ: Occupation, q: string): boolean {
  const words = q.toLowerCase().trim().split(/\s+/);
  const hay = `${occ.name_en} ${occ.name_ar} ${occ.name_fr}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}

/* ------------------------------------------------------------------ */
/* Risk helpers                                                        */
/* ------------------------------------------------------------------ */
function riskTextColor(score: number) {
  if (score >= 70) return "text-red-400";
  if (score >= 45) return "text-orange-400";
  if (score >= 25) return "text-yellow-400";
  return "text-green-400";
}
function riskDotColor(score: number) {
  if (score >= 70) return "bg-red-400";
  if (score >= 45) return "bg-orange-400";
  if (score >= 25) return "bg-yellow-400";
  return "bg-green-400";
}

/* ------------------------------------------------------------------ */
/* Search icon SVG                                                     */
/* ------------------------------------------------------------------ */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || "w-3.5 h-3.5"}
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
  );
}

/* ================================================================== */
/* Shared inner panel (used by both desktop dropdown & mobile overlay)  */
/* ================================================================== */
function SearchPanel({
  onClose,
  mobile,
}: {
  onClose: () => void;
  mobile?: boolean;
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const jd = t.jobsDropdown;

  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const allOccs = useMemo(
    () =>
      getAllOccupations().sort(
        (a, b) => (b.employment_est || 0) - (a.employment_est || 0)
      ),
    []
  );

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedQ(query), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const results = useMemo(() => {
    let list = allOccs;
    if (filter === "high") list = list.filter((o) => o.composite >= 70);
    else if (filter === "moderate")
      list = list.filter((o) => o.composite >= 45 && o.composite < 70);
    else if (filter === "low") list = list.filter((o) => o.composite < 45);

    if (debouncedQ.trim()) {
      list = list.filter((o) => fuzzyMatch(o, debouncedQ));
      return list.slice(0, SEARCH_MAX);
    }
    return list;
  }, [allOccs, filter, debouncedQ]);

  const isSearching = debouncedQ.trim().length > 0;

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
      } else if (
        e.key === "Enter" &&
        highlightIdx >= 0 &&
        results[highlightIdx]
      ) {
        e.preventDefault();
        router.push(`/job/${toSlug(results[highlightIdx].name_en)}`);
        onClose();
      }
    },
    [results, highlightIdx, router, onClose]
  );

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: jd.filterAll },
    { key: "high", label: jd.filterHigh },
    { key: "moderate", label: jd.filterModerate },
    { key: "low", label: jd.filterLow },
  ];

  const maxH = mobile ? "max-h-[60vh]" : "max-h-80";

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Mobile close header */}
      {mobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <span className="text-sm font-medium text-white">{jd.nav}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
            aria-label="Close job search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search input */}
      <div className="relative border-b border-gray-800">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-4 h-4 text-gray-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightIdx(-1);
          }}
          placeholder={jd.searchPlaceholder}
          className={`w-full bg-gray-900 text-white text-sm pl-10 pr-3 focus:outline-none placeholder:text-gray-500 ${
            mobile ? "py-4 text-base min-h-[48px]" : "py-3"
          }`}
        />
      </div>

      {/* Results */}
      <div className="relative">
        <div className={`${maxH} overflow-y-auto jobs-scroll`}>
          {results.length === 0 && isSearching ? (
            debouncedQ.length >= 2 ? (
              <div className="px-3 py-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                  {t.match.matchClosest}
                </p>
                {findClosestOccupations(debouncedQ, 3).map((m) => (
                  <a key={m.slug} href={`/job/${m.slug}`} onClick={onClose} className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${m.occupation.composite > 70 ? "bg-red-500" : m.occupation.composite > 40 ? "bg-amber-500" : "bg-green-500"}`} />
                      <span className="text-gray-200 text-sm">
                        {lang === "ar" ? m.occupation.name_ar : lang === "fr" ? m.occupation.name_fr : m.occupation.name_en}
                      </span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.score > 80 ? "text-green-400" : m.score > 50 ? "text-amber-400" : "text-gray-500"}`}>
                      {m.score}%
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="px-3 py-6 text-center text-gray-500 text-xs">
                {jd.noResults}
              </div>
            )
          ) : (
            results.map((occ, i) => (
              <Link
                key={occ.name_en}
                href={`/job/${toSlug(occ.name_en)}`}
                onClick={onClose}
                onMouseEnter={() => setHighlightIdx(i)}
                className={`flex items-center justify-between px-3 cursor-pointer transition-colors ${
                  mobile ? "py-3" : "py-2"
                } ${
                  i === highlightIdx
                    ? "bg-gray-800/70"
                    : "hover:bg-gray-800/50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className={`text-white truncate block ${mobile ? "text-base" : "text-sm"}`}>
                    {lang === "ar" ? occ.name_ar : lang === "fr" ? occ.name_fr : occ.name_en}
                  </span>
                  {lang !== "en" && (
                    <span className="text-gray-600 text-xs block truncate" dir={lang === "ar" ? "ltr" : "rtl"}>
                      {lang === "ar" ? occ.name_en : occ.name_ar}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span
                    className={`font-mono text-sm font-medium ${riskTextColor(occ.composite)}`}
                  >
                    {occ.composite}
                  </span>
                  {(() => {
                    const trend = getScoreTrend(toSlug(occ.name_en), occ.composite);
                    return trend.direction === "up" ? (
                      <span className="text-red-400 text-[10px]">&#9650;</span>
                    ) : trend.direction === "down" ? (
                      <span className="text-green-400 text-[10px]">&#9660;</span>
                    ) : null;
                  })()}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${riskDotColor(occ.composite)}`}
                  />
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-[#0A0E17] to-transparent" />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-t border-gray-800">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setHighlightIdx(-1);
            }}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              filter === f.key
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                : "bg-transparent text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Browse all */}
      <Link
        href="/career"
        onClick={onClose}
        className="block text-center text-cyan-400 hover:text-cyan-300 text-xs py-3 border-t border-gray-800 transition-colors"
      >
        {jd.browseAll}
      </Link>
    </div>
  );
}

/* ================================================================== */
/* Desktop dropdown (used in top nav)                                   */
/* ================================================================== */
export default function JobsDropdown() {
  const { t } = useLang();
  const jd = t.jobsDropdown;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Click outside */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`relative px-4 py-2 text-sm font-medium transition-all ${
          open
            ? "text-accent-primary border-b-2 border-accent-primary"
            : "text-text-muted hover:text-text-secondary"
        }`}
      >
        {jd.nav}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[#0A0E17] border border-gray-800 rounded-lg shadow-2xl shadow-black/50 z-[60] animate-dropdown">
          <SearchPanel onClose={() => setOpen(false)} />
        </div>
      )}

      <style jsx global>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-dropdown {
          animation: dropdownIn 150ms ease-out;
        }
        .jobs-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .jobs-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .jobs-scroll::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 2px;
        }
        .jobs-scroll::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        .jobs-scroll {
          scrollbar-width: thin;
          scrollbar-color: #374151 transparent;
        }
        @keyframes mobileSlideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-mobile-slide-up {
          animation: mobileSlideUp 200ms ease-out;
        }
      `}</style>
    </div>
  );
}

/* ================================================================== */
/* Mobile Jobs button + full-screen overlay (used in bottom nav)        */
/* ================================================================== */
export function MobileJobsButton() {
  const { t } = useLang();
  const jd = t.jobsDropdown;
  const [open, setOpen] = useState(false);

  /* Lock body scroll when overlay open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Button in bottom nav */}
      <button
        onClick={() => setOpen(true)}
        className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 transition-all ${
          open ? "text-accent-primary" : "text-text-muted"
        }`}
      >
        <SearchIcon className="w-4 h-4" />
        <span className="text-xs font-medium">{jd.nav}</span>
      </button>

      {/* Full-screen overlay */}
      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Panel — slides up from bottom */}
          <div className="relative mt-auto bg-[#0A0E17] border-t border-gray-800 rounded-t-2xl animate-mobile-slide-up max-h-[85vh] flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-700" />
            </div>
            <SearchPanel onClose={() => setOpen(false)} mobile />
          </div>
        </div>
      )}
    </>
  );
}
