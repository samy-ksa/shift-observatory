#!/usr/bin/env node
// Weekly indexation KPI: share of sitemap URLs Google reports as indexed, on a
// stratified random sample (URL Inspection API, ~5 s per URL).
// Baseline 26/09/2026: EN job 35 %, FR job 100 %, AR job 50 %; insights and the
// /job hub "unknown to Google".
// Usage: node index_coverage.mjs --repo <REPO_PATH> [--per 8]
// Prints one JSON object: { date, total: {indexed, sampled}, buckets: {...}, notIndexed: [...] }

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
let repo = process.cwd();
let per = 8;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--repo') repo = argv[++i];
  else if (argv[i] === '--per') per = parseInt(argv[++i], 10);
}
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

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// bucket = "<lang>/<section>" ; hubs and articles are always inspected in full
const buckets = {};
for (const u of urls) {
  const m = u.replace(BASE, '').match(/^\/(en|fr|ar)(?:\/([^/]+))?(\/.+)?$/);
  if (!m) continue;
  const key = m[3] ? `${m[1]}/${m[2]}` : `${m[1]}/hubs`;
  (buckets[key] ||= []).push(u);
}
const sample = [];
for (const [key, list] of Object.entries(buckets)) {
  const full = key.endsWith('/hubs') || key.includes('insights') || key.includes('pulse');
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  for (const u of full ? list : shuffled.slice(0, per)) sample.push([key, u]);
}

const out = { date: new Date().toISOString().slice(0, 10), total: { indexed: 0, sampled: 0 }, buckets: {}, notIndexed: [] };
for (const [key, u] of sample) {
  let indexed = false;
  try {
    const r = await sc.urlInspection.index.inspect({ requestBody: { inspectionUrl: u, siteUrl: SITE } });
    indexed = r.data.inspectionResult?.indexStatusResult?.verdict === 'PASS';
  } catch {
    continue;
  }
  const b = (out.buckets[key] ||= { indexed: 0, sampled: 0 });
  b.sampled++; out.total.sampled++;
  if (indexed) { b.indexed++; out.total.indexed++; }
  else if (key.endsWith('/hubs') || key.includes('insights')) out.notIndexed.push(u.replace(BASE, ''));
}
console.log(JSON.stringify(out));
