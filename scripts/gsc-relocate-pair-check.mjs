import { google } from 'googleapis';
const oauth2Client = new google.auth.OAuth2(process.env.GSC_CLIENT_ID, process.env.GSC_CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });
const sc = google.searchconsole({ version: 'v1', auth: oauth2Client });
const SITE = 'sc-domain:ksashiftobservatory.online';
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
async function queryAll(body) {
  let rows = [], startRow = 0;
  while (true) {
    const res = await sc.searchanalytics.query({ siteUrl: SITE, requestBody: { ...body, rowLimit: 25000, startRow } });
    const batch = res.data.rows ?? [];
    rows = rows.concat(batch);
    if (batch.length < 25000) break;
    startRow += 25000;
  }
  return rows;
}
const allPages = await queryAll({ startDate: daysAgo(90), endDate: daysAgo(3), dimensions: ['page'] });
const pairs = allPages.filter((r) => /-to-/.test(r.keys[0]));
const impr = pairs.reduce((s, r) => s + r.impressions, 0);
const clicks = pairs.reduce((s, r) => s + r.clicks, 0);
console.log(`Pages /relocate/[pair] avec impressions: ${pairs.length}`);
console.log(`Total impressions: ${impr}, clics: ${clicks}, CTR: ${(clicks/impr*100).toFixed(2)}%`);
console.log('\nTop 10:');
for (const r of pairs.sort((a,b)=>b.impressions-a.impressions).slice(0,10)) {
  console.log(`  pos ${r.position.toFixed(1)} | ${r.impressions} impr | ${r.clicks} clics | ${r.keys[0]}`);
}
