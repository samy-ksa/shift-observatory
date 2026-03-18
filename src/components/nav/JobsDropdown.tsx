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

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const SEARCH_MAX = 10;
const DEBOUNCE_MS = 150;

type Filter = "all" | "high" | "moderate" | "low";

/* ------------------------------------------------------------------ */
/* Fuzzy match — every query word must appear in en or ar name         */
/* ------------------------------------------------------------------ */
function fuzzyMatch(occ: Occupation, q: string): boolean {
  const words = q.toLowerCase().trim().split(/\s+/);
  const hay = `${occ.name_en} ${occ.name_ar}`.toLowerCase();
  return words.every((w) => hay.includes(w));
}

/* ------------------------------------------------------------------ */
/* Risk helpers (inline to keep self-contained)                        */
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

/* ================================================================== */
/* Component                                                           */
/* ================================================================== */
export default function JobsDropdown() {
  const { t, lang } = useLang();
  const router = useRouter();
  const jd = t.jobsDropdown;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  /* --- All occupations sorted by workforce desc --- */
  const allOccs = useMemo(
    () =>
      getAllOccupations().sort(
        (a, b) => (b.employment_est || 0) - (a.employment_est || 0)
      ),
    []
  );

  /* --- Debounce --- */
  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedQ(query), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  /* --- Filter + search --- */
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

  /* --- Auto-focus input on open --- */
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
      setDebouncedQ("");
      setFilter("all");
      setHighlightIdx(-1);
    }
  }, [open]);

  /* --- Click outside --- */
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

  /* --- Escape key --- */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  /* --- Keyboard navigation --- */
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
      } else if (e.key === "Enter" && highlightIdx >= 0 && results[highlightIdx]) {
        e.preventDefault();
        const occ = results[highlightIdx];
        router.push(`/job/${toSlug(occ.name_en)}`);
        setOpen(false);
      }
    },
    [results, highlightIdx, router]
  );

  /* --- Filter chips --- */
  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: jd.filterAll },
    { key: "high", label: jd.filterHigh },
    { key: "moderate", label: jd.filterModerate },
    { key: "low", label: jd.filterLow },
  ];

  return (
    <div ref={containerRef} className="relative">
      {/* Nav button */}
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

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[#0A0E17] border border-gray-800 rounded-lg shadow-2xl shadow-black/50 z-[60] animate-dropdown"
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="relative border-b border-gray-800">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-3.5 h-3.5 text-gray-500"
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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightIdx(-1);
              }}
              placeholder={jd.searchPlaceholder}
              className="w-full bg-gray-900 text-white text-sm py-3 pl-9 pr-3 focus:outline-none placeholder:text-gray-500"
            />
          </div>

          {/* Results list */}
          <div className="relative">
            <div className="max-h-80 overflow-y-auto jobs-scroll">
              {results.length === 0 && isSearching ? (
                <div className="px-3 py-6 text-center text-gray-500 text-xs">
                  {jd.noResults}
                </div>
              ) : (
                results.map((occ, i) => (
                  <Link
                    key={occ.name_en}
                    href={`/job/${toSlug(occ.name_en)}`}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setHighlightIdx(i)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                      i === highlightIdx
                        ? "bg-gray-800/70"
                        : "hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-white text-sm truncate block">
                        {occ.name_en}
                      </span>
                      {lang === "ar" && (
                        <span className="text-gray-600 text-xs block truncate" dir="rtl">
                          {occ.name_ar}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span
                        className={`font-mono text-sm font-medium ${riskTextColor(occ.composite)}`}
                      >
                        {occ.composite}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${riskDotColor(occ.composite)}`}
                      />
                    </div>
                  </Link>
                ))
              )}
            </div>
            {/* Fade hint at bottom */}
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

          {/* Browse all link */}
          <Link
            href="/career"
            onClick={() => setOpen(false)}
            className="block text-center text-cyan-400 hover:text-cyan-300 text-xs py-3 border-t border-gray-800 transition-colors"
          >
            {jd.browseAll}
          </Link>
        </div>
      )}

      {/* Animation + scrollbar styles */}
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
      `}</style>
    </div>
  );
}
