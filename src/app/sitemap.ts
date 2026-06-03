import type { MetadataRoute } from "next";
import { getAllOccupations, toSlug } from "@/lib/occupations";
import { ORIGIN_CITIES, SAUDI_CITIES } from "@/data/relocation-data";
import { getAllComparisonSlugs } from "@/data/comparisons";

const BASE = "https://www.ksashiftobservatory.online";
const LANGS = ["en", "fr", "ar"] as const;
const HREFLANG_REGIONS: Record<(typeof LANGS)[number], string[]> = {
  en: ["en"],
  fr: ["fr"],
  ar: ["ar", "ar-SA"],
};

const now = new Date();

type Path = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

function buildAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of LANGS) {
    const url = `${BASE}/${lang}${path === "/" ? "" : path}`;
    for (const hl of HREFLANG_REGIONS[lang]) {
      out[hl] = url;
    }
  }
  out["x-default"] = `${BASE}/en${path === "/" ? "" : path}`;
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Static paths
  const staticPaths: Path[] = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/career", changeFrequency: "weekly", priority: 0.9 },
    { path: "/relocate", changeFrequency: "weekly", priority: 0.9 },
    { path: "/profile", changeFrequency: "monthly", priority: 0.8 },
    { path: "/prepare", changeFrequency: "monthly", priority: 0.7 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic paths
  const jobPaths: Path[] = getAllOccupations().map((occ) => ({
    path: `/job/${toSlug(occ.name_en)}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const relocatePaths: Path[] = [];
  for (const origin of ORIGIN_CITIES) {
    for (const saudi of SAUDI_CITIES) {
      relocatePaths.push({
        path: `/relocate/${origin.id}-to-${saudi.id}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      });
    }
  }

  const vsPaths: Path[] = getAllComparisonSlugs().map((slug) => ({
    path: `/vs/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const allPaths = [...staticPaths, ...jobPaths, ...relocatePaths, ...vsPaths];

  // Emit 3 URL entries per path (one per lang), each with full hreflang alternates.
  // Next.js renders `alternates.languages` as <xhtml:link rel="alternate" hreflang>.
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of LANGS) {
    for (const p of allPaths) {
      entries.push({
        url: `${BASE}/${lang}${p.path === "/" ? "" : p.path}`,
        lastModified: now,
        changeFrequency: p.changeFrequency,
        priority: p.priority,
        alternates: { languages: buildAlternates(p.path) },
      });
    }
  }

  return entries;
}
