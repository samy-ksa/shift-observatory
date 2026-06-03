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

  const title =
    lang === "fr" ? data.title_fr : lang === "ar" ? data.title_ar : data.title_en;
  const description =
    lang === "fr"
      ? data.description_fr
      : lang === "ar"
        ? data.description_ar
        : data.description_en;

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
  const { lang, slug } = await params;
  const data = getComparison(slug);
  if (!data) notFound();

  // FAQ localized per lang — uses faq_ar / faq_fr / faq_en accordingly
  const faqs =
    lang === "ar" ? data.faq_ar : lang === "fr" ? data.faq_fr : data.faq_en;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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
