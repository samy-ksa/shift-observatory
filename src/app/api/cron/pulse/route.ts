import seedData from "@/data/pulse-seed.json";

/**
 * Weekly FRESHNESS WATCHDOG for SHIFT Pulse (Tuesday 06:00 UTC, see vercel.json).
 *
 * Since 26/09 the Pulse is generated on Samy's Mac every Monday
 * (`seo_site_data.py` → `pulse_generate.mjs`) and committed to
 * src/data/pulse-seed.json. This cron used to regenerate it and upsert into
 * Airtable, but the Airtable workspace is over its monthly API quota (429):
 * every Sunday it burned a Perplexity call, failed, and emailed a false alarm
 * while the site was fine (27/09).
 *
 * It now only checks that the Pulse bundled in the LIVE deployment is recent.
 * That catches every real failure mode at once: Mac asleep/off on Monday,
 * Perplexity key or quota dead, push not deployed.
 */

const MAX_AGE_DAYS = 8;

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
        subject: "⚠️ SHIFT Pulse is stale — Monday update did not reach the site",
        text: `${reason}\n\nThe Pulse is generated on the Mac every Monday (launchd com.mfg.seo-site-data, log ~/.hermes/logs/seo_site_data.log) and deployed from the repo. Check: Mac awake on Monday 08:15, PERPLEXITY_API_KEY valid, push deployed on Vercel.`,
      }),
    });
  } catch (e) {
    console.error("sendAlert failed:", e);
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const reportDate = (seedData as { report_date?: string }).report_date;
  const ageDays = reportDate
    ? Math.floor((Date.now() - Date.parse(reportDate)) / 86400000)
    : null;

  if (ageDays === null || Number.isNaN(ageDays) || ageDays > MAX_AGE_DAYS) {
    const reason = `Live Pulse report_date = ${reportDate ?? "missing"} (${ageDays ?? "?"} days old, max ${MAX_AGE_DAYS}).`;
    console.error("Pulse watchdog:", reason);
    await sendAlert(reason);
    return Response.json({ ok: false, stale: true, reportDate, ageDays });
  }
  return Response.json({ ok: true, reportDate, ageDays });
}
