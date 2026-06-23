/**
 * Article loader for /[lang]/insights/[slug] and /[lang]/pulse/[date].
 *
 * Articles are produced by the SEO Content Engine (radar2/seo_engine) and persisted
 * as JSON in src/data/{insights,pulse-articles}.json. Each record carries every
 * language inline. Routes, sitemap, and llms.txt all read from here — single source.
 *
 * No prose is generated here; this is pure data access. Fact-checking and quality
 * gating happen in the engine before a record ever lands in these files.
 */
import insightsData from "@/data/insights.json";
import pulseData from "@/data/pulse-articles.json";
import type { Lang } from "@/lib/i18n/context";

export type Source = { label: string; url: string };
export type H2Section = { q: string; body: string };
export type FaqItem = { q: string; a: string };

export type ArticleLangContent = {
  title: string;
  description: string;
  lede: string;
  h2_sections: H2Section[];
  faq: FaqItem[];
  key_takeaway: string;
  sources: Source[];
};

export type ArticleRecord = {
  slug: string;
  kind: "insights" | "pulse";
  date: string;
  published_at: string;
  keyword: string;
  author: string;
  author_title: string;
  author_url: string;
  primary_lang: Lang;
  hero_prompt: string;
  hero_image: string | null;
  og: Partial<Record<Lang, string>>;
  langs: Partial<Record<Lang, ArticleLangContent>>;
};

const INSIGHTS = insightsData as unknown as ArticleRecord[];
const PULSE = pulseData as unknown as ArticleRecord[];

function byDateDesc(a: ArticleRecord, b: ArticleRecord) {
  return (b.date || "").localeCompare(a.date || "");
}

// ----------------------------------------------------------------- insights
export function getAllInsights(): ArticleRecord[] {
  return [...INSIGHTS].sort(byDateDesc);
}

export function getInsightSlugs(): string[] {
  return INSIGHTS.map((a) => a.slug);
}

export function getInsightBySlug(slug: string): ArticleRecord | null {
  return INSIGHTS.find((a) => a.slug === slug) ?? null;
}

// --------------------------------------------------------------------- pulse
export function getAllPulse(): ArticleRecord[] {
  return [...PULSE].sort(byDateDesc);
}

export function getPulseDates(): string[] {
  return PULSE.map((a) => a.date);
}

export function getPulseByDate(date: string): ArticleRecord | null {
  return PULSE.find((a) => a.date === date) ?? null;
}

// ------------------------------------------------------------------- helpers
/** Returns the requested language content, falling back to the primary language. */
export function getLangContent(
  rec: ArticleRecord,
  lang: Lang,
): ArticleLangContent | null {
  return rec.langs[lang] ?? rec.langs[rec.primary_lang] ?? null;
}

export function hasInsights(): boolean {
  return INSIGHTS.length > 0;
}

export function hasPulse(): boolean {
  return PULSE.length > 0;
}
