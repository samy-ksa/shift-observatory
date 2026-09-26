#!/usr/bin/env node
// Re-submit sitemap.xml to Search Console (26/09: Google had not re-read it since 04/06).
// Called every Thursday by the Hermès relay. Prints lastDownloaded so a stale read shows.
// Usage: node resubmit_sitemap.mjs --repo <REPO_PATH>
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
const FEED = 'https://www.ksashiftobservatory.online/sitemap.xml';
const auth = new google.auth.OAuth2(process.env.GSC_CLIENT_ID, process.env.GSC_CLIENT_SECRET);
auth.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });
const sc = google.searchconsole({ version: 'v1', auth });
await sc.sitemaps.submit({ siteUrl: SITE, feedpath: FEED });
const r = await sc.sitemaps.get({ siteUrl: SITE, feedpath: FEED });
console.log(JSON.stringify({ submitted: r.data.lastSubmitted, lastDownloaded: r.data.lastDownloaded ?? null }));
