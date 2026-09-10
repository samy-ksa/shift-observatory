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

const START = daysAgo(90);
const END = daysAgo(3);

console.log('=== A. Inventaire complet requêtes (90j) ===');
const allQueries = await queryAll({ startDate: START, endDate: END, dimensions: ['query'] });
console.log(`Total requêtes distinctes: ${allQueries.length}`);
const qWithClicks = allQueries.filter((r) => r.clicks > 0);
console.log(`Requêtes avec au moins 1 clic: ${qWithClicks.length}`);
const qZeroClick = allQueries.filter((r) => r.clicks === 0);
const qZeroClickImpr = qZeroClick.reduce((s, r) => s + r.impressions, 0);
console.log(`Requêtes à 0 clic: ${qZeroClick.length} (totalisant ${qZeroClickImpr} impressions gâchées)`);

console.log('\n=== B. Inventaire complet pages (90j) ===');
const allPages = await queryAll({ startDate: START, endDate: END, dimensions: ['page'] });
console.log(`Total pages avec au moins 1 impression: ${allPages.length}`);
const pWithClicks = allPages.filter((r) => r.clicks > 0);
console.log(`Pages avec au moins 1 clic: ${pWithClicks.length}`);
const pZeroClick = allPages.filter((r) => r.clicks === 0).sort((a, b) => b.impressions - a.impressions);
console.log(`Pages à 0 clic malgré des impressions: ${pZeroClick.length}`);
console.log('Top 20 pages à 0 clic (le plus d\'impressions gâchées):');
for (const r of pZeroClick.slice(0, 20)) {
  console.log(`  pos ${r.position.toFixed(1)} | ${r.impressions} impr | ${r.keys[0]}`);
}

console.log('\n=== C. Répartition par appareil (90j) ===');
const byDevice = await queryAll({ startDate: START, endDate: END, dimensions: ['device'] });
for (const r of byDevice) {
  console.log(
    `${r.keys[0]}: ${r.clicks} clics | ${r.impressions} impr | CTR ${(r.ctr * 100).toFixed(2)}% | pos ${r.position.toFixed(1)}`
  );
}

console.log('\n=== D. Répartition par pays (90j, top 15) ===');
const byCountry = await queryAll({ startDate: START, endDate: END, dimensions: ['country'] });
const sortedCountry = [...byCountry].sort((a, b) => b.impressions - a.impressions).slice(0, 15);
for (const r of sortedCountry) {
  console.log(
    `${r.keys[0]}: ${r.clicks} clics | ${r.impressions} impr | CTR ${(r.ctr * 100).toFixed(2)}% | pos ${r.position.toFixed(1)}`
  );
}

console.log('\n=== E. Total pages soumises via sitemap vs total pages avec ne serait-ce qu\'1 impression ===');
console.log(`Pages avec >=1 impression sur 90j: ${allPages.length}`);
console.log('(à comparer aux 984 URLs déclarées dans le sitemap — voir écart = pages invisibles)');
