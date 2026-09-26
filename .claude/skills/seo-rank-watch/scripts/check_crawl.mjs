#!/usr/bin/env node
// Did Google recrawl a page AFTER a given date? Needed before judging an improvement:
// on this site Google recrawls a page every 1-2 months, so a 7-day review usually
// measures the OLD version of the page.
// Usage:
//   node check_crawl.mjs --repo <REPO_PATH> --since 2026-09-17 /en/job/cloud-engineer [/en/job/x ...]
// Prints one JSON line per path: { path, coverage, lastCrawl, recrawled }.

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
let repo = process.cwd();
let since = null;
const paths = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--repo') repo = argv[++i];
  else if (argv[i] === '--since') since = argv[++i];
  else paths.push(argv[i]);
}
if (!since || paths.length === 0) {
  console.error('Usage: check_crawl.mjs --repo <REPO> --since YYYY-MM-DD <path> [...]');
  process.exit(1);
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

for (const p of paths) {
  const res = await sc.urlInspection.index.inspect({
    requestBody: { inspectionUrl: BASE + p, siteUrl: SITE },
  });
  const s = res.data.inspectionResult?.indexStatusResult ?? {};
  const lastCrawl = s.lastCrawlTime ?? null;
  console.log(JSON.stringify({
    path: p,
    coverage: s.coverageState ?? null,
    lastCrawl,
    recrawled: lastCrawl ? lastCrawl.slice(0, 10) > since : false,
  }));
}
