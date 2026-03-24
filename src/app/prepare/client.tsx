"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLang } from "@/lib/i18n/context";
import LangToggle from "@/components/ui/LangToggle";
import EmailGateModal from "@/components/shared/EmailGateModal";
import {
  COUNTRIES,
  SECTORS,
  getFilteredChecklist,
  type ChecklistSection,
} from "@/data/checklist-data";

const STORAGE_KEY = "shift_checklist";

export default function PrepareClient() {
  const { t, lang, dir } = useLang();
  const [country, setCountry] = useState("");
  const [sector, setSector] = useState("");
  const [generated, setGenerated] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.checked) setChecked(parsed.checked);
        if (parsed.country) setCountry(parsed.country);
        if (parsed.sector) setSector(parsed.sector);
        if (parsed.country && parsed.sector) setGenerated(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (generated) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ checked, country, sector }),
      );
    }
  }, [checked, country, sector, generated]);

  const sections: ChecklistSection[] = useMemo(() => {
    if (!country || !sector) return [];
    return getFilteredChecklist(country, sector);
  }, [country, sector]);

  const totalItems = useMemo(
    () => sections.reduce((sum, s) => sum + s.items.length, 0),
    [sections],
  );
  const completedItems = useMemo(
    () =>
      sections.reduce(
        (sum, s) => sum + s.items.filter((i) => checked[i.id]).length,
        0,
      ),
    [sections, checked],
  );
  const progressPct =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const toggleCheck = useCallback((id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleGenerate = () => {
    if (country && sector) {
      setGenerated(true);
      const open: Record<string, boolean> = {};
      sections.forEach((s) => {
        open[s.id] = true;
      });
      setOpenSections(open);
    }
  };

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-500/20 text-red-400 border-red-500/30",
      important: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      recommended: "bg-gray-700/50 text-gray-400 border-gray-600/30",
    };
    const labels: Record<string, string> = {
      critical: t.prepare.critical,
      important: t.prepare.important,
      recommended: t.prepare.recommended,
    };
    return (
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${colors[priority] || colors.recommended}`}
      >
        {labels[priority] || priority}
      </span>
    );
  };

  const getName = (item: { name_en: string; name_fr: string; name_ar: string }) => {
    return lang === "ar" ? item.name_ar : lang === "fr" ? item.name_fr : item.name_en;
  };

  return (
    <main className="min-h-screen bg-bg-primary text-white" dir={dir}>
      <LangToggle />
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <a href="/" className="hover:text-cyan-400 transition-colors">
            {lang === "ar" ? "الرئيسية" : lang === "fr" ? "Tableau de bord" : "Dashboard"}
          </a>
          <span>/</span>
          <span className="text-gray-300">
            {lang === "ar" ? "قائمة التجهيز" : lang === "fr" ? "Checklist départ" : "Checklist"}
          </span>
        </nav>

        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t.prepare.title}
        </h1>
        <p className="text-gray-400 mb-8">{t.prepare.subtitle}</p>

        {/* Step 1: Selection form */}
        <div className="border border-gray-800 rounded-lg p-4 md:p-6 mb-8 bg-gray-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Country dropdown */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                {t.prepare.countryLabel}
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setGenerated(false);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white min-h-12 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">--</option>
                {COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getName(c)}
                  </option>
                ))}
              </select>
            </div>
            {/* Sector dropdown */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">
                {t.prepare.sectorLabel}
              </label>
              <select
                value={sector}
                onChange={(e) => {
                  setSector(e.target.value);
                  setGenerated(false);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white min-h-12 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">--</option>
                {SECTORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getName(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!country || !sector}
            className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold px-8 py-3 rounded-lg min-h-12 transition-colors"
          >
            {t.prepare.generate} &rarr;
          </button>
        </div>

        {/* Step 2: Checklist */}
        {generated && sections.length > 0 && (
          <>
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">{t.prepare.progress}</span>
                <span className="text-white font-mono">
                  {completedItems} {t.prepare.itemsOf} {totalItems}{" "}
                  {t.prepare.completed} ({progressPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {sections.map((section) => {
                const sectionCompleted = section.items.filter(
                  (i) => checked[i.id],
                ).length;
                const isOpen = openSections[section.id] !== false;
                const sectionTitle =
                  lang === "ar"
                    ? section.title_ar
                    : lang === "fr"
                      ? section.title_fr
                      : section.title_en;
                const sectionTimeline =
                  lang === "ar"
                    ? section.timeline_ar
                    : lang === "fr"
                      ? section.timeline_fr
                      : section.timeline_en;

                return (
                  <div
                    key={section.id}
                    className="border border-gray-800 rounded-lg overflow-hidden"
                  >
                    {/* Section header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/80 hover:bg-gray-900 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 text-lg">
                          {isOpen ? "\u2212" : "+"}
                        </span>
                        <div>
                          <span className="text-white font-medium text-sm">
                            {sectionTitle}
                          </span>
                          <span className="text-gray-500 text-xs ml-2">
                            ({sectionTimeline})
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {sectionCompleted}/{section.items.length}
                      </span>
                    </button>

                    {/* Section items */}
                    {isOpen && (
                      <div className="divide-y divide-gray-800/50">
                        {section.items.map((item) => {
                          const itemTitle =
                            lang === "ar"
                              ? item.title_ar
                              : lang === "fr"
                                ? item.title_fr
                                : item.title_en;
                          const itemDesc =
                            lang === "ar"
                              ? item.description_ar
                              : lang === "fr"
                                ? item.description_fr
                                : item.description_en;
                          const isChecked = !!checked[item.id];

                          return (
                            <div
                              key={item.id}
                              className={`px-4 py-3 transition-colors ${isChecked ? "bg-gray-900/30 opacity-60" : "hover:bg-gray-900/20"}`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <button
                                  onClick={() => toggleCheck(item.id)}
                                  aria-label={`${isChecked ? "Uncheck" : "Check"}: ${item.description_en}`}
                                  role="checkbox"
                                  aria-checked={isChecked}
                                  className={`mt-0.5 w-5 h-5 min-w-5 rounded border flex items-center justify-center transition-colors ${
                                    isChecked
                                      ? "bg-cyan-500 border-cyan-500 text-black"
                                      : "border-gray-600 hover:border-cyan-500"
                                  }`}
                                >
                                  {isChecked && (
                                    <span className="text-xs font-bold">
                                      &#10003;
                                    </span>
                                  )}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span
                                      className={`text-sm ${isChecked ? "line-through text-gray-500" : "text-white"}`}
                                    >
                                      {itemTitle}
                                    </span>
                                    {priorityBadge(item.priority)}
                                  </div>
                                  <p className="text-xs text-gray-500 leading-relaxed">
                                    {itemDesc}
                                  </p>
                                  {/* Links */}
                                  {item.links && item.links.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {item.links.map((link, i) => (
                                        <a
                                          key={i}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                                        >
                                          {lang === "ar"
                                            ? link.label_ar
                                            : lang === "fr"
                                              ? link.label_fr
                                              : link.label_en}{" "}
                                          &rarr;
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Download CTA */}
            <div className="mt-8 border border-cyan-500/20 rounded-lg p-6 bg-gradient-to-r from-cyan-500/5 to-transparent">
              <p className="text-sm text-gray-300 mb-4">
                {t.prepare.downloadDesc}
              </p>
              <button
                onClick={() => {
                  const saved = localStorage.getItem("shift_checklist_email");
                  if (saved) {
                    window.print();
                  } else {
                    setShowEmailModal(true);
                  }
                }}
                className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-8 py-3 rounded-lg min-h-12 transition-colors"
              >
                {t.prepare.downloadChecklist} &rarr;
              </button>
            </div>

            {/* Cross-links */}
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h3 className="text-sm uppercase tracking-widest text-cyan-400 font-semibold mb-3">
                {t.links?.exploreMore || "Explore More"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <a href="/relocate" className="text-xs border border-gray-800/50 rounded px-3 py-1.5 text-gray-300 hover:text-cyan-400 transition-colors">
                  {t.links?.relocationCalculator || "Relocation Calculator"}
                </a>
                <a href="/career" className="text-xs border border-gray-800/50 rounded px-3 py-1.5 text-gray-300 hover:text-cyan-400 transition-colors">
                  {t.links?.careerRecommender || "Career Recommender"}
                </a>
                <a href="/job/registered-nurses" className="text-xs border border-gray-800/50 rounded px-3 py-1.5 text-gray-300 hover:text-cyan-400 transition-colors">
                  Registered Nurses — AI Risk
                </a>
                <a href="/job/software-developers" className="text-xs border border-gray-800/50 rounded px-3 py-1.5 text-gray-300 hover:text-cyan-400 transition-colors">
                  Software Developers — AI Risk
                </a>
                <a href="/job/civil-engineers" className="text-xs border border-gray-800/50 rounded px-3 py-1.5 text-gray-300 hover:text-cyan-400 transition-colors">
                  Civil Engineers — AI Risk
                </a>
              </div>
            </div>

            {/* Email gate modal */}
            <EmailGateModal
              open={showEmailModal}
              onClose={() => setShowEmailModal(false)}
              loading={emailLoading}
              lang={lang}
              onSubmit={async (email: string) => {
                setEmailLoading(true);
                try {
                  await fetch("/api/checklist-lead", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, country, sector }),
                  });
                  localStorage.setItem("shift_checklist_email", email);
                  setShowEmailModal(false);
                  window.print();
                } catch {
                  /* silent */
                } finally {
                  setEmailLoading(false);
                }
              }}
            />
          </>
        )}
      </div>
    </main>
  );
}
