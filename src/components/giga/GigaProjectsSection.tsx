"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import { useLang, formatNumber } from "@/lib/i18n/context";
import data from "@/data/master.json";

interface GigaProject {
  name: string;
  name_ar: string;
  name_fr?: string;
  region: string;
  current_workforce?: number;
  fulltime_staff?: number;
  long_term_jobs: number;
  components?: string[];
  note?: string;
  source: string;
  current_staff?: number;
  staff_saudization?: string;
  additional_seven?: number;
  status: "scaled_back" | "operating" | "opening_soon" | "under_construction";
  status_date: string;
  status_note_en: string;
  status_note_fr: string;
  status_note_ar: string;
  status_sources: { label: string; url: string }[];
}

const projects = data.giga_projects as GigaProject[];

/* Region AR mapping */
const REGION_AR: Record<string, string> = {
  Tabuk: "تبوك",
  Riyadh: "الرياض",
  Makkah: "مكة المكرمة",
  "Tabuk/Madinah": "تبوك/المدينة",
};

const REGION_FR: Record<string, string> = { Tabuk: "Tabouk", Riyadh: "Riyad", Makkah: "La Mecque", "Tabuk/Madinah": "Tabouk/Médine" };
const COMPONENT_AR: Record<string, string> = { "THE LINE": "ذا لاين", Oxagon: "أوكساجون", Trojena: "تروجينا", Sindalah: "سندالة" };

/* Color palette for cards */
const CARD_COLORS = [
  { accent: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-400" },
  { accent: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", text: "text-amber-400" },
  { accent: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/30", text: "text-purple-400" },
  { accent: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400" },
  { accent: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/30", text: "text-rose-400" },
  { accent: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/30", text: "text-blue-400" },
];
const STATUS_COLORS: Record<GigaProject["status"], string> = {
  scaled_back: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  operating: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  opening_soon: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  under_construction: "bg-blue-500/15 text-blue-300 border-blue-500/30",
};

export default function GigaProjectsSection() {
  const { t, lang } = useLang();

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title={t.gigaProjects.title}
          subtitle={t.gigaProjects.subtitle}
          id="giga"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => {
            const colors = CARD_COLORS[i % CARD_COLORS.length];
            const currentWork = project.name === "NEOM" ? undefined : project.current_workforce ?? project.current_staff;

            return (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`bg-bg-card rounded-2xl p-5 border ${colors.border} card-glow overflow-hidden relative`}
              >
                {/* Gradient top */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.accent}`} />

                {/* Name */}
                <h3 className={`text-lg font-bold ${colors.text} mb-1`}>
                  {lang === "ar" ? project.name_ar : lang === "fr" ? project.name_fr || project.name : project.name}
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  {t.gigaProjects.region}: {lang === "ar" && REGION_AR[project.region] ? REGION_AR[project.region] : lang === "fr" ? REGION_FR[project.region] || project.region : project.region}
                </p>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium mb-3 ${STATUS_COLORS[project.status]}`}>
                  {t.gigaProjects.status[project.status]}
                </span>
                <p className="text-sm text-text-secondary mb-3" dir={lang === "ar" ? "rtl" : undefined}>
                  {lang === "ar" ? project.status_note_ar : lang === "fr" ? project.status_note_fr : project.status_note_en}
                </p>

                {/* Original announced job target */}
                <div className="mb-3">
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    {t.gigaProjects.projectedJobs}
                  </p>
                  <p className={`font-mono font-bold text-2xl ${colors.text}`}>
                    {formatNumber(project.long_term_jobs, lang)}
                  </p>
                </div>

                {/* Current workforce if available */}
                {currentWork && (
                  <div className="mb-3">
                    <p className="text-xs text-text-muted uppercase tracking-wider">
                      {t.gigaProjects.currentWorkforce}
                    </p>
                    <p className="font-mono font-semibold text-lg text-text-secondary">
                      {formatNumber(currentWork, lang)}
                    </p>
                  </div>
                )}

                {/* Components if available */}
                {project.components && project.components.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-text-muted mb-1.5">{t.gigaProjects.components}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.components.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-text-muted border border-white/5"
                        >
                          {lang === "ar" ? COMPONENT_AR[c] || c : c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <details className="mt-4 text-xs text-text-muted border-t border-white/10 pt-3">
                  <summary className="cursor-pointer hover:text-text-primary">{t.gigaProjects.sources}</summary>
                  <ul className="mt-2 space-y-1.5">
                    {project.status_sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline">
                          {source.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </motion.div>
            );
          })}
        </div>

        {/* Sum of original announced targets */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-text-muted">
            {t.gigaProjects.totalTargets}:{" "}
            <span className="font-mono font-bold text-accent-gold text-lg">
              {formatNumber(projects.reduce((sum, p) => sum + p.long_term_jobs, 0), lang)}
            </span>
          </p>
          <p className="text-xs text-text-muted mt-2 max-w-4xl mx-auto">
            {t.gigaProjects.targetsCaveat}{" "}
            <a href="https://www.pif.gov.sa/en/news-and-insights/press-releases/2026/chaired-by-hrh-crown-prince-pif-board-of-directors-approves-pif-2026-2030-strategy/" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline">{t.gigaProjects.sources}</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
