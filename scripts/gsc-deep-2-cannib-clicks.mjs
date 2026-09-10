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
const START = daysAgo(90);
const END = daysAgo(3);

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

console.log('=== F. Les requêtes qui génèrent VRAIMENT des clics (dimension query) ===');
const allQueries = await queryAll({ startDate: START, endDate: END, dimensions: ['query'] });
const clicked = allQueries.filter((r) => r.clicks > 0);
for (const r of clicked) {
  console.log(`${r.clicks} clics | ${r.impressions} impr | pos ${r.position.toFixed(1)} | "${r.keys[0]}"`);
}
console.log(`\n(Total clics sur 90j: 80. Clics attribuables à une requête visible: ${clicked.reduce((s,r)=>s+r.clicks,0)}. Le reste = requêtes rares anonymisées par Google → trafic très longue traîne, aucun mot-clé "porteur" identifié.)`);

console.log('\n=== G. Cannibalisation : même job, plusieurs URLs distinctes ===');
const allPages = await queryAll({ startDate: START, endDate: END, dimensions: ['page'] });
const bySlug = new Map();
for (const r of allPages) {
  const url = r.keys[0];
  const m = url.match(/\/job\/([a-z0-9-]+)$/i);
  if (!m) continue;
  const slug = m[1];
  if (!bySlug.has(slug)) bySlug.set(slug, []);
  bySlug.get(slug).push(r);
}
const cannibalized = [...bySlug.entries()].filter(([, rows]) => rows.length > 1);
console.log(`Jobs avec plusieurs URLs indexées pour le même métier: ${cannibalized.length} / ${bySlug.size}`);
for (const [slug, rows] of cannibalized.slice(0, 15)) {
  console.log(`\n  ${slug}:`);
  for (const r of rows.sort((a, b) => b.impressions - a.impressions)) {
    console.log(`    pos ${r.position.toFixed(1)} | ${r.impressions} impr | ${r.clicks} clics | ${r.keys[0]}`);
  }
}
