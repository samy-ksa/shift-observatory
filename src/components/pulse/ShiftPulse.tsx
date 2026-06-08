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
  US: "US",
  GB: "GB",
  DE: "DE",
  SE: "SE",
  SA: "SA",
  AE: "AE",
  QA: "QA",
  BH: "BH",
  KW: "KW",
  OM: "OM",
  IN: "IN",
  CN: "CN",
  JP: "JP",
  FR: "FR",
  CA: "CA",
  AU: "AU",
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
        const latest = d.latest;
        setPulse(latest);
        // Auto-select first tab with content so the dashboard isn't blank
        // when the week had no qualifying events in the default category.
        if (latest) {
          if ((latest.global_layoffs?.length ?? 0) > 0) setTab("global");
          else if ((latest.gulf_mena_automation?.length ?? 0) > 0) setTab("gulf");
          else if ((latest.saudi_policy_updates?.length ?? 0) > 0) setTab("policy");
          else if ((latest.ai_workforce_signals?.length ?? 0) > 0) setTab("signals");
        }
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
          {/* SkeletonTabBar — min-height prevents CLS when tabs load */}
          <div className="flex gap-1 bg-bg-secondary rounded-lg p-1 mb-6 overflow-x-auto" style={{ minHeight: "44px" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 h-8 bg-white/5 rounded-md animate-pulse" />
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

  /**
   * Smart empty state. Replaces the bare "No data" message with:
   *  - The weekly notable_trend summary if available (gives the user the week's
   *    headline even when this tab is silent),
   *  - Quick-switch buttons to OTHER tabs that DO have content this week,
   *  - The fallback "check back after Sunday" only if every tab is empty.
   */
  function EmptyTabState({ current }: { current: PulseTab }) {
    const others = tabs.filter((tb) => tb.key !== current && tb.count > 0);
    const trendSentence = stats?.notable_trend;
    if (others.length === 0 && !trendSentence) {
      // Genuinely empty week
      return (
        <p className="text-text-muted col-span-2 text-center py-12">
          {t.pulse.noData}
        </p>
      );
    }
    return (
      <div className="col-span-2 bg-bg-card/40 rounded-lg p-6 border border-white/5">
        {trendSentence && (
          <>
            <p className="text-xs uppercase tracking-wider text-accent-gold mb-2">
              {t.pulse.notableTrend}
            </p>
            <p className="text-sm md:text-base text-text-secondary mb-5 leading-relaxed">
              {trendSentence}
            </p>
          </>
        )}
        {others.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">
              {t.pulse.seeOtherTabs}
            </p>
            <div className="flex flex-wrap gap-2">
              {others.map((tb) => (
                <button
                  key={tb.key}
                  onClick={() => setTab(tb.key)}
                  className="text-xs bg-bg-secondary hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors min-h-11"
                >
                  {tb.label}{" "}
                  <span className="text-text-muted">({tb.count})</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="py-20 px-4" id="pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header with update date */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <SectionHeader title={t.pulse.title} subtitle={t.pulse.subtitle} id="pulse-header" />
          <span className="text-xs text-text-muted bg-bg-card px-3 py-1.5 rounded-full border border-white/5 mt-2 md:mt-0 self-start md:self-auto">
            {t.pulse.updated}: {pulse.report_date}
          </span>
        </div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
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
        <div
          role="tablist"
          aria-label="SHIFT Pulse sections"
          className="flex gap-1 bg-bg-secondary rounded-lg p-1 mb-6 overflow-x-auto mobile-scroll"
          style={{ minHeight: "44px" }}
        >
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              role="tab"
              aria-selected={tab === tabItem.key}
              aria-controls={`pulse-panel-${tabItem.key}`}
              id={`pulse-tab-${tabItem.key}`}
              onClick={() => { setTab(tabItem.key); setShowAll(false); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                tab === tabItem.key
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tabItem.label}
              {tabItem.count > 0 && (
                <span className="bg-white/10 text-xs px-1.5 py-0.5 rounded-full">
                  {tabItem.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={tab}
          role="tabpanel"
          id={`pulse-panel-${tab}`}
          aria-labelledby={`pulse-tab-${tab}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "global" && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pulse.global_layoffs.length === 0 ? (
                  <EmptyTabState current="global" />
                ) : (
                  (showAll ? pulse.global_layoffs : pulse.global_layoffs.slice(0, DEFAULT_VISIBLE)).map((item: PulseGlobalLayoff, i: number) => (
                    <div
                      key={i}
                      className="bg-bg-card rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {COUNTRY_FLAGS[item.country] || "--"}
                          </span>
                          <h3 className="font-semibold text-text-primary text-base">
                            {item.company}
                          </h3>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pulse.gulf_mena_automation.length === 0 ? (
                  <EmptyTabState current="gulf" />
                ) : (
                  (showAll ? pulse.gulf_mena_automation : pulse.gulf_mena_automation.slice(0, DEFAULT_VISIBLE)).map((item: PulseGulfEvent, i: number) => (
                    <div
                      key={i}
                      className="bg-bg-card rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {COUNTRY_FLAGS[item.country] || "--"}
                          </span>
                          <h3 className="font-semibold text-text-primary text-base">
                            {item.company}
                          </h3>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pulse.saudi_policy_updates.length === 0 ? (
                  <EmptyTabState current="policy" />
                ) : (
                  (showAll ? pulse.saudi_policy_updates : pulse.saudi_policy_updates.slice(0, DEFAULT_VISIBLE)).map((item: PulsePolicyUpdate, i: number) => (
                    <div
                      key={i}
                      className="bg-bg-card rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-text-primary flex-1 text-base">
                          {item.title}
                        </h3>
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
                  <EmptyTabState current="signals" />
                ) : (
                  (showAll ? pulse.ai_workforce_signals : pulse.ai_workforce_signals.slice(0, DEFAULT_VISIBLE)).map((item: PulseSignal, i: number) => (
                    <div
                      key={i}
                      className="bg-bg-card rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-text-primary flex-1 text-base">
                          {item.headline}
                        </h3>
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
        <div className="text-center mt-8">
          <p className="text-xs text-text-muted">{t.pulse.source}</p>
        </div>
      </div>
    </section>
  );
}
