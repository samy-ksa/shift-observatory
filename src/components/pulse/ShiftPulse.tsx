"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import { useLang, formatNumber } from "@/lib/i18n/context";
import type {
  PulseData,
  PulseGlobalLayoff,
  PulseGulfEvent,
  PulsePolicyUpdate,
  PulseSignal,
} from "@/lib/data-types";

type PulseTab = "global" | "gulf" | "policy" | "signals";

const DEFAULT_VISIBLE = 6;

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  SE: "🇸🇪",
  SA: "🇸🇦",
  AE: "🇦🇪",
  QA: "🇶🇦",
  BH: "🇧🇭",
  KW: "🇰🇼",
  OM: "🇴🇲",
  IN: "🇮🇳",
  CN: "🇨🇳",
  JP: "🇯🇵",
  FR: "🇫🇷",
  CA: "🇨🇦",
  AU: "🇦🇺",
};

export default function ShiftPulse() {
  const { t, lang } = useLang();
  const [pulse, setPulse] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PulseTab>("global");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/pulse")
      .then((r) => r.json())
      .then((d) => {
        setPulse(d.latest);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const aiRoleLabel = (role: string) => {
    if (role === "direct") return t.pulse.direct;
    if (role === "contributing") return t.pulse.contributing;
    return t.pulse.suspected;
  };

  const aiRoleColor = (role: string) => {
    if (role === "direct") return "bg-red-500/20 text-red-400";
    if (role === "contributing") return "bg-orange-500/20 text-orange-400";
    return "bg-yellow-500/20 text-yellow-400";
  };

  const trendIcon = (trend: string) => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  const trendColor = (trend: string) => {
    if (trend === "up") return "text-red-400";
    if (trend === "down") return "text-emerald-400";
    return "text-text-muted";
  };

  const trendLabel = (trend: string) => {
    if (trend === "up") return t.pulse.trendUp;
    if (trend === "down") return t.pulse.trendDown;
    return t.pulse.trendStable;
  };

  const relevanceColor = (rel: string) => {
    if (rel === "direct") return "bg-red-500/20 text-red-400";
    if (rel === "indirect") return "bg-orange-500/20 text-orange-400";
    return "bg-blue-500/20 text-blue-400";
  };

  const policyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      nitaqat: "bg-emerald-500/20 text-emerald-400",
      tawteen: "bg-blue-500/20 text-blue-400",
      hrdf: "bg-purple-500/20 text-purple-400",
      sdaia: "bg-cyan-500/20 text-cyan-400",
      labor_law: "bg-orange-500/20 text-orange-400",
      other: "bg-gray-500/20 text-gray-400",
    };
    return colors[type] || colors.other;
  };

  // Skeleton loading
  if (loading) {
    return (
      <section className="py-20 px-4" id="pulse">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title={t.pulse.title} subtitle={t.pulse.subtitle} id="pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-bg-card rounded-lg p-3 border border-white/5 animate-pulse">
                <div className="h-7 bg-white/5 rounded mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
          <div className="bg-bg-card rounded-lg p-4 border border-white/5 animate-pulse">
            <div className="h-40 bg-white/5 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (!pulse) {
    return (
      <section className="py-20 px-4" id="pulse">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title={t.pulse.title} subtitle={t.pulse.subtitle} id="pulse" />
          <div className="bg-bg-card rounded-lg p-8 text-center border border-white/5">
            <p className="text-text-muted">{t.pulse.noData}</p>
          </div>
        </div>
      </section>
    );
  }

  const stats = pulse.weekly_stats;
  const tabs: { key: PulseTab; label: string; count: number }[] = [
    { key: "global", label: t.pulse.tabs.global, count: pulse.global_layoffs.length },
    { key: "gulf", label: t.pulse.tabs.gulf, count: pulse.gulf_mena_automation.length },
    { key: "policy", label: t.pulse.tabs.policy, count: pulse.saudi_policy_updates.length },
    { key: "signals", label: t.pulse.tabs.signals, count: pulse.ai_workforce_signals.length },
  ];

  return (
    <section className="py-20 px-4" id="pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header with update date */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <SectionHeader title={t.pulse.title} subtitle={t.pulse.subtitle} id="pulse-header" />
          <span className="text-xs text-text-muted bg-bg-card px-3 py-1.5 rounded-full border border-white/5 mt-2 md:mt-0 self-start md:self-auto">
            ⚡ {t.pulse.updated}: {pulse.report_date}
          </span>
        </div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {/* Global layoffs */}
          <div className="bg-bg-card rounded-lg p-3 border border-white/5">
            <span className="text-2xl font-mono font-bold text-risk-very-high">
              {formatNumber(stats.total_global_layoffs_this_week, lang)}
            </span>
            <p className="text-xs text-text-muted mt-1">{t.pulse.globalLayoffs}</p>
          </div>

          {/* AI-cited */}
          <div className="bg-bg-card rounded-lg p-3 border border-white/5">
            <span className="text-2xl font-mono font-bold text-orange-400">
              {formatNumber(stats.total_ai_cited_this_week, lang)}
            </span>
            <p className="text-xs text-text-muted mt-1">{t.pulse.aiCited}</p>
          </div>

          {/* Gulf events */}
          <div className="bg-bg-card rounded-lg p-3 border border-white/5">
            <span className="text-2xl font-mono font-bold text-accent-gold">
              {formatNumber(stats.total_gulf_events_this_week, lang)}
            </span>
            <p className="text-xs text-text-muted mt-1">{t.pulse.gulfEvents}</p>
          </div>

          {/* Trend */}
          <div className="bg-bg-card rounded-lg p-3 border border-white/5">
            <span className={`text-2xl font-mono font-bold ${trendColor(stats.trend_vs_last_week)}`}>
              {trendIcon(stats.trend_vs_last_week)} {trendLabel(stats.trend_vs_last_week)}
            </span>
            <p className="text-xs text-text-muted mt-1">{t.pulse.trend}</p>
          </div>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-bg-secondary rounded-lg p-1 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setShowAll(false); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                tab === t.key
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="bg-white/10 text-xs px-1.5 py-0.5 rounded-full">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "global" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {pulse.global_layoffs.length === 0 ? (
                  <p className="text-text-muted col-span-2 text-center py-8">{t.pulse.noData}</p>
                ) : (
                  (showAll ? pulse.global_layoffs : pulse.global_layoffs.slice(0, DEFAULT_VISIBLE)).map((item: PulseGlobalLayoff, i: number) => (
                    <div
                      key={i}
                      className="bg-bg-card rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {COUNTRY_FLAGS[item.country] || "🌍"}
                          </span>
                          <h4 className="font-semibold text-text-primary">
                            {item.company}
                          </h4>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${aiRoleColor(item.ai_role)}`}>
                          {aiRoleLabel(item.ai_role)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-risk-very-high font-mono font-bold text-lg">
                          -{formatNumber(item.jobs_cut, lang)}
                        </span>
                        <span className="text-text-muted text-xs">{t.pulse.jobs}</span>
                        {item.jobs_cut_estimated && (
                          <span className="text-xs text-text-muted">{t.pulse.estimated}</span>
                        )}
                        <span className="text-xs bg-bg-secondary px-2 py-0.5 rounded text-text-muted">
                          {item.sector}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>{item.source}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {pulse.global_layoffs.length > DEFAULT_VISIBLE && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showAll ? t.layoffs.showLess : `${t.layoffs.showAll} (${pulse.global_layoffs.length})`}
                  </button>
                </div>
              )}
            </>
          )}

          {tab === "gulf" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {pulse.gulf_mena_automation.length === 0 ? (
                  <p className="text-text-muted col-span-2 text-center py-8">{t.pulse.noData}</p>
                ) : (
                  (showAll ? pulse.gulf_mena_automation : pulse.gulf_mena_automation.slice(0, DEFAULT_VISIBLE)).map((item: PulseGulfEvent, i: number) => (
                    <div
                      key={i}
                      className="bg-bg-card rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {COUNTRY_FLAGS[item.country] || "🌍"}
                          </span>
                          <h4 className="font-semibold text-text-primary">
                            {item.company}
                          </h4>
                        </div>
                        <span className="text-xs bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded-full font-medium">
                          {(() => {
                            const eventMap: Record<string, string> = {
                              layoff: t.pulse.eventLayoff,
                              automation_deployment: t.pulse.eventAutomation,
                              ai_replacement: t.pulse.eventAiReplacement,
                              restructuring: t.pulse.eventRestructuring,
                            };
                            return eventMap[item.event_type] || item.event_type.replace(/_/g, " ");
                          })()}
                        </span>
                      </div>
                      {item.jobs_affected > 0 && (
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-orange-400 font-mono font-bold text-lg">
                            ~{formatNumber(item.jobs_affected, lang)}
                          </span>
                          <span className="text-text-muted text-xs">{t.pulse.jobs}</span>
                          <span className="text-xs bg-bg-secondary px-2 py-0.5 rounded text-text-muted">
                            {item.sector}
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-text-secondary mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>{item.source}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {pulse.gulf_mena_automation.length > DEFAULT_VISIBLE && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showAll ? t.layoffs.showLess : `${t.layoffs.showAll} (${pulse.gulf_mena_automation.length})`}
                  </button>
                </div>
              )}
            </>
          )}

          {tab === "policy" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {pulse.saudi_policy_updates.length === 0 ? (
                  <p className="text-text-muted col-span-2 text-center py-8">{t.pulse.noData}</p>
                ) : (
                  (showAll ? pulse.saudi_policy_updates : pulse.saudi_policy_updates.slice(0, DEFAULT_VISIBLE)).map((item: PulsePolicyUpdate, i: number) => (
                    <div
                      key={i}
                      className="bg-bg-card rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-text-primary flex-1">
                          {item.title}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lang === "ar" ? "mr-2" : "ml-2"} ${policyTypeColor(item.type)}`}>
                          {item.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>{item.source}</span>
                        <span>
                          {item.effective_date
                            ? `${t.pulse.effectiveDate}: ${item.effective_date}`
                            : item.date_announced}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {pulse.saudi_policy_updates.length > DEFAULT_VISIBLE && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showAll ? t.layoffs.showLess : `${t.layoffs.showAll} (${pulse.saudi_policy_updates.length})`}
                  </button>
                </div>
              )}
            </>
          )}

          {tab === "signals" && (
            <>
              <div className="grid gap-4">
                {pulse.ai_workforce_signals.length === 0 ? (
                  <p className="text-text-muted text-center py-8">{t.pulse.noData}</p>
                ) : (
                  (showAll ? pulse.ai_workforce_signals : pulse.ai_workforce_signals.slice(0, DEFAULT_VISIBLE)).map((item: PulseSignal, i: number) => (
                    <div
                      key={i}
                      className="bg-bg-card rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-text-primary flex-1">
                          {item.headline}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lang === "ar" ? "mr-2" : "ml-2"} whitespace-nowrap ${relevanceColor(item.relevance_to_ksa)}`}>
                          {item.relevance_to_ksa === "direct"
                            ? t.pulse.relevanceDirect
                            : item.relevance_to_ksa === "indirect"
                              ? t.pulse.relevanceIndirect
                              : t.pulse.relevanceContextual}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>{item.source}</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {pulse.ai_workforce_signals.length > DEFAULT_VISIBLE && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showAll ? t.layoffs.showLess : `${t.layoffs.showAll} (${pulse.ai_workforce_signals.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Source attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="text-xs text-text-muted">{t.pulse.source}</p>
        </motion.div>
      </div>
    </section>
  );
}
