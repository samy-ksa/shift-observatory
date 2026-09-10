import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GSC_CLIENT_ID,
  process.env.GSC_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });

const sc = google.searchconsole({ version: 'v1', auth: oauth2Client });
const SITE = 'sc-domain:ksashiftobservatory.online';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function queryAll(body) {
  let rows = [];
  let startRow = 0;
  const limit = 25000;
  while (true) {
    const res = await sc.searchanalytics.query({
      siteUrl: SITE,
      requestBody: { ...body, rowLimit: limit, startRow },
    });
    const batch = res.data.rows ?? [];
    rows = rows.concat(batch);
    if (batch.length < limit) break;
    startRow += limit;
  }
  return rows;
}

const allPages = await queryAll({
  startDate: daysAgo(90),
  endDate: daysAgo(3),
  dimensions: ['page'],
});

const stale = allPages
  .filter((r) => /\/job\/[a-z0-9-]+$/i.test(r.keys[0]) && !/\/(en|ar|fr)\/job\//.test(r.keys[0]))
  .sort((a, b) => b.impressions - a.impressions);

console.log(`Total URLs /job/X sans préfixe encore indexées: ${stale.length}\n`);
for (const r of stale) {
  console.log(r.keys[0]);
}
