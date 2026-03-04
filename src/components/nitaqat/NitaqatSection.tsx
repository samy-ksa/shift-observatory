"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import { useLang, formatNumber } from "@/lib/i18n/context";
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
const taweenCount = nitaqat.tawteen_decisions_2024_2025.length;
const sectorCount = Object.keys(nitaqat.sector_parameters_2024).length;
const bandCount = Object.keys(nitaqat.band_consequences).length;

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

/* Tawteen profession AR mapping */
const TAWTEEN_PROFESSION_AR: Record<string, string> = {
  "Accountants": "المحاسبون",
  "Admin clerks": "الكتبة الإداريون",
  "HR specialists": "أخصائيو الموارد البشرية",
  "Marketing managers": "مديرو التسويق",
  "Sales representatives": "مندوبو المبيعات",
  "IT support": "دعم تقنية المعلومات",
  "Data entry operators": "مدخلو البيانات",
  "Customer service": "خدمة العملاء",
  "Procurement officers": "مسؤولو المشتريات",
  "Project coordinators": "منسقو المشاريع",
  "Warehouse supervisors": "مشرفو المستودعات",
  "Logistics coordinators": "منسقو الخدمات اللوجستية",
  "Receptionists": "موظفو الاستقبال",
  "Cashiers": "أمناء الصندوق",
  "Security guards": "حراس الأمن",
  "Drivers (light vehicles)": "سائقو المركبات الخفيفة",
  "Translators/Interpreters": "مترجمون",
  "Legal assistants": "مساعدون قانونيون",
  "Insurance agents": "وكلاء التأمين",
  "Travel agents": "وكلاء السفر",
};

/* Phase AR mapping */
const PHASE_AR: Record<string, string> = {
  "Phase 1": "المرحلة 1",
  "Phase 2": "المرحلة 2",
  "Phase 1-2": "المرحلة 1-2",
  "Current": "الحالي",
  "Enforced": "مطبق",
  "Regional": "إقليمي",
};

export default function NitaqatSection() {
  const { t, lang } = useLang();

  return (
    <section className="py-20 px-4">
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

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-start text-xs text-text-muted uppercase py-2 px-2">
                      {t.nitaqatSection.profession}
                    </th>
                    <th className="text-start text-xs text-text-muted uppercase py-2 px-2">
                      {t.nitaqatSection.quota}
                    </th>
                    <th className="text-start text-xs text-text-muted uppercase py-2 px-2 hidden sm:table-cell">
                      {t.nitaqatSection.effective}
                    </th>
                    <th className="text-start text-xs text-text-muted uppercase py-2 px-2 hidden md:table-cell">
                      {t.nitaqatSection.phase}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {nitaqat.tawteen_decisions_2024_2025.map((d, i) => (
                    <tr
                      key={d.profession + i}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-2.5 px-2 text-text-secondary">{lang === "ar" && TAWTEEN_PROFESSION_AR[d.profession] ? TAWTEEN_PROFESSION_AR[d.profession] : d.profession}</td>
                      <td className="py-2.5 px-2">
                        <span className="font-mono font-semibold text-amber-400">
                          {d.quota_pct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-text-muted hidden sm:table-cell">
                        {d.effective}
                      </td>
                      <td className="py-2.5 px-2 hidden md:table-cell">
                        <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-text-muted">
                          {lang === "ar" && PHASE_AR[d.phase] ? PHASE_AR[d.phase] : d.phase}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <div className="overflow-x-auto">
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
                            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            {lang === "ar" ? BAND_AR[band] : band}
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
