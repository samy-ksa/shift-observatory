import type { MetadataRoute } from "next";
import { getAllOccupations, toSlug } from "@/lib/occupations";
import { ORIGIN_CITIES, SAUDI_CITIES } from "@/data/relocation-data";
import { getAllComparisonSlugs } from "@/data/comparisons";

const BASE = "https://www.ksashiftobservatory.online";
const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/career`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/relocate`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/profile`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/prepare`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // /job/[slug] — 237 occupation pages
  const jobPages: MetadataRoute.Sitemap = getAllOccupations().map((occ) => ({
    url: `${BASE}/job/${toSlug(occ.name_en)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // /relocate/[pair] — all origin × saudi city pairs
  const relocatePages: MetadataRoute.Sitemap = [];
  for (const origin of ORIGIN_CITIES) {
    for (const saudi of SAUDI_CITIES) {
      relocatePages.push({
        url: `${BASE}/relocate/${origin.id}-to-${saudi.id}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // /vs/[slug] — 8 comparison pages
  const vsPages: MetadataRoute.Sitemap = getAllComparisonSlugs().map((slug) => ({
    url: `${BASE}/vs/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...jobPages, ...relocatePages, ...vsPages];
}
