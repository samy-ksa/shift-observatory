#!/usr/bin/env node
// Weekly Pulse generated on Samy's Mac, written into the repo (no Airtable).
// Why (26/09): the Airtable workspace hit its monthly API limit (429), so the site
// served the 02/04 fallback Pulse and the Monday article had no material.
// Prompt: src/lib/pulse-prompt.ts. The Vercel cron /api/cron/pulse is now only a Tuesday freshness watchdog.
// Usage: PERPLEXITY_API_KEY=… node --experimental-strip-types pulse_generate.mjs --repo <REPO>
// Writes src/data/pulse-seed.json (latest) and appends src/data/pulse-history.json.

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const i = process.argv.indexOf('--repo');
const repo = i > 0 ? process.argv[i + 1] : process.cwd();
const { SYSTEM_PROMPT, buildUserPrompt } = await import(
  pathToFileURL(path.join(repo, 'src/lib/pulse-prompt.ts')).href
);

const iso = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const today = iso(0);

let pulse = null;
let lastError = '';
for (let attempt = 0; attempt < 2 && !pulse; attempt++) {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(today, iso(7), iso(30)) },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });
  if (!res.ok) {
    lastError = `Perplexity ${res.status}: ${(await res.text()).slice(0, 200)}`;
    if (res.status === 401 || res.status === 403) break;
    continue;
  }
  const content = (await res.json()).choices[0].message.content;
  try {
    pulse = JSON.parse(content.replace(/```json\n?|```\n?/g, '').trim());
  } catch (e) {
    lastError = `JSON invalide: ${e.message}`;
  }
}
if (!pulse) {
  console.error(lastError);
  process.exit(1);
}

// 10/11: gulf_mena_automation and saudi_policy_updates came back empty in 6 of the last 8
// editions: one generic call covers four categories and neglects the two regional ones.
// When either is empty, a second, focused call (GCC press + HRSD/SDAIA/GASTAT sources) fills it.
// Never pads: the model may still return [] in a quiet week. Failure here never blocks the Pulse.
async function regionalPass() {
  const prompt = `Today is ${today}. Search ONLY Gulf / Saudi sources (Argaam, Arab News, Saudi Gazette, Zawya, Khaleej Times, SPA, HRSD, SDAIA, GASTAT, HRDF, company press rooms) for events since ${iso(14)}.
Return ONLY valid JSON: {"gulf_mena_automation":[{"company":"","country":"SA|AE|QA|BH|KW|OM","sector":"Banking|Retail|Government|Logistics|Healthcare|Energy|Telecom|Other","event_type":"layoff|automation_deployment|ai_replacement|restructuring","jobs_affected":0,"jobs_affected_estimated":true,"description":"One sentence factual summary","source":"URL or publication name","date":"YYYY-MM-DD"}],"saudi_policy_updates":[{"type":"nitaqat|tawteen|hrdf|sdaia|labor_law|other","title":"","description":"One sentence summary","effective_date":"YYYY-MM-DD or null","source":"URL or publication name","date_announced":"YYYY-MM-DD"}]}
Scope: Gulf AI/automation deployments, layoffs and restructurings; Saudi HRSD decisions, Nitaqat/Tawteen changes, HRDF programmes, SDAIA AI policy, expat visa/labour rules, Saudization milestones. Each item keeps its real date, with a real verifiable source. Do NOT invent or pad: an empty array is correct if nothing verifiable exists. Do not state the 5,000 SAR Nitaqat rule unless an official HRSD source confirms it.`;
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'You are a Gulf labour-market analyst. Respond in valid JSON only, no commentary.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 2500,
    }),
  });
  if (!res.ok) throw new Error(`Perplexity ${res.status}`);
  const content = (await res.json()).choices[0].message.content;
  return JSON.parse(content.replace(/```json\n?|```\n?/g, '').trim());
}
let regional = 'non_necessaire';
if (!(pulse.gulf_mena_automation?.length) || !(pulse.saudi_policy_updates?.length)) {
  try {
    const r = await regionalPass();
    // Guard (10/11 test): the model dated a 25 Oct announcement 9 Nov, sourced it "HRDF",
    // and returned an anonymous "Gulf energy operators" item. Keep only items with a real
    // dated entry inside the 14-day window, a named source and a named company/title.
    const ok = (e, dateKey) => /^\d{4}-\d{2}-\d{2}$/.test(String(e[dateKey] ?? ''))
      && e[dateKey] >= iso(14) && e[dateKey] <= today
      && String(e.source ?? '').trim().length > 3
      && !/unnamed|unspecified|various|undisclosed/i.test(String(e.company ?? e.title ?? ''));
    const guard = { gulf_mena_automation: 'date', saudi_policy_updates: 'date_announced' };
    for (const k of Object.keys(guard)) {
      if (!(pulse[k]?.length) && Array.isArray(r[k])) {
        const kept = r[k].filter((e) => ok(e, guard[k]));
        if (kept.length) pulse[k] = kept;
      }
    }
    regional = `ok gulf=${pulse.gulf_mena_automation?.length ?? 0} policy=${pulse.saudi_policy_updates?.length ?? 0}`;
  } catch (e) {
    regional = `echec: ${String(e.message).slice(0, 80)}`;
  }
}

// Same guard as the cron: never replace a good snapshot with an empty one.
const total = ['global_layoffs', 'gulf_mena_automation', 'saudi_policy_updates', 'ai_workforce_signals']
  .reduce((n, k) => n + (pulse[k]?.length ?? 0), 0);
if (total === 0) {
  console.error('payload vide, snapshot conservé');
  process.exit(2);
}
pulse.report_date = today;

// 12/10: the model's own weekly totals did not match its list (16,830 announced, 16,630 listed,
// 15,530 within the week, plus a 12 Sept backfill item). The Monday article then spent a
// paragraph reconciling three totals and failed the judges. Code counts, the model reports:
// totals are recomputed from the dated list, within the 7-day window only.
const since = iso(7);
const inWeek = (pulse.global_layoffs ?? []).filter((e) => String(e.date ?? '') >= since);
const stats = (pulse.weekly_stats ??= {});
stats.model_reported = {
  total_global_layoffs_this_week: stats.total_global_layoffs_this_week,
  total_ai_cited_this_week: stats.total_ai_cited_this_week,
};
stats.total_global_layoffs_this_week = inWeek.reduce((n, e) => n + (Number(e.jobs_cut) || 0), 0);
stats.total_ai_cited_this_week = inWeek.filter((e) => ['direct', 'contributing'].includes(e.ai_role)).length;
stats.events_this_week = inWeek.length;
stats.backfill_events_older_than_week = (pulse.global_layoffs?.length ?? 0) - inWeek.length;
stats.totals_computed_from_list = true;

const seedPath = path.join(repo, 'src/data/pulse-seed.json');
const histPath = path.join(repo, 'src/data/pulse-history.json');
const previous = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
let history = [];
try { history = JSON.parse(fs.readFileSync(histPath, 'utf8')); } catch { /* first run */ }
if (previous.report_date && previous.report_date !== today && previous.weekly_stats) {
  history = [{ date: previous.report_date, stats: previous.weekly_stats }, ...history]
    .filter((h, idx, arr) => arr.findIndex((x) => x.date === h.date) === idx)
    .slice(0, 11);
}
fs.writeFileSync(seedPath, JSON.stringify(pulse, null, 2) + '\n');
fs.writeFileSync(histPath, JSON.stringify(history, null, 2) + '\n');
console.log(JSON.stringify({ date: today, events: total, history: history.length, regional }));
