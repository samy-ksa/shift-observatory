#!/usr/bin/env node
// Search Console snapshot for the site-manager agent, which has no Google credentials.
// Run on Samy's Mac (Hermès job, Mon + Thu before the agent) → data/seo/gsc-snapshot.json.
// Usage: node gsc_snapshot.mjs --repo <REPO_PATH>

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const i = process.argv.indexOf('--repo');
const repo = i > 0 ? process.argv[i + 1] : process.cwd();
const envPath = path.join(repo, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
const SITE = 'sc-domain:ksashiftobservatory.online';
const BASE = 'https://www.ksashiftobservatory.online';
const auth = new google.auth.OAuth2(process.env.GSC_CLIENT_ID, process.env.GSC_CLIENT_SECRET);
auth.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });
const sc = google.searchconsole({ version: 'v1', auth });

const d = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const windows = { current: [d(30), d(3)], previous: [d(58), d(31)] };
const strip = (u) => u.replace(BASE, '');
const round = (r) => ({
  keys: r.keys.map(strip),
  clicks: r.clicks,
  impressions: r.impressions,
  ctr: +(r.ctr * 100).toFixed(2),
  position: +r.position.toFixed(1),
});

async function q(start, end, dimensions, limit) {
  const r = await sc.searchanalytics.query({
    siteUrl: SITE,
    requestBody: { startDate: start, endDate: end, dimensions, rowLimit: 25000 },
  });
  return (r.data.rows ?? []).sort((a, b) => b.impressions - a.impressions).slice(0, limit).map(round);
}

const out = { date: new Date().toISOString().slice(0, 10), windows, current: {}, previous: {}, crawl: {} };
for (const [k, [s, e]] of Object.entries(windows)) {
  out[k].totals = (await q(s, e, ['device'], 10)).reduce(
    (a, r) => ({ clicks: a.clicks + r.clicks, impressions: a.impressions + r.impressions }),
    { clicks: 0, impressions: 0 },
  );
  out[k].pages = await q(s, e, ['page'], 400);
  out[k].queries = await q(s, e, ['query'], 400);
  out[k].queryPage = await q(s, e, ['query', 'page'], 600);
  out[k].countries = await q(s, e, ['country'], 25);
}

// Last crawl of the pages under observation (improvement log + agent journal).
const read = (f, dflt) => { try { return JSON.parse(fs.readFileSync(path.join(repo, 'data/seo', f), 'utf8')); } catch { return dflt; } };
const watched = new Set();
for (const e of read('improvement-log.json', [])) if (e.targetPath) watched.add(e.targetPath);
for (const e of read('agent-journal.json', [])) for (const p of e.pages ?? []) if (p.startsWith('/')) watched.add(p);
for (const p of [...watched].slice(0, 40)) {
  try {
    const r = await sc.urlInspection.index.inspect({ requestBody: { inspectionUrl: BASE + p, siteUrl: SITE } });
    const s = r.data.inspectionResult?.indexStatusResult ?? {};
    out.crawl[p] = { coverage: s.coverageState ?? null, lastCrawl: s.lastCrawlTime ?? null };
  } catch (e) {
    out.crawl[p] = { error: String(e.message).slice(0, 120) };
  }
}

fs.writeFileSync(path.join(repo, 'data/seo/gsc-snapshot.json'), JSON.stringify(out) + '\n');
console.log(JSON.stringify({ date: out.date, clicks: out.current.totals.clicks, watched: watched.size }));
