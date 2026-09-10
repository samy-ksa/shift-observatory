import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GSC_CLIENT_ID,
  process.env.GSC_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });

const sc = google.searchconsole({ version: 'v1', auth: oauth2Client });
const SITE = 'sc-domain:ksashiftobservatory.online';

const urls = [
  'https://www.ksashiftobservatory.online/en/relocate',
  'https://www.ksashiftobservatory.online/en/job/petroleum-engineer',
  'https://www.ksashiftobservatory.online/en/job/dentists',
  'https://www.ksashiftobservatory.online/sitemap.xml',
];

for (const url of urls.filter((u) => !u.endsWith('.xml'))) {
  const res = await sc.urlInspection.index.inspect({
    requestBody: { inspectionUrl: url, siteUrl: SITE },
  });
  const r = res.data.inspectionResult.indexStatusResult;
  console.log(`\n${url}`);
  console.log(`  verdict: ${r.verdict}`);
  console.log(`  coverageState: ${r.coverageState}`);
  console.log(`  lastCrawlTime: ${r.lastCrawlTime}`);
  console.log(`  indexingState: ${r.indexingState}`);
  console.log(`  robotsTxtState: ${r.robotsTxtState}`);
  console.log(`  sitemap: ${JSON.stringify(r.sitemap)}`);
}
