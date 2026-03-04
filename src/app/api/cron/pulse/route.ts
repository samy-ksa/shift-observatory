import { kv } from "@vercel/kv";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are a labor market intelligence analyst specializing in AI-driven workforce disruption. You provide structured, factual data about companies reducing headcount due to AI automation. You always respond in valid JSON only, with no preamble, no markdown, no commentary.`;

function buildUserPrompt(today: string, lastWeek: string) {
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
- ONLY include events from the last 7 days (since ${lastWeek})
- For global_layoffs: only include cases where AI/automation was explicitly cited or strongly implied as a factor. Do not include generic layoffs.
- For gulf_mena_automation: include both layoffs AND significant automation deployments (robots, AI systems replacing human tasks)
- For saudi_policy_updates: include any new HRSD, Nitaqat, SDAIA, HRDF, or labor market decisions
- For ai_workforce_signals: include 3-5 major developments (new AI capabilities threatening jobs, major studies, government AI strategies)
- If no events found in a category, return an empty array []
- jobs_cut must be a number. If unknown, estimate and set jobs_cut_estimated: true
- ai_role: "direct" = company explicitly said AI caused cuts, "contributing" = AI mentioned alongside other factors, "suspected" = automation is the obvious driver but not stated
- All sources must be real, verifiable publications
- Do NOT fabricate or hallucinate events`;
}

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .split("T")[0];

  try {
    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildUserPrompt(today, lastWeek) },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Perplexity API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse and validate JSON (strip markdown code fences if present)
    const pulse = JSON.parse(
      content.replace(/```json\n?|```\n?/g, "").trim()
    );

    // Store in Vercel KV
    await kv.set("shift:pulse:latest", JSON.stringify(pulse));
    await kv.set(`shift:pulse:${today}`, JSON.stringify(pulse));

    // Keep history of last 12 weeks
    const historyRaw = await kv.get<string>("shift:pulse:history");
    const history: Array<{ date: string; stats: unknown }> = historyRaw
      ? (typeof historyRaw === "string" ? JSON.parse(historyRaw) : historyRaw)
      : [];
    history.unshift({ date: today, stats: pulse.weekly_stats });
    if (history.length > 12) history.pop();
    await kv.set("shift:pulse:history", JSON.stringify(history));

    return Response.json({
      ok: true,
      date: today,
      events: {
        global: pulse.global_layoffs.length,
        gulf: pulse.gulf_mena_automation.length,
        policy: pulse.saudi_policy_updates.length,
        signals: pulse.ai_workforce_signals.length,
      },
    });
  } catch (error) {
    console.error("Pulse cron failed:", error);
    return Response.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
