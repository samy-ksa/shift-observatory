/** Centralized data types for SHIFT Observatory V2 */

export interface HRDFProgram {
  name: string;
  name_ar: string;
  type: string;
  relevance: string;
}

export interface Occupation {
  rank: number;
  name_en: string;
  name_ar: string;
  name_fr?: string;
  eloundou: number;
  frey_osborne: number;
  felten: string;
  category: string;
  composite: number;
  wef_trend?: string;
  nitaqat_risk?: string;
  ksa_relevance: string;
  salary_entry_sar?: number;
  salary_median_sar?: number;
  salary_senior_sar?: number;
  salary_source?: string;
  nitaqat_status?: "reserved_saudi_only" | "sector_quota";
  demand_rank_2024?: number;
  hrdf_programs?: HRDFProgram[];
  /* Career Transition Recommender fields (emerging occupations) */
  emerging?: boolean;
  emerged_year?: number;
  transition_from?: string[];
  training_path?: string[];
  skills_required?: string[];
  description_en?: string;
  description_ar?: string;
  /* Treemap employment data (GASTAT/GOSI estimates) */
  employment_est?: number;
  sector_id?: string;
  employment_saudi_pct?: number;
}

export interface TaweenDecision {
  profession: string;
  quota_pct: number;
  phase: string;
  effective: string;
  note: string;
}

export interface SalaryContext {
  saudi_avg_monthly: number;
  nonsaudi_avg_monthly: number;
  overall_avg_monthly: number;
  minimum_wage_saudi: number;
  source: string;
}

/* ── SHIFT Pulse types ── */

export interface PulseGlobalLayoff {
  company: string;
  country: string;
  sector: string;
  jobs_cut: number;
  jobs_cut_estimated: boolean;
  ai_role: "direct" | "contributing" | "suspected";
  description: string;
  source: string;
  date: string;
}

export interface PulseGulfEvent {
  company: string;
  country: string;
  sector: string;
  event_type: "layoff" | "automation_deployment" | "ai_replacement" | "restructuring";
  jobs_affected: number;
  jobs_affected_estimated: boolean;
  description: string;
  source: string;
  date: string;
}

export interface PulsePolicyUpdate {
  type: "nitaqat" | "tawteen" | "hrdf" | "sdaia" | "labor_law" | "other";
  title: string;
  description: string;
  effective_date: string | null;
  source: string;
  date_announced: string;
}

export interface PulseSignal {
  headline: string;
  description: string;
  relevance_to_ksa: "direct" | "indirect" | "contextual";
  source: string;
  date: string;
}

export interface PulseWeeklyStats {
  total_global_layoffs_this_week: number;
  total_ai_cited_this_week: number;
  total_gulf_events_this_week: number;
  ytd_global_tech_layoffs: number;
  ytd_ai_cited_us: number;
  trend_vs_last_week: "up" | "down" | "stable";
  notable_trend: string;
}

export interface PulseData {
  report_date: string;
  period: string;
  global_layoffs: PulseGlobalLayoff[];
  gulf_mena_automation: PulseGulfEvent[];
  saudi_policy_updates: PulsePolicyUpdate[];
  ai_workforce_signals: PulseSignal[];
  weekly_stats: PulseWeeklyStats;
}
