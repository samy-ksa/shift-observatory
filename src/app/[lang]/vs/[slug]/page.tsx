import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComparison, getAllComparisonSlugs } from "@/data/comparisons";
import type { Lang } from "@/lib/i18n/context";
import VSClient from "@/app/vs/[slug]/client";
import { buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";

const LANGS: Lang[] = ["en", "fr", "ar"];

export function generateStaticParams() {
  const slugs = getAllComparisonSlugs();
  return LANGS.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = getComparison(slug);
  if (!data) return { title: "Not Found" };

  // FR has localized fields; AR falls back to EN until comparisons.ts ships AR.
  const title = lang === "fr" ? data.title_fr : data.title_en;
  const description =
    lang === "fr" ? data.description_fr : data.description_en;

  const alternates = buildLanguageAlternates(lang, `/vs/${slug}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "SHIFT Observatory",
      type: "article",
    },
  };
}

export default async function LangVSPage({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}) {
  const { slug } = await params;
  const data = getComparison(slug);
  if (!data) notFound();

  // FAQ stays in EN for now — full AR FAQPage localization batched in 3c
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq_en.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SHIFT Observatory", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `SHIFT vs ${data.competitor}`,
        item: `${SITE_URL}/vs/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <VSClient data={data} />
    </>
  );
}
