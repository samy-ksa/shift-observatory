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

async function query(body) {
  const res = await sc.searchanalytics.query({ siteUrl: SITE, requestBody: body });
  return res.data.rows ?? [];
}

console.log('=== 1. Vue d\'ensemble 90 jours ===');
const overview = await query({
  startDate: daysAgo(90),
  endDate: daysAgo(3),
});
console.log(JSON.stringify(overview, null, 2));

console.log('\n=== 2. Top requêtes par impressions (90j) ===');
const topQueries = await query({
  startDate: daysAgo(90),
  endDate: daysAgo(3),
  dimensions: ['query'],
  rowLimit: 250,
});
console.log(`Total requêtes distinctes: ${topQueries.length}`);

console.log('\n=== 3. Striking distance (position 8-20, triées par impressions) ===');
const striking = topQueries
  .filter((r) => r.position >= 8 && r.position <= 20)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 30);
for (const r of striking) {
  console.log(
    `pos ${r.position.toFixed(1)} | ${r.impressions} impr | ${r.clicks} clics | CTR ${(r.ctr * 100).toFixed(2)}% | ${r.keys[0]}`
  );
}

console.log('\n=== 4. Top pages (90j) ===');
const topPages = await query({
  startDate: daysAgo(90),
  endDate: daysAgo(3),
  dimensions: ['page'],
  rowLimit: 250,
});
console.log(`Total pages avec trafic: ${topPages.length}`);
const sortedPages = [...topPages].sort((a, b) => b.impressions - a.impressions).slice(0, 15);
for (const r of sortedPages) {
  console.log(
    `pos ${r.position.toFixed(1)} | ${r.impressions} impr | ${r.clicks} clics | CTR ${(r.ctr * 100).toFixed(2)}% | ${r.keys[0]}`
  );
}

console.log('\n=== 5. CTR gap : bon classement (pos <10) mais CTR faible ===');
const ctrGap = topPages
  .filter((r) => r.position < 10 && r.impressions > 20)
  .sort((a, b) => a.ctr - b.ctr)
  .slice(0, 15);
for (const r of ctrGap) {
  console.log(
    `pos ${r.position.toFixed(1)} | CTR ${(r.ctr * 100).toFixed(2)}% | ${r.impressions} impr | ${r.clicks} clics | ${r.keys[0]}`
  );
}

console.log('\n=== 6. Tendance : 28 derniers jours vs 28 précédents ===');
const recent = await query({ startDate: daysAgo(31), endDate: daysAgo(3) });
const previous = await query({ startDate: daysAgo(59), endDate: daysAgo(32) });
console.log('Récent (28j):', JSON.stringify(recent));
console.log('Précédent (28j):', JSON.stringify(previous));

console.log('\n=== 7. Sitemaps déclarés ===');
const sitemaps = await sc.sitemaps.list({ siteUrl: SITE });
console.log(JSON.stringify(sitemaps.data, null, 2));
