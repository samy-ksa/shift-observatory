"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import { useLang, formatNumber } from "@/lib/i18n/context";
import data from "@/data/master.json";

const v2030 = data.v2030;
const hero = data.hero;

const confidenceOpacity: Record<string, number> = {
  high: 1,
  medium: 0.8,
  low: 0.6,
};

/* V2030 sector label AR mapping */
const V2030_SECTOR_AR: Record<string, string> = {
  "Tourism": "السياحة",
  "Entertainment": "الترفيه",
  "Renewable Energy": "الطاقة المتجددة",
  "Mining & Metals": "التعدين والمعادن",
  "Manufacturing (NIDLP)": "التصنيع (نيدلب)",
  "Digital Economy": "الاقتصاد الرقمي",
  "Financial Services": "الخدمات المالية",
  "Healthcare Expansion": "التوسع الصحي",
  "Logistics & Transport": "اللوجستيات والنقل",
  "Construction (Giga)": "البناء (المشاريع الكبرى)",
  "Agriculture & Food": "الزراعة والغذاء",
  "Education Reform": "إصلاح التعليم",
};

// Timeline projection data (2024 → 2030)
const timelineData = [
  { year: "2024", created: 200000, exposed: 2800000 },
  { year: "2025", created: 450000, exposed: 3200000 },
  { year: "2026", created: 800000, exposed: 3500000 },
  { year: "2027", created: 1200000, exposed: 3800000 },
  { year: "2028", created: 1600000, exposed: 4100000 },
  { year: "2029", created: 2000000, exposed: 4300000 },
  { year: "2030", created: 2304400, exposed: 4450778 },
];

type TabView = "sectors" | "timeline";

export default function ParadoxChart() {
  const { t, lang } = useLang();
  const totalCreated = v2030.summary.total_net_estimate;
  const totalExposed = hero.jobs_ai_exposure_weighted;
  const gap = totalExposed - totalCreated;
  const [view, setView] = useState<TabView>("sectors");

  const chartData = v2030.targets
    .map((tgt) => ({
      name:
        lang === "ar"
          ? (V2030_SECTOR_AR[tgt.sector] || (tgt as { sector_ar?: string }).sector_ar || tgt.sector)
          : tgt.sector,
      jobs: tgt.target_jobs,
      confidence: tgt.confidence,
      nameEn: tgt.sector,
    }))
    .sort((a, b) => b.jobs - a.jobs);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const item = chartData.find((d) => d.name === label);
    return (
      <div className="bg-bg-card border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-text-primary mb-1">{label}</p>
        <p className="text-sm font-mono text-accent-gold">
          +{formatNumber(payload[0].value, lang)} jobs
        </p>
        {item && (
          <p className="text-xs text-text-muted mt-1">
            {t.v2030.confidence}: {item.confidence}
          </p>
        )}
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TimelineTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-bg-card border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-semibold text-text-primary mb-2">{label}</p>
        {payload.map((p: { name: string; value: number; color: string }) => (
          <p
            key={p.name}
            className="text-sm font-mono"
            style={{ color: p.color }}
          >
            {p.name === "created" ? t.v2030.created : t.v2030.exposed}:{" "}
            {(p.value / 1_000_000).toFixed(2)}M
          </p>
        ))}
        {payload.length >= 2 && (
          <p className="text-sm font-mono text-orange-400 mt-1 border-t border-white/10 pt-1">
            {t.v2030.gapLabel}: -
            {((payload[1].value - payload[0].value) / 1_000_000).toFixed(2)}M
          </p>
        )}
      </div>
    );
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title={t.v2030.title}
          subtitle={t.v2030.subtitle}
          id="v2030"
        />

        {/* Comparison Bars: 2.3M vs 4.45M */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          {/* Created */}
          <div className="bg-bg-card rounded-xl p-5 card-glow">
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-mono text-accent-gold font-bold">
                <AnimatedNumber
                  value={totalCreated}
                  formatFn={(n) => (n / 1_000_000).toFixed(1) + "M"}
                />
              </span>
              <span className="text-text-muted text-sm pb-1">
                {t.v2030.created}
              </span>
            </div>
            <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${Math.round((totalCreated / totalExposed) * 100)}%`,
                }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
              />
            </div>
            <p className="text-xs text-text-muted mt-2">
              {t.v2030.createdSubtitle}
            </p>
          </div>

          {/* Exposed */}
          <div className="bg-bg-card rounded-xl p-5 card-glow">
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-mono text-risk-very-high font-bold">
                <AnimatedNumber
                  value={totalExposed}
                  formatFn={(n) => (n / 1_000_000).toFixed(1) + "M"}
                />
              </span>
              <span className="text-text-muted text-sm pb-1">
                {t.v2030.exposed}
              </span>
            </div>
            <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
              />
            </div>
            <p className="text-xs text-text-muted mt-2">
              {t.v2030.exposedSubtitle}
            </p>
          </div>
        </motion.div>

        {/* Gap Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10 bg-bg-card rounded-xl p-6 card-glow border border-orange-500/10"
        >
          <span className="text-5xl md:text-6xl font-mono font-bold text-orange-400">
            -
            <AnimatedNumber
              value={gap}
              formatFn={(n) => (n / 1_000_000).toFixed(2) + "M"}
            />
          </span>
          <p className="text-text-muted text-sm mt-2">{t.v2030.gap}</p>
        </motion.div>

        {/* View Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-1 bg-bg-secondary rounded-lg p-1">
            <button
              onClick={() => setView("sectors")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === "sectors"
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t.v2030.tabs.sector}
            </button>
            <button
              onClick={() => setView("timeline")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === "timeline"
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t.v2030.tabs.timeline}
            </button>
          </div>
        </div>

        {/* Charts */}
        {view === "sectors" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-bg-card rounded-2xl p-4 md:p-6 card-glow mb-8"
          >
            <div className="h-[500px] md:h-[550px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 60, bottom: 10, left: 10 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    axisLine={{ stroke: "#374151" }}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1_000_000
                        ? (v / 1_000_000).toFixed(1) + "M"
                        : v >= 1_000
                          ? (v / 1_000).toFixed(0) + "K"
                          : String(v)
                    }
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={160}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="jobs" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill="#D4AF37"
                        fillOpacity={
                          confidenceOpacity[entry.confidence] || 0.8
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-accent-gold" />{" "}
                {t.v2030.created}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card rounded-2xl p-4 md:p-6 card-glow mb-8"
          >
            <h3 className="text-lg font-bold text-text-primary mb-4">
              {t.v2030.tabs.timeline}
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData}
                  margin={{ top: 10, right: 30, bottom: 10, left: 20 }}
                >
                  <defs>
                    <linearGradient
                      id="gradCreated"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#D4AF37"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient
                      id="gradExposed"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#EF4444"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    axisLine={{ stroke: "#374151" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v / 1_000_000).toFixed(1) + "M"}
                  />
                  <Tooltip content={<TimelineTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="exposed"
                    stroke="#EF4444"
                    strokeWidth={2}
                    fill="url(#gradExposed)"
                    name="exposed"
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fill="url(#gradCreated)"
                    name="created"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-accent-gold" />{" "}
                {t.v2030.created}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-risk-very-high" />{" "}
                {t.v2030.exposed}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-400/30" /> {t.v2030.gapLabel}
              </span>
            </div>
          </motion.div>
        )}

        {/* Caveat */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-bg-secondary/50 rounded-xl p-5 border border-white/5"
        >
          <p className="text-sm text-text-muted leading-relaxed">
            {t.v2030.note}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
