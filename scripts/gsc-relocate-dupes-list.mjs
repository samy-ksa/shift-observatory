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
const dupes = allPages
  .filter((r) => /\/relocate\/[a-z-]+-to-[a-z-]+$/i.test(r.keys[0]) && !/\/(en|ar|fr)\/relocate\//.test(r.keys[0]))
  .sort((a,b)=>b.impressions-a.impressions);
console.log(`Total: ${dupes.length}`);
for (const r of dupes) console.log(r.keys[0]);

// also bare /relocate itself
const bareRelocate = allPages.find(r => r.keys[0] === 'https://www.ksashiftobservatory.online/relocate');
if (bareRelocate) console.log('\n(+ la page /relocate elle-même, hors pattern pair)');
