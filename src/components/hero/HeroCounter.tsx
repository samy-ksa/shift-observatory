"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import Toggle from "@/components/shared/Toggle";
import InfoTooltip from "@/components/shared/InfoTooltip";
import { useLang } from "@/lib/i18n/context";
import data from "@/data/master.json";

const hero = data.hero;

export default function HeroCounter() {
  const { t } = useLang();
  const [saudiOnly, setSaudiOnly] = useState(false);

  const mainNumber = saudiOnly
    ? hero.jobs_ai_exposure_saudi
    : hero.jobs_ai_exposure_weighted;

  const kpis = [
    {
      key: "gosi",
      value: hero.total_workforce_gosi,
      label: t.hero.kpi.gosi.label,
      tooltip: t.hero.kpi.gosi.tooltip,
      format: (n: number) => (n / 1_000_000).toFixed(2) + "M",
      color: "text-cyan-400",
    },
    {
      key: "saudi",
      value: hero.pct_saudi_gosi,
      label: t.hero.kpi.saudi.label,
      tooltip: t.hero.kpi.saudi.tooltip,
      format: (n: number) => n + "%",
      noAnimate: true,
      color: "text-emerald-400",
    },
    {
      key: "unemployment",
      value: hero.unemployment_saudi,
      label: t.hero.kpi.unemployment.label,
      tooltip: t.hero.kpi.unemployment.tooltip,
      format: (n: number) => n + "%",
      noAnimate: true,
      color: "text-amber-400",
    },
    {
      key: "gdp",
      value: hero.ai_gdp_impact_2030_usd,
      label: t.hero.kpi.gdp.label,
      tooltip: t.hero.kpi.gdp.tooltip,
      format: (n: number) => "$" + (n / 1_000_000_000).toFixed(0) + "B",
      color: "text-purple-400",
    },
    {
      key: "layoffs",
      value: hero.layoffs_ai_cited_us_2025,
      label: t.hero.kpi.layoffs.label,
      tooltip: t.hero.kpi.layoffs.tooltip,
      format: (n: number) => n.toLocaleString("en-US"),
      color: "text-red-400",
    },
    {
      key: "v2030",
      value: hero.v2030_jobs_target_net,
      label: t.hero.kpi.v2030.label,
      tooltip: t.hero.kpi.v2030.tooltip,
      format: (n: number) => (n / 1_000_000).toFixed(1) + "M",
      color: "text-yellow-400",
    },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-neon/5 blur-[120px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/3 blur-[100px] animate-pulse" />

      <div className="relative z-10 text-center max-w-4xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-lg font-semibold tracking-[0.3em] text-text-secondary uppercase">
            SHIFT Observatory
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {t.hero.title}
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <Toggle
            value={saudiOnly}
            onChange={setSaudiOnly}
            labelLeft={t.hero.toggleEveryone}
            labelRight={t.hero.toggleSaudi}
          />
        </motion.div>

        {/* Main Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-accent-neon text-glow-neon font-mono font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight">
            <AnimatedNumber
              key={saudiOnly ? "saudi" : "all"}
              value={mainNumber}
              duration={2000}
            />
          </div>
          <p className="text-text-secondary text-lg md:text-xl mt-4 max-w-lg mx-auto">
            {t.hero.subtitle}
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="my-10 h-px bg-gradient-to-r from-transparent via-text-muted/30 to-transparent max-w-2xl mx-auto"
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1, duration: 0.4 }}
              className="bg-bg-card/60 backdrop-blur rounded-md p-3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-200 cursor-default card-hover-lift"
            >
              <div className={`text-xl md:text-2xl font-mono font-bold ${kpi.color}`}>
                {kpi.noAnimate ? (
                  kpi.format(kpi.value)
                ) : (
                  <AnimatedNumber
                    value={kpi.value}
                    duration={1500}
                    formatFn={kpi.format}
                  />
                )}
              </div>
              <div className="text-xs text-text-muted mt-1 leading-tight">
                {kpi.label}
                <InfoTooltip text={kpi.tooltip} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-text-muted"
          >
            <svg
              className="w-6 h-6 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
