import { NextResponse } from "next/server";
import { getAllOccupations, toSlug } from "@/lib/occupations";

const SITE_URL = "https://www.ksashiftobservatory.online";

/** Static pages with their priority and change frequency */
const STATIC_PAGES: Array<{
  path: string;
  priority: number;
  changefreq: string;
  hreflang?: boolean;
}> = [
  { path: "/", priority: 1.0, changefreq: "weekly", hreflang: true },
  { path: "/profile", priority: 0.9, changefreq: "weekly", hreflang: true },
  { path: "/career", priority: 0.8, changefreq: "weekly", hreflang: true },
  { path: "/privacy", priority: 0.3, changefreq: "monthly" },
  { path: "/terms", priority: 0.3, changefreq: "monthly" },
  { path: "/cookies", priority: 0.3, changefreq: "monthly" },
];

/**
 * Generate dynamic job pages from the occupations data.
 */
async function getDynamicPages(): Promise<
  Array<{ path: string; priority: number; changefreq: string; lastmod?: string }>
> {
  const occupations = getAllOccupations();
  return occupations.map((o) => ({
    path: `/job/${toSlug(o.name_en)}`,
    priority: 0.7,
    changefreq: "monthly",
  }));
}

function buildUrlEntry(page: {
  path: string;
  priority: number;
  changefreq: string;
  hreflang?: boolean;
  lastmod?: string;
}): string {
  const loc = `${SITE_URL}${page.path === "/" ? "" : page.path}`;
  const lastmod = page.lastmod
    ? `\n    <lastmod>${page.lastmod}</lastmod>`
    : "";

  const hreflangTags = page.hreflang
    ? `
    <xhtml:link rel="alternate" hreflang="en" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`
    : "";

  return `  <url>
    <loc>${loc}</loc>${lastmod}${hreflangTags}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`;
}

export async function GET() {
  const dynamicPages = await getDynamicPages();
  const allPages = [...STATIC_PAGES, ...dynamicPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(buildUrlEntry).join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
