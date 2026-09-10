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

const reservedSlugs = new Set([
  'audiologist','aviation-safety-inspector','call-center-agent','cashiers','clinical-psychologist',
  'concierge-luxury','corporate-trainer','customer-service-reps','data-entry-keyers','digital-marketing-manager',
  'document-controller','event-manager','executive-secretary','fitness-center-manager','general-manager',
  'government-relations-officer','hotel-general-manager','immigration-lawyer','in-house-counsel',
  'infection-control-specialist','ip-lawyer','islamic-banking-officer','luxury-sales-associate',
  'medical-imaging-specialist','payroll-clerks','physiotherapist','podiatrist','procurement-officer',
  'real-estate-appraiser','receptionists','real-estate-lawyer','recruitment-specialist','respiratory-therapist',
  'revenue-manager-hotels','security-guard','stem-teacher','translators'
]);

const allPages = await queryAll({ startDate: daysAgo(90), endDate: daysAgo(3), dimensions: ['page'] });
let reservedImpr = 0, reservedClicks = 0, totalImpr = 0, totalClicks = 0;
for (const r of allPages) {
  totalImpr += r.impressions;
  totalClicks += r.clicks;
  const m = r.keys[0].match(/\/job\/([a-z0-9-]+)$/i);
  if (m && reservedSlugs.has(m[1])) {
    reservedImpr += r.impressions;
    reservedClicks += r.clicks;
  }
}
console.log(`Pages "Reserved for Saudi": ${reservedImpr} impressions (${(reservedImpr/totalImpr*100).toFixed(1)}% du total), ${reservedClicks} clics sur 90j`);
console.log(`Total site: ${totalImpr} impressions, ${totalClicks} clics`);
