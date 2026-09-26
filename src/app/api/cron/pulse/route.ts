import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/pulse-prompt";

export const maxDuration = 60;

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
