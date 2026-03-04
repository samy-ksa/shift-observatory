"use client";

import { useState } from "react";
import { useLang, formatNumber } from "@/lib/i18n/context";
import data from "@/data/master.json";

const cases = data.layoffs.ai_cases_global;

export default function LayoffsTicker() {
  const { t, lang } = useLang();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const items = cases.filter((c) => c.jobs);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1F2E]/95 backdrop-blur-sm border-t border-white/10">
      <div className="flex items-center h-9">
        {/* Red pulsing badge */}
        <div className="bg-risk-very-high/90 px-4 h-full flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse-glow" />
          <span className="text-white font-bold text-xs tracking-wider">
            {t.layoffs.title.length > 20 ? "AI" : t.layoffs.confirmed}
          </span>
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker whitespace-nowrap">
            {[...items, ...items].map((c, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-6">
                <span className="text-text-primary font-medium text-sm">
                  {c.company}
                </span>
                <span className="text-risk-very-high font-mono font-bold text-sm">
                  -{formatNumber(c.jobs!, lang)}
                </span>
                <span className="text-text-muted text-xs">{lang === "ar" ? "وظيفة" : "jobs"}</span>
                <span className="bg-risk-very-high/20 text-risk-very-high text-xs px-1.5 py-0.5 rounded font-medium">
                  AI
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="px-3 text-text-muted hover:text-text-primary transition-colors shrink-0"
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}
