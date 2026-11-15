// Diagnostic: URL Inspection detail (coverageState, canonical, last crawl) on a sample of job pages per language.
// Usage: node scripts/gsc-index-detail.mjs [perLang=30] > out.json
import { google } from 'googleapis';
import fs from 'fs';
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}
const per = parseInt(process.argv[2] || '30', 10);
const SITE = 'sc-domain:ksashiftobservatory.online', BASE = 'https://www.ksashiftobservatory.online';
const auth = new google.auth.OAuth2(process.env.GSC_CLIENT_ID, process.env.GSC_CLIENT_SECRET);
auth.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });
const sc = google.searchconsole({ version: 'v1', auth });
const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const out = [];
for (const lang of ['fr', 'en', 'ar']) {
  const list = urls.filter((u) => u.includes(`/${lang}/job/`)).sort(() => Math.random() - 0.5).slice(0, per);
  for (const u of list) {
    try {
      const r = (await sc.urlInspection.index.inspect({ requestBody: { inspectionUrl: u, siteUrl: SITE } })).data.inspectionResult.indexStatusResult;
      out.push({ lang, url: u.replace(BASE, ''), verdict: r.verdict, state: r.coverageState, crawled: r.lastCrawlTime, googleCanonical: r.googleCanonical?.replace(BASE, ''), userCanonical: r.userCanonical?.replace(BASE, '') });
    } catch (e) { out.push({ lang, url: u, error: String(e.message).slice(0, 80) }); }
  }
}
console.log(JSON.stringify(out));
