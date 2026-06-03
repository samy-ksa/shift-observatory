/**
 * SEO helpers for the [lang] router migration.
 *
 * Centralizes:
 *  - hreflang alternates (5 entries: en, fr, ar, ar-SA, x-default)
 *  - canonical URL per locale
 *
 * Each page's generateMetadata() should call buildLanguageAlternates(lang, path)
 * and spread the result into metadata.alternates.
 *
 * Convention:
 *  - x-default → /en/{path} (English audience is the SEO baseline)
 *  - ar-SA → same URL as ar (geo-targets Saudi Arabia specifically)
 */

import type { Lang } from "./context";

export const SITE_URL = "https://www.ksashiftobservatory.online";

type AlternatesMetadata = {
  canonical: string;
  languages: Record<string, string>;
};

function urlFor(lang: Lang, path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`buildLanguageAlternates: path must start with "/", got: ${path}`);
  }
  return `${SITE_URL}/${lang}${path === "/" ? "" : path}`;
}

/**
 * Build the metadata.alternates block for a page.
 *
 * @param currentLang - the page's locale (drives the canonical)
 * @param path - the unlocalized path (e.g. "/", "/career", "/job/data-scientist")
 */
export function buildLanguageAlternates(
  currentLang: Lang,
  path: string,
): AlternatesMetadata {
  return {
    canonical: urlFor(currentLang, path),
    languages: {
      en: urlFor("en", path),
      fr: urlFor("fr", path),
      ar: urlFor("ar", path),
      "ar-SA": urlFor("ar", path),
      "x-default": urlFor("en", path),
    },
  };
}

/**
 * Localized labels for breadcrumb "Home" item across the site.
 */
const HOME_LABEL: Record<Lang, string> = {
  en: "SHIFT Observatory",
  fr: "SHIFT Observatory",
  ar: "مرصد شيفت",
};

type BreadcrumbItem = { name: string; path: string };

/**
 * Build a BreadcrumbList JSON-LD schema for the given trail.
 *
 * The "Home" entry is auto-prepended; pass only the descendant items.
 * URLs are locale-prefixed automatically.
 *
 * @example
 * buildBreadcrumbLd("ar", [{ name: "موصي الانتقال المهني", path: "/career" }])
 */
export function buildBreadcrumbLd(
  lang: Lang,
  trail: BreadcrumbItem[],
) {
  const items = [
    { name: HOME_LABEL[lang], path: "/" },
    ...trail,
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: urlFor(lang, item.path),
    })),
  };
}
