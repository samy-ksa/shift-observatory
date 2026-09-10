import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GSC_CLIENT_ID,
  process.env.GSC_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: process.env.GSC_REFRESH_TOKEN });

const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });

const res = await searchconsole.sites.list();
console.log('Propriétés accessibles:');
for (const site of res.data.siteEntry ?? []) {
  console.log(`- ${site.siteUrl} (${site.permissionLevel})`);
}
