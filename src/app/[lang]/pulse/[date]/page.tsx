import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Lang } from "@/lib/i18n/context";
import { buildLanguageAlternates, buildBreadcrumbLd, SITE_URL } from "@/lib/i18n/seo";
import { getAllPulse, getPulseByDate, getLangContent } from "@/lib/insights";
import ArticleView from "@/components/article/ArticleView";

const LANGS: Lang[] = ["en", "fr", "ar"];

export async function generateStaticParams() {
  const dates = getAllPulse().map((a) => a.date);
  return LANGS.flatMap((lang) => dates.map((date) => ({ lang, date })));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; date: string }>;
}): Promise<Metadata> {
  const { lang, date } = await params;
  const rec = getPulseByDate(date);
  if (!rec) return { title: "Pulse Not Found | SHIFT Observatory" };
  const c = getLangContent(rec, lang)!;
  return {
    title: `${c.title} | SHIFT Observatory`,
    description: c.description,
    keywords: rec.keyword,
    authors: [{ name: rec.author }],
    alternates: buildLanguageAlternates(lang, `/pulse/${date}`),
    openGraph: {
      type: "article",
      title: c.title,
      description: c.description,
      url: `${SITE_URL}/${lang}/pulse/${date}`,
      images: [rec.og?.[lang] ?? `${SITE_URL}/api/og?lang=${lang}&title=${encodeURIComponent(c.title)}`],
      publishedTime: rec.published_at || rec.date,
    },
    twitter: { card: "summary_large_image", title: c.title, description: c.description },
  };
}

export default async function PulsePage({
  params,
}: {
  params: Promise<{ lang: Lang; date: string }>;
}) {
  const { lang, date } = await params;
  const rec = getPulseByDate(date);
  if (!rec) notFound();
  const c = getLangContent(rec, lang);
  if (!c) notFound();

  const url = `${SITE_URL}/${lang}/pulse/${date}`;
  const ogImg = rec.og?.[lang] ?? `${SITE_URL}/api/og?lang=${lang}&title=${encodeURIComponent(c.title)}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.description,
    inLanguage: lang === "ar" ? "ar-SA" : lang,
    datePublished: rec.published_at || rec.date,
    dateModified: rec.published_at || rec.date,
    image: ogImg,
    author: {
      "@type": "Person",
      name: rec.author,
      ...(rec.author_title ? { jobTitle: rec.author_title } : {}),
      ...(rec.author_url ? { url: rec.author_url } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "SHIFT Observatory",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/apple-touch-icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const faqLd = c.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: c.faq.map((qa) => ({
          "@type": "Question",
          name: qa.q,
          acceptedAnswer: { "@type": "Answer", text: qa.a },
        })),
      }
    : null;

  const breadcrumbLd = buildBreadcrumbLd(lang, [
    { name: "Pulse", path: "/pulse" },
    { name: c.title, path: `/pulse/${date}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      {faqLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ArticleView rec={rec} content={c} lang={lang} />
    </>
  );
}
