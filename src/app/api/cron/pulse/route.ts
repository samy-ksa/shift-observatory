export const runtime = "edge";

const AIRTABLE_BASE = "appyqLmjVv9KLEnIR";
const AIRTABLE_TABLE = "tbl8gxM7A3X4xhpZQ"; // Pulse Snapshots
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`;

// Field IDs (Pulse Snapshots table)
const FIELD_DATE = "fldZacblCCB07ezNm";
const FIELD_PAYLOAD = "fldJFwxtyahUCAFo8";
const FIELD_WEEKLY_STATS = "fldD9ra9mc8iime3d";

/**
 * Best-effort failure alert. Emails via Resend when the weekly pulse can't
 * refresh, so a silent outage (like the expired-API-key one) is caught within
 * hours instead of weeks. No-op when RESEND_API_KEY / ALERT_EMAIL are unset.
 * Never throws — it must not mask the original failure.
 */
async function sendAlert(reason: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SHIFT Pulse <onboarding@resend.dev>",
        to: [to],
        subject: "⚠️ SHIFT Pulse cron failed — weekly update did not refresh",
        text: `The SHIFT Pulse weekly cron did not produce a fresh snapshot.\n\nReason: ${reason}\n\nThe site is now serving a stale pulse. Check Vercel logs for /api/cron/pulse and verify PERPLEXITY_API_KEY is valid.`,
      }),
    });
  } catch (e) {
    console.error("sendAlert failed:", e);
  }
}

const SYSTEM_PROMPT = `You are a labor market intelligence analyst specializing in AI-driven workforce disruption. You provide structured, factual data about companies reducing headcount due to AI automation. You always respond in valid JSON only, with no preamble, no markdown, no commentary.`;

function buildUserPrompt(today: string, lastWeek: string, lastMonth: string) {
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

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const pat = process.env.AIRTABLE_PAT;
  if (!pat) {
    return Response.json(
      { ok: false, error: "AIRTABLE_PAT not configured" },
      { status: 500 },
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .split("T")[0];
  const lastMonth = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];

  try {
    // Call Perplexity, retrying once on a transient (non-2xx) response so a
    // single blip doesn't cost a whole week's snapshot.
    let response: Response | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: buildUserPrompt(today, lastWeek, lastMonth),
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });
      if (response.ok) break;
      // 401/403 are auth errors — retrying won't help, fail fast & loud.
      if (response.status === 401 || response.status === 403) break;
    }

    if (!response || !response.ok) {
      const errText = response ? await response.text() : "no response";
      throw new Error(
        `Perplexity API error ${response?.status ?? "?"}: ${errText}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse and validate JSON (strip markdown code fences if present)
    const pulse = JSON.parse(
      content.replace(/```json\n?|```\n?/g, "").trim(),
    );

    // Guard: never overwrite a good snapshot with a fully-empty one. If every
    // category came back empty, the run is degenerate (model miss / quota) —
    // skip the write so the site keeps serving the last meaningful pulse.
    const totalEvents =
      (pulse.global_layoffs?.length ?? 0) +
      (pulse.gulf_mena_automation?.length ?? 0) +
      (pulse.saudi_policy_updates?.length ?? 0) +
      (pulse.ai_workforce_signals?.length ?? 0);
    if (totalEvents === 0) {
      console.error("Pulse cron: empty payload, skipping write", { today });
      await sendAlert(`Empty payload on ${today} — all categories returned 0 events.`);
      return Response.json(
        { ok: false, skipped: "empty_payload", date: today },
        { status: 200 },
      );
    }

    // Upsert into Airtable — merge on `date` so re-runs same day overwrite
    const airtableRes = await fetch(`${AIRTABLE_URL}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        performUpsert: { fieldsToMergeOn: [FIELD_DATE] },
        records: [
          {
            fields: {
              [FIELD_DATE]: today,
              [FIELD_PAYLOAD]: JSON.stringify(pulse),
              [FIELD_WEEKLY_STATS]: JSON.stringify(pulse.weekly_stats ?? {}),
            },
          },
        ],
        typecast: true,
      }),
    });

    if (!airtableRes.ok) {
      const errText = await airtableRes.text();
      throw new Error(`Airtable error ${airtableRes.status}: ${errText}`);
    }

    return Response.json({
      ok: true,
      date: today,
      events: {
        global: pulse.global_layoffs?.length ?? 0,
        gulf: pulse.gulf_mena_automation?.length ?? 0,
        policy: pulse.saudi_policy_updates?.length ?? 0,
        signals: pulse.ai_workforce_signals?.length ?? 0,
      },
    });
  } catch (error) {
    console.error("Pulse cron failed:", error);
    await sendAlert(String(error));
    return Response.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
