"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import { useLang, formatNumber } from "@/lib/i18n/context";
import data from "@/data/master.json";

interface GigaProject {
  name: string;
  name_ar: string;
  region: string;
  current_workforce?: number;
  projected_2025?: number;
  fulltime_staff?: number;
  long_term_jobs: number;
  components?: string[];
  note?: string;
  source: string;
  current_staff?: number;
  staff_saudization?: string;
  additional_seven?: number;
}

const projects = data.giga_projects as GigaProject[];

/* Region AR mapping */
const REGION_AR: Record<string, string> = {
  Tabuk: "تبوك",
  Riyadh: "الرياض",
  Makkah: "مكة المكرمة",
  "Tabuk/Madinah": "تبوك/المدينة",
};

/* Color palette for cards */
const CARD_COLORS = [
  { accent: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-400" },
  { accent: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", text: "text-amber-400" },
  { accent: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/30", text: "text-purple-400" },
  { accent: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400" },
  { accent: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/30", text: "text-rose-400" },
  { accent: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/30", text: "text-blue-400" },
];

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
            const currentWork = project.current_workforce ?? project.current_staff;

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
                  {lang === "ar" ? project.name_ar : project.name}
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  {t.gigaProjects.region}: {lang === "ar" && REGION_AR[project.region] ? REGION_AR[project.region] : project.region}
                </p>

                {/* Projected jobs */}
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
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Total projected jobs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-text-muted">
            {lang === "ar" ? "إجمالي الوظائف المتوقعة" : "Total projected jobs across all giga-projects"}:{" "}
            <span className="font-mono font-bold text-accent-gold text-lg">
              {formatNumber(projects.reduce((sum, p) => sum + p.long_term_jobs, 0), lang)}
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
