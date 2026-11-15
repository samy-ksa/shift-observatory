"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";
import { useLang, formatNumber } from "@/lib/i18n/context";
import { localizedHref } from "@/lib/i18n/links";
import { decisions, localizedDecision } from "@/lib/saudization";
import data from "@/data/master.json";

/* ── Data extraction ────────────────────────────────────── */
const nitaqat = data.nitaqat as {
  overview: {
    program: string;
    decision: string;
    bands: string[];
    formula: string;
    note: string;
  };
  band_consequences: Record<
    string,
    {
      new_visas: boolean;
      change_occupations: boolean;
      renew_permits: boolean;
      transfer_in: boolean;
      immediate_counting?: boolean;
      penalties?: boolean;
      employee_transfer_without_consent?: boolean;
    }
  >;
  sector_parameters_2024: Record<string, unknown>;
  reserved_professions_100: string[];
  tawteen_decisions_2024_2025: {
    profession: string;
    quota_pct: number;
    phase: string;
    effective: string;
    note: string;
  }[];
};

const reservedCount = nitaqat.reserved_professions_100.length;
const taweenCount = decisions.length;
const sectorCount = Object.keys(nitaqat.sector_parameters_2024).length;
const bandCount = Object.keys(nitaqat.band_consequences).length;
const today = new Date();
const eighteenMonthsAhead = new Date(today);
eighteenMonthsAhead.setMonth(eighteenMonthsAhead.getMonth() + 18);
const latestDecisions = decisions
  .filter((decision) => decision.effective && new Date(`${decision.effective}T00:00:00Z`) <= eighteenMonthsAhead)
  .sort((a, b) => b.effective!.localeCompare(a.effective!))
  .slice(0, 8);

/* Band display order + colors */
const BAND_ORDER = ["Platinum", "High Green", "Medium Green", "Low Green", "Red"] as const;
const BAND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Platinum: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  "High Green": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  "Medium Green": { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" },
  "Low Green": { bg: "bg-lime-500/15", text: "text-lime-400", border: "border-lime-500/30" },
  Red: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
};

const BAND_AR: Record<string, string> = {
  Platinum: "بلاتيني",
  "High Green": "أخضر مرتفع",
  "Medium Green": "أخضر متوسط",
  "Low Green": "أخضر منخفض",
  Red: "أحمر",
};

const BAND_FR: Record<string, string> = { Platinum: "Platine", "High Green": "Vert élevé", "Medium Green": "Vert moyen", "Low Green": "Vert faible", Red: "Rouge" };

export default function NitaqatSection() {
  const { t, lang } = useLang();

  return (
    <section className="pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title={t.nitaqatSection.title}
          subtitle={t.nitaqatSection.subtitle}
          id="nitaqat"
        />

        {/* ── 4 KPI Cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { value: reservedCount, label: t.nitaqatSection.reservedCount, color: "text-red-400" },
            { value: taweenCount, label: t.nitaqatSection.taweenCount, color: "text-amber-400" },
            { value: sectorCount, label: t.nitaqatSection.sectorsWithParams, color: "text-accent-neon" },
            { value: bandCount, label: t.nitaqatSection.bandsCount, color: "text-purple-400" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-card rounded-xl p-5 border border-white/5 card-glow text-center"
            >
              <p className={`font-mono font-bold text-3xl ${kpi.color}`}>
                {formatNumber(kpi.value, lang)}
              </p>
              <p className="text-sm text-text-muted mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left: Tawteen Decisions Table ──────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-bg-card rounded-2xl p-6 border border-white/5 card-glow"
          >
            <h3 className="text-lg font-bold text-text-primary mb-4">
              {t.nitaqatSection.recentDecisions}
            </h3>

            <span className="text-[10px] text-text-muted mb-1 block md:hidden">{lang === "ar" ? "مرّر ←" : lang === "fr" ? "Défiler →" : "Scroll →"}</span>
            <div className="overflow-x-auto mobile-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-start text-xs text-text-muted uppercase py-2 px-2">
                      {t.nitaqatSection.profession}
                    </th>
                    <th className="text-start text-xs text-text-muted uppercase py-2 px-2">
                      {t.nitaqatSection.measure}
                    </th>
                    <th className="text-start text-xs text-text-muted uppercase py-2 px-2">
                      {t.nitaqatSection.effective}
                    </th>
                    <th className="text-start text-xs text-text-muted uppercase py-2 px-2">
                      {t.nitaqatSection.authority}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {latestDecisions.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-2.5 px-2 text-text-secondary">{localizedDecision(d, lang).title}</td>
                      <td className="py-2.5 px-2 text-amber-400">{localizedDecision(d, lang).summary}</td>
                      <td className="py-2.5 px-2 text-text-muted">
                        <time dateTime={d.effective!}>{d.effective}</time>
                      </td>
                      <td className="py-2.5 px-2 text-xs text-text-muted">{d.authority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href={localizedHref(lang, "/saudization-tracker")} className="inline-block mt-4 text-sm text-cyan-400 hover:underline">
              {t.nitaqatSection.fullTimeline} →
            </Link>
          </motion.div>

          {/* ── Right: Band Consequences ───────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-bg-card rounded-2xl p-6 border border-white/5 card-glow"
          >
            <h3 className="text-lg font-bold text-text-primary mb-4">
              {t.nitaqatSection.bandName}
            </h3>

            {/* Band consequences grid */}
            <span className="text-[10px] text-text-muted mb-1 block md:hidden">{lang === "ar" ? "مرّر ←" : lang === "fr" ? "Défiler →" : "Scroll →"}</span>
            <div className="overflow-x-auto mobile-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-start text-xs text-text-muted uppercase py-2 px-2">
                      {t.nitaqatSection.bandName}
                    </th>
                    <th className="text-center text-xs text-text-muted uppercase py-2 px-1">
                      {t.nitaqatSection.newVisas}
                    </th>
                    <th className="text-center text-xs text-text-muted uppercase py-2 px-1 hidden sm:table-cell">
                      {t.nitaqatSection.changeOccupations}
                    </th>
                    <th className="text-center text-xs text-text-muted uppercase py-2 px-1">
                      {t.nitaqatSection.renewPermits}
                    </th>
                    <th className="text-center text-xs text-text-muted uppercase py-2 px-1 hidden sm:table-cell">
                      {t.nitaqatSection.transferIn}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BAND_ORDER.map((band) => {
                    const bc = nitaqat.band_consequences[band];
                    if (!bc) return null;
                    const colors = BAND_COLORS[band];
                    return (
                      <tr
                        key={band}
                        className="border-b border-white/5"
                      >
                        <td className="py-2.5 px-2">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium border whitespace-nowrap ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {lang === "ar" ? BAND_AR[band] : lang === "fr" ? BAND_FR[band] : band}
                          </span>
                        </td>
                        <td className="py-2.5 px-1 text-center">
                          <BoolIcon value={bc.new_visas} yes={t.nitaqatSection.yes} no={t.nitaqatSection.no} />
                        </td>
                        <td className="py-2.5 px-1 text-center hidden sm:table-cell">
                          <BoolIcon value={bc.change_occupations} yes={t.nitaqatSection.yes} no={t.nitaqatSection.no} />
                        </td>
                        <td className="py-2.5 px-1 text-center">
                          <BoolIcon value={bc.renew_permits} yes={t.nitaqatSection.yes} no={t.nitaqatSection.no} />
                        </td>
                        <td className="py-2.5 px-1 text-center hidden sm:table-cell">
                          <BoolIcon value={bc.transfer_in} yes={t.nitaqatSection.yes} no={t.nitaqatSection.no} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Warning/Benefit callouts */}
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
                <p className="text-sm text-red-300">{t.nitaqatSection.redWarning}</p>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <span className="text-purple-400 text-lg flex-shrink-0">✦</span>
                <p className="text-sm text-purple-300">{t.nitaqatSection.platinumBenefit}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Tiny helper ──────────────────────────────────────── */
function BoolIcon({ value, yes, no }: { value: boolean; yes: string; no: string }) {
  return value ? (
    <span className="text-emerald-400 font-medium" title={yes}>✓</span>
  ) : (
    <span className="text-red-400 font-medium" title={no}>✕</span>
  );
}
