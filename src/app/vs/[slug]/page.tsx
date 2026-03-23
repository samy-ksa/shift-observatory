import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComparison, getAllComparisonSlugs } from "@/data/comparisons";
import VSClient from "./client";

const SITE = "https://www.ksashiftobservatory.online";

export function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = getComparison(params.slug);
  if (!data) return { title: "Not Found" };

  return {
    title: data.title_en,
    description: data.description_en,
    alternates: { canonical: `${SITE}/vs/${params.slug}` },
    openGraph: {
      title: data.title_en,
      description: data.description_en,
      url: `${SITE}/vs/${params.slug}`,
      siteName: "SHIFT Observatory",
      type: "article",
    },
  };
}

export default function VSPage({ params }: { params: { slug: string } }) {
  const data = getComparison(params.slug);
  if (!data) notFound();

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
      { "@type": "ListItem", position: 1, name: "SHIFT Observatory", item: SITE },
      { "@type": "ListItem", position: 2, name: `SHIFT vs ${data.competitor}`, item: `${SITE}/vs/${params.slug}` },
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
