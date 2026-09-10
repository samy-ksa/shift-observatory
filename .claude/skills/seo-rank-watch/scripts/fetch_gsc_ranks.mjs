#!/usr/bin/env node
// Fetch GSC positions for watched keywords + surface promising unlisted queries.
// Usage:
//   node fetch_gsc_ranks.mjs --repo <REPO_PATH> [--append] [--days 28] [--site sc-domain:example.com]
//
// --append writes the day's measurements to data/seo/rank-history.json (append-only,
// never rewrites past entries). Without --append, results are printed only (read-only),
// used for the 7-day post-improvement review (`--days 7`).

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

function parseArgs(argv) {
  const args = { days: 28, append: false, repo: process.cwd(), site: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') args.repo = argv[++i];
    else if (a === '--append') args.append = true;
    else if (a === '--days') args.days = parseInt(argv[++i], 10);
    else if (a === '--site') args.site = argv[++i];
  }
  return args;
}

function loadEnvLocal(repo) {
  const envPath = path.join(repo, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function readJSON(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadEnvLocal(args.repo);

  const SITE = args.site || 'sc-domain:ksashiftobservatory.online';

  if (!process.env.GSC_REFRESH_TOKEN) {
    console.error(
      'GSC_REFRESH_TOKEN manquant dans .env.local. Lance scripts/gsc-auth.mjs dans le repo cible d\'abord.'
    );
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GSC_CLIENT_ID,
    process.env.GSC_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });
  const sc = google.searchconsole({ version: 'v1', auth: oauth2Client });

  async function query(body) {
    const res = await sc.searchanalytics.query({ siteUrl: SITE, requestBody: body });
    return res.data.rows ?? [];
  }

  const seoDir = path.join(args.repo, 'data', 'seo');
  fs.mkdirSync(seoDir, { recursive: true });
  const watchwordsPath = path.join(seoDir, 'watchwords.json');
  const historyPath = path.join(seoDir, 'rank-history.json');

  const watchwords = readJSON(watchwordsPath, []);
  const history = readJSON(historyPath, []);

  // GSC data has ~2-3 days of lag; endDate stays a few days back for completeness.
  const startDate = daysAgo(args.days + 3);
  const endDate = daysAgo(3);

  const rows = await query({
    startDate,
    endDate,
    dimensions: ['query', 'page'],
    rowLimit: 5000,
  });

  const today = todayISO();
  const results = [];

  for (const w of watchwords) {
    const kw = w.keyword.toLowerCase();
    const matches = rows.filter((r) => {
      const [q, p] = r.keys;
      const queryMatch = q.toLowerCase() === kw;
      const pageMatch = w.targetPath ? p.includes(w.targetPath) : true;
      return queryMatch && pageMatch;
    });

    let entry;
    if (matches.length === 0) {
      entry = {
        keyword: w.keyword,
        targetPath: w.targetPath,
        date: today,
        position: null,
        impressions: 0,
        clicks: 0,
        ctr: 0,
      };
    } else {
      const totalImpr = matches.reduce((s, m) => s + m.impressions, 0);
      const totalClicks = matches.reduce((s, m) => s + m.clicks, 0);
      const weightedPos =
        totalImpr > 0
          ? matches.reduce((s, m) => s + m.position * m.impressions, 0) / totalImpr
          : matches[0].position;
      entry = {
        keyword: w.keyword,
        targetPath: w.targetPath,
        date: today,
        position: Number(weightedPos.toFixed(2)),
        impressions: totalImpr,
        clicks: totalClicks,
        ctr: totalImpr > 0 ? Number((totalClicks / totalImpr).toFixed(4)) : 0,
      };
    }

    const prevEntries = history
      .filter((h) => h.keyword === w.keyword)
      .sort((a, b) => a.date.localeCompare(b.date));
    const prev = prevEntries[prevEntries.length - 1] || null;
    const delta =
      prev && prev.position != null && entry.position != null
        ? Number((prev.position - entry.position).toFixed(2))
        : null;

    results.push({ ...entry, priority: w.priority ?? null, previousPosition: prev ? prev.position : null, delta });
  }

  // Promising unlisted queries: decent position, real impressions, not already tracked.
  const knownKeywords = new Set(watchwords.map((w) => w.keyword.toLowerCase()));
  const promisingUnlisted = rows
    .filter(
      (r) =>
        !knownKeywords.has(r.keys[0].toLowerCase()) &&
        r.position >= 2 &&
        r.position <= 20 &&
        r.impressions >= 5
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15)
    .map((r) => ({
      query: r.keys[0],
      page: r.keys[1],
      position: Number(r.position.toFixed(2)),
      impressions: r.impressions,
      clicks: r.clicks,
    }));

  const output = {
    date: today,
    site: SITE,
    window: { startDate, endDate, days: args.days },
    results,
    promisingUnlisted,
  };

  if (args.append) {
    for (const r of results) {
      history.push({
        date: r.date,
        keyword: r.keyword,
        targetPath: r.targetPath,
        position: r.position,
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: r.ctr,
      });
    }
    writeJSON(historyPath, history);
    console.error(`[append] ${results.length} mesure(s) ajoutée(s) à ${path.relative(args.repo, historyPath)}`);
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
