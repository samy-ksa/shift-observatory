"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import RiskBadge from "@/components/shared/RiskBadge";
import { riskColor, scoreToCategory } from "@/lib/utils";
import { useLang, formatNumber } from "@/lib/i18n/context";
import data from "@/data/master.json";

const employers = data.top_employers;

// Employer domain mapping for Google Favicon API
const employerDomains: Record<string, string> = {
  "Saudi Binladin Group": "sbg.com.sa",
  "Saudi Aramco": "aramco.com",
  Almarai: "almarai.com",
  SABIC: "sabic.com",
  "Nesma Holding": "nesma.com",
  SEC: "se.com.sa",
  "Saudia Airlines": "saudia.com",
  stc: "stc.com.sa",
  "Al Rajhi Bank": "alrajhibank.com.sa",
  "Al Othaim Markets": "othaim.com",
  SNB: "alahli.com",
  "Savola/Panda": "savola.com",
  "Olayan Group": "olayan.com",
  SMEH: "smeh.com",
  Aldrees: "aldrees.com",
  "Saudi Ground Services": "sgs.com.sa",
  "Zamil Industrial": "zamil.com",
  "Abdul Latif Jameel": "alj.com",
  BinDawood: "bindawood.com",
  "Dr. Sulaiman Al Habib": "drsulaimanalhabib.com",
  "Panda Retail": "panda.com.sa",
  "Fawaz Al Hokair Group": "fawazalhokair.com",
  "Al Muhaidib Group": "almuhaidib.com",
  "Dallah Healthcare": "dallahhealth.com",
  "Ma'aden": "maaden.com.sa",
  "Jarir Marketing": "jarir.com",
  "Zahid Group": "zahid.com",
  "Riyad Bank": "riyadbank.com",
  "SAPTCO": "saptco.com.sa",
  "Bupa Arabia": "bupa.com.sa",
  "ACWA Power": "acwapower.com",
  "Sadara Chemical": "sadara.com",
  "BSF (Banque Saudi Fransi)": "alfransi.com.sa",
  "Mobily": "mobily.com.sa",
  "United Electronics (eXtra)": "extrastores.com",
  "Flynas": "flynas.com",
  "Seera Group": "seera.sa",
  "SACO": "sfrstore.com",
  "Al Tayyar Travel": "altayyargroup.com",
  "Zain KSA": "sa.zain.com",
};

// Sector-based colors for initials (guaranteed fallback)
const sectorColors: Record<string, string> = {
  Construction: "#10B981",
  "Oil & Gas": "#3B82F6",
  FMCG: "#F59E0B",
  Petrochemicals: "#6366F1",
  Utilities: "#14B8A6",
  Aviation: "#8B5CF6",
  Telecom: "#06B6D4",
  Banking: "#F97316",
  Retail: "#EC4899",
  Conglomerate: "#6B7280",
  "Medical Equipment": "#A855F7",
  "Fuel/Transport": "#F97316",
  "Airport Services": "#8B5CF6",
  Manufacturing: "#EAB308",
  Healthcare: "#10B981",
  "FMCG/Retail": "#F59E0B",
  Insurance: "#EF4444",
  Mining: "#A78BFA",
  Travel: "#F97316",
  "Travel/Tourism": "#F97316",
  Transport: "#14B8A6",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function EmployerLogo({
  name,
  sector,
}: {
  name: string;
  sector: string;
}) {
  const [imgError, setImgError] = useState(false);
  const domain = employerDomains[name];
  const color = sectorColors[sector] || "#3B82F6";
  const initials = getInitials(name);

  const InitialsFallback = () => (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
      style={{
        backgroundColor: color + "20",
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {initials}
    </div>
  );

  if (!domain || imgError) {
    return <InitialsFallback />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt=""
      className="w-9 h-9 rounded-lg bg-white/10 object-contain p-1 shrink-0"
      onError={() => setImgError(true)}
    />
  );
}

const sectorRiskMap: Record<string, number> = {
  Construction: 12,
  "Oil & Gas": 35,
  FMCG: 28,
  Petrochemicals: 35,
  Utilities: 30,
  Aviation: 38,
  Telecom: 45,
  Banking: 62,
  Retail: 55,
  Conglomerate: 40,
  "Medical Equipment": 35,
  "Fuel/Transport": 38,
  "Airport Services": 38,
  Manufacturing: 42,
  Healthcare: 15,
  "FMCG/Retail": 42,
  Insurance: 55,
  Mining: 25,
  Travel: 50,
  "Travel/Tourism": 50,
  Transport: 35,
};

/* AR mapping for employer sectors */
const EMPLOYER_SECTOR_AR: Record<string, string> = {
  "Construction": "البناء والتشييد",
  "Oil & Gas": "النفط والغاز",
  "FMCG": "السلع الاستهلاكية",
  "Petrochemicals": "البتروكيماويات",
  "Utilities": "المرافق",
  "Aviation": "الطيران",
  "Telecom": "الاتصالات",
  "Banking": "البنوك",
  "Retail": "التجزئة",
  "Conglomerate": "تكتلات",
  "Medical Equipment": "المعدات الطبية",
  "Fuel/Transport": "الوقود/النقل",
  "Airport Services": "خدمات المطارات",
  "Manufacturing": "الصناعات التحويلية",
  "Healthcare": "الرعاية الصحية",
  "FMCG/Retail": "استهلاكية/تجزئة",
  "Insurance": "التأمين",
  "Mining": "التعدين",
  "Travel": "السفر",
  "Travel/Tourism": "السفر/السياحة",
  "Transport": "النقل",
};

type SortKey = "rank" | "employees" | "risk" | "name";

export default function EmployerTable() {
  const { t, lang } = useLang();
  const [sortKey, setSortKey] = useState<SortKey>("employees");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterSector, setFilterSector] = useState<string>("all");

  const allSectors = useMemo(
    () => Array.from(new Set(employers.map((e) => e.sector))).sort(),
    []
  );

  const sorted = useMemo(() => {
    let list = [...employers];
    if (filterSector !== "all") {
      list = list.filter((e) => e.sector === filterSector);
    }
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "rank":
          cmp = a.rank - b.rank;
          break;
        case "employees":
          cmp = a.employees - b.employees;
          break;
        case "risk":
          cmp =
            (sectorRiskMap[a.sector] || 40) - (sectorRiskMap[b.sector] || 40);
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [sortKey, sortAsc, filterSector]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "rank" || key === "name");
    }
  };

  const maxEmployees = Math.max(...employers.map((e) => e.employees));

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => (
    <span
      className={`${lang === "ar" ? "mr-1" : "ml-1"} ${active ? "text-accent-primary" : "text-text-muted/30"}`}
    >
      {active ? (asc ? "\u25B2" : "\u25BC") : "\u25B4"}
    </span>
  );

  const empSector = (emp: { sector: string; sector_ar?: string }) =>
    lang === "ar"
      ? (emp.sector_ar || EMPLOYER_SECTOR_AR[emp.sector] || emp.sector)
      : emp.sector;

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title={t.employers.title}
          subtitle={t.employers.subtitle}
          id="employers"
        />

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="bg-bg-card border border-white/10 rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary/50"
          >
            <option value="all">{t.employers.allSectors}</option>
            {allSectors.map((s) => (
              <option key={s} value={s}>
                {lang === "ar" && EMPLOYER_SECTOR_AR[s] ? EMPLOYER_SECTOR_AR[s] : s}
              </option>
            ))}
          </select>
          <span className="text-xs text-text-muted">
            {sorted.length} {t.employers.countLabel}
          </span>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-bg-card rounded-lg card-glow overflow-hidden"
        >
          <span className="text-[10px] text-gray-500 mb-1 block md:hidden px-4 pt-2">Scroll →</span>
          <div className="overflow-x-auto mobile-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {[
                    { key: "rank" as SortKey, label: t.employers.headers.rank, width: "w-12" },
                    { key: "name" as SortKey, label: t.employers.headers.company, width: "" },
                    {
                      key: "employees" as SortKey,
                      label: t.employers.headers.sector,
                      width: "w-28",
                    },
                    {
                      key: "employees" as SortKey,
                      label: t.employers.headers.employees,
                      width: "w-28",
                    },
                    { key: "risk" as SortKey, label: t.employers.headers.risk, width: "w-28" },
                  ].map((col, i) => (
                    <th
                      key={i}
                      className={`${lang === "ar" ? "text-right" : "text-left"} px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors ${col.width}${i === 1 ? " sticky left-0 z-10 bg-bg-card" : ""}`}
                      onClick={() =>
                        i !== 2 ? handleSort(col.key) : undefined
                      }
                    >
                      {col.label}
                      {i !== 2 && (
                        <SortIcon
                          active={sortKey === col.key}
                          asc={sortAsc}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((emp) => {
                  const risk = sectorRiskMap[emp.sector] || 40;
                  const color = riskColor(scoreToCategory(risk));
                  const barWidth = (emp.employees / maxEmployees) * 100;

                  return (
                    <tr
                      key={emp.rank}
                      className="border-b border-white/5 hover:bg-bg-card-hover transition-colors relative"
                    >
                      <td className="px-4 py-3 font-mono text-text-muted text-xs">
                        {emp.rank}
                      </td>
                      <td className="px-4 py-3 relative sticky left-0 z-10 bg-bg-card">
                        {/* Background bar */}
                        <div
                          className="absolute inset-y-0 left-0 opacity-[0.07] rounded-r"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: color,
                          }}
                        />
                        <div className="relative flex items-center gap-3">
                          <EmployerLogo name={emp.name} sector={emp.sector} />
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary">
                              {emp.name}
                            </span>
                            {emp.tadawul && (
                              <span
                                className="text-[10px] text-accent-gold font-mono"
                                title={t.employers.tadawul}
                              >
                                T
                              </span>
                            )}
                            {emp.estimate && (
                              <span
                                className="text-[10px] text-text-muted"
                                title={t.employers.estimatedNote}
                              >
                                *
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs">
                        {empSector(emp as { sector: string; sector_ar?: string })}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-text-primary">
                        {formatNumber(emp.employees, lang)}
                        {emp.rank === 1 && "+"}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge
                          category={scoreToCategory(risk)}
                          score={risk}
                          size="sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-white/5 flex flex-wrap gap-4 text-xs text-text-muted">
            <span><span className="text-[10px] text-accent-gold font-mono">T</span> = {t.employers.tadawul}</span>
            <span>{t.employers.estimatedNote}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
