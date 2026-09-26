/**
 * Pulse briefing prompt, shared by the Vercel cron (/api/cron/pulse) and the Mac
 * generator (.claude/skills/seo-rank-watch/scripts/pulse_generate.mjs, run with
 * `node --experimental-strip-types`). Keep it plain TypeScript (type annotations
 * only) so Node can strip the types. Moved here unchanged on 26/09/2026.
 */
export const SYSTEM_PROMPT = `You are a labor market intelligence analyst specializing in AI-driven workforce disruption. You provide structured, factual data about companies reducing headcount due to AI automation. You always respond in valid JSON only, with no preamble, no markdown, no commentary.`;

export function buildUserPrompt(today: string, lastWeek: string, lastMonth: string) {
  return `Today is ${today}. Provide a weekly intelligence briefing on AI-driven layoffs and workforce automation.

Return ONLY a valid JSON object with this exact structure:

{
  "report_date": "YYYY-MM-DD",
  "period": "last 7 days",

  "global_layoffs": [
    {
      "company": "Company Name",
      "country": "US",
      "sector": "Tech",
      "jobs_cut": 500,
      "jobs_cut_estimated": false,
      "ai_role": "direct|contributing|suspected",
      "description": "One sentence factual summary",
      "source": "URL or publication name",
      "date": "YYYY-MM-DD"
    }
  ],

  "gulf_mena_automation": [
    {
      "company": "Company Name",
      "country": "SA|AE|QA|BH|KW|OM",
      "sector": "Banking|Retail|Government|Logistics|Healthcare|Energy|Telecom|Other",
      "event_type": "layoff|automation_deployment|ai_replacement|restructuring",
      "jobs_affected": 0,
      "jobs_affected_estimated": true,
      "description": "One sentence factual summary",
      "source": "URL or publication name",
      "date": "YYYY-MM-DD"
    }
  ],

  "saudi_policy_updates": [
    {
      "type": "nitaqat|tawteen|hrdf|sdaia|labor_law|other",
      "title": "Decision or policy name",
      "description": "One sentence summary",
      "effective_date": "YYYY-MM-DD or null",
      "source": "URL or publication name",
      "date_announced": "YYYY-MM-DD"
    }
  ],

  "ai_workforce_signals": [
    {
      "headline": "Short headline",
      "description": "2-3 sentence summary of a significant AI workforce development",
      "relevance_to_ksa": "direct|indirect|contextual",
      "source": "URL or publication name",
      "date": "YYYY-MM-DD"
    }
  ],

  "weekly_stats": {
    "total_global_layoffs_this_week": 0,
    "total_ai_cited_this_week": 0,
    "total_gulf_events_this_week": 0,
    "ytd_global_tech_layoffs": 0,
    "ytd_ai_cited_us": 0,
    "trend_vs_last_week": "up|down|stable",
    "notable_trend": "One sentence on the week's dominant pattern"
  }
}

Rules:
- PRIMARY WINDOW: prioritise events from the last 7 days (since ${lastWeek}).
  Each event keeps its REAL announcement date — never relabel an older event
  as recent.
- ANTI-EMPTY BACKFILL: global_layoffs and ai_workforce_signals must NEVER be
  returned empty — across any rolling 30-day window there is always
  reportable AI-workforce activity. If the strict 7-day window yields fewer
  than 4 global_layoffs or fewer than 5 ai_workforce_signals, BACKFILL from
  the trailing 30 days (since ${lastMonth}) with the most material events,
  each carrying its true date. gulf_mena_automation and saudi_policy_updates
  MAY legitimately be empty in a quiet week — do not pad them with stale or
  generic items just to fill space.
- Before returning, if any array you expected to fill is empty, EXPAND your
  search — check Challenger Gray monthly compilations, Layoffs.fyi weekly
  digests, Bloomberg / Reuters / FT tech & enterprise coverage, Arab News /
  Khaleej Times / Gulf News for MENA, Wamda / MAGNiTT for regional venture /
  corp restructuring, GASTAT / HRSD / SDAIA press releases, and major bank /
  telco / energy company press rooms for the GCC.

- For global_layoffs (inclusive): include workforce reductions where AI,
  automation, "AI capex pivot", "AI-first restructuring", "agentic systems",
  RPA, "headcount-to-GPU spend", customer-support consolidation tied to
  Copilot / Agentforce / Claude / Gemini-for-work, or efficiency programs
  citing AI productivity gains are mentioned even ALONGSIDE other factors
  (revenue miss, restructuring, integration). When in doubt, INCLUDE with
  ai_role="contributing" or "suspected" rather than excluding. Cap at 8-12
  most material events per week.

- For gulf_mena_automation (inclusive): include layoffs, automation
  deployments (sorting robots, customer-service chatbots, autonomous
  delivery, AI underwriting, RPA back-office), bank/telco/government
  digitization milestones, and announcements of AI-driven process
  consolidation across SA, AE, QA, BH, KW, OM. Smaller pilots are
  acceptable if widely reported. Cap at 6-10 events per week.

- For saudi_policy_updates: include HRSD decisions, Nitaqat band changes,
  Tawteen quotas, HRDF program updates, SDAIA AI policy announcements,
  visa rules affecting expat workforce, labor disputes, NEOM / Qiddiya /
  Red Sea staffing announcements, and Saudization milestones. 0-5 per week
  is realistic.

- For ai_workforce_signals: include 5-8 major developments (new AI
  capabilities threatening jobs, major studies, government AI strategies,
  enterprise AI roll-out milestones, regulatory shifts). This is the
  "broadest" category — if other categories are sparse, this one should
  always have content.

- jobs_cut: must be a number. If a precise number isn't reported, estimate
  conservatively from secondary signals (e.g., "5% of 80,000 employees" =
  4000) and set jobs_cut_estimated: true. If absolutely no estimate is
  derivable, use 0 but DO NOT skip the event — keep it.

- ai_role: "direct" = company explicitly said AI caused cuts;
  "contributing" = AI mentioned alongside other factors (revenue, strategy
  pivot, integration); "suspected" = automation is the obvious driver but
  not formally stated (back-office, IT support, basic ops).

- Source quality: must be real, verifiable publications. Prefer primary
  source (company press release, SEC filing, government bulletin) when
  available; secondary tier (Bloomberg, Reuters, FT, WSJ) acceptable;
  tabloid / unverified rumor not acceptable.

- weekly_stats.notable_trend MUST be a single, content-rich sentence that
  captures the week's story — not a meta-comment about lack of data.
  Even in slow weeks, surface the dominant directional signal (e.g.,
  "AI capex pivots are accelerating in mid-cap tech while AI-cited layoff
  intensity holds steady in the US"). This sentence is the headline shown
  to readers when individual category tabs are empty.

- Do NOT fabricate or hallucinate events. If a claim cannot be verified
  against a real publication, drop it entirely.`;
}
