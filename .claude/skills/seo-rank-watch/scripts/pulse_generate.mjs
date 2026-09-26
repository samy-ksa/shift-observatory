#!/usr/bin/env node
// Weekly Pulse generated on Samy's Mac, written into the repo (no Airtable).
// Why (26/09): the Airtable workspace hit its monthly API limit (429), so the site
// served the 02/04 fallback Pulse and the Monday article had no material.
// Same prompt and model as /api/cron/pulse (src/lib/pulse-prompt.ts).
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

// Same guard as the cron: never replace a good snapshot with an empty one.
const total = ['global_layoffs', 'gulf_mena_automation', 'saudi_policy_updates', 'ai_workforce_signals']
  .reduce((n, k) => n + (pulse[k]?.length ?? 0), 0);
if (total === 0) {
  console.error('payload vide, snapshot conservé');
  process.exit(2);
}
pulse.report_date = today;

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
console.log(JSON.stringify({ date: today, events: total, history: history.length }));
