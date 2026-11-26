import type { MetadataRoute } from "next";
import { getAllOccupations, toSlug } from "@/lib/occupations";
import { getAllComparisonSlugs } from "@/data/comparisons";
import { getAllInsights, getAllPulse } from "@/lib/insights";
import { RANKING_SLUGS, SECTORS } from "@/lib/rankings";
import improvementLog from "../../data/seo/improvement-log.json";
import agentJournal from "../../data/seo/agent-journal.json";

const BASE = "https://www.ksashiftobservatory.online";
const LANGS = ["en", "fr", "ar"] as const;
const HREFLANG_REGIONS: Record<(typeof LANGS)[number], string[]> = {
  en: ["en"],
  fr: ["fr"],
  ar: ["ar", "ar-SA"],
};

// lastmod honnête (GSC 26/09) : avant, chaque build déclarait les 1 161 URL modifiées
// « maintenant », et Google ignore un lastmod qui ment. À mettre à jour quand le
// gabarit des pages ou le jeu de données change réellement.
const CONTENT_UPDATED = "2026-09-28";

// Dernière amélioration de la routine SEO Rank Watch par page (targetPath → date).
function improvementDates(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of improvementLog as { targetPath: string; actions: { date: string }[] }[]) {
    for (const a of e.actions) {
      const path = e.targetPath.replace(/^\/(en|fr|ar)/, "");
      if (!out[path] || a.date > out[path]) out[path] = a.date;
    }
  }
  return out;
}

// Actions catalogue site-manager qui changent une page sans passer par seo-rank-watch /
// improvement-log.json (ex. decouverte-indexation, francais) : à inclure aussi dans le lastmod,
// sinon Google ne voit jamais la date réelle du changement. Exclut "mesure-jugement" (pas de
// changement de contenu) et "backlog" (piste notée, pas encore réalisée).
const AGENT_LEVERS_WITH_CONTENT_CHANGE = new Set(["decouverte-indexation", "francais"]);

function agentJournalDates(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of agentJournal as { date: string; lever: string; pages: string[] }[]) {
    if (!AGENT_LEVERS_WITH_CONTENT_CHANGE.has(e.lever)) continue;
    for (const page of e.pages) {
      const path = page.replace(/^\/(en|fr|ar)/, "") || "/";
      if (!out[path] || e.date > out[path]) out[path] = e.date;
    }
  }
  return out;
}

const maxDate = (a: string, b?: string) => (b && b > a ? b : a);

type Path = {
  path: string;
  lastModified?: string;
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
    { path: "/job", changeFrequency: "weekly", priority: 0.8 },
    { path: "/saudization-tracker", lastModified: "2026-11-15", changeFrequency: "monthly", priority: 0.9 },
    { path: "/methodology", lastModified: "2026-11-15", changeFrequency: "monthly", priority: 0.8 },
    { path: "/pulse", changeFrequency: "weekly", priority: 0.7 },
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

  // Paires /relocate/X-to-Y : noindex depuis le 26/09, hors sitemap.

  const vsPaths: Path[] = getAllComparisonSlugs().map((slug) => ({
    path: `/vs/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const insightPaths: Path[] = getAllInsights().map((a) => ({
    path: `/insights/${a.slug}`,
    lastModified: a.date,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const pulsePaths: Path[] = getAllPulse().map((a) => ({
    path: `/pulse/${a.date}`,
    lastModified: a.date,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const rankingPaths: Path[] = RANKING_SLUGS.map((slug) => ({
    path: `/rankings/${slug}`, lastModified: "2026-11-15", changeFrequency: "monthly", priority: 0.9,
  }));
  const sectorPaths: Path[] = SECTORS.filter((sector) => getAllOccupations().filter((o) => o.sector_id === sector.id).length >= 5).map((sector) => ({
    path: `/sector/${sector.id}`, lastModified: "2026-11-15", changeFrequency: "monthly", priority: 0.8,
  }));

  const allPaths = [
    ...staticPaths,
    ...jobPaths,
    ...vsPaths,
    ...insightPaths,
    ...pulsePaths,
    ...rankingPaths,
    ...sectorPaths,
  ];

  // Emit 3 URL entries per path (one per lang), each with full hreflang alternates.
  // Next.js renders `alternates.languages` as <xhtml:link rel="alternate" hreflang>.
  const improved = improvementDates();
  const agentImproved = agentJournalDates();
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of LANGS) {
    for (const p of allPaths) {
      entries.push({
        url: `${BASE}/${lang}${p.path === "/" ? "" : p.path}`,
        lastModified: p.lastModified ?? maxDate(maxDate(CONTENT_UPDATED, improved[p.path]), agentImproved[p.path]),
        changeFrequency: p.changeFrequency,
        priority: p.priority,
        alternates: { languages: buildAlternates(p.path) },
      });
    }
  }

  return entries;
}
