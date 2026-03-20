#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://www.ksashiftobservatory.online";
const TODAY = "2026-03-20";

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const master = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "data", "master.json"), "utf-8"));
const allOcc = [...master.occupations.high_risk, ...master.occupations.low_risk];
const seen = new Set();
const uniqueSlugs = [];
for (const o of allOcc) {
  const s = toSlug(o.name_en);
  if (!seen.has(s)) { seen.add(s); uniqueSlugs.push(s); }
}

const ORIGINS = ["paris","new-york","san-francisco","london","dubai","cairo","amman","beirut","mumbai","manila","toronto","islamabad","sydney","casablanca","tunis"];
const SAUDI = ["riyadh","jeddah","dammam","makkah","madinah"];

function entry(loc, pri, freq) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="fr" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`;
}

const urls = [];
urls.push(entry(SITE_URL, "1.0", "weekly"));
urls.push(entry(SITE_URL + "/profile", "0.9", "weekly"));
urls.push(entry(SITE_URL + "/relocate", "0.9", "weekly"));
urls.push(entry(SITE_URL + "/career", "0.8", "weekly"));
urls.push(entry(SITE_URL + "/privacy", "0.3", "monthly"));
urls.push(entry(SITE_URL + "/terms", "0.3", "monthly"));
urls.push(entry(SITE_URL + "/cookies", "0.3", "monthly"));
for (const s of uniqueSlugs) urls.push(entry(SITE_URL + "/job/" + s, "0.7", "monthly"));
for (const o of ORIGINS) for (const s of SAUDI) urls.push(entry(SITE_URL + "/relocate/" + o + "-to-" + s, "0.6", "monthly"));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), xml, "utf-8");
const count = (xml.match(/<loc>/g) || []).length;
console.log("Job slugs: " + uniqueSlugs.length);
console.log("Relocation pages: " + (ORIGINS.length * SAUDI.length));
console.log("Static: 7");
console.log("Total <loc>: " + count);
