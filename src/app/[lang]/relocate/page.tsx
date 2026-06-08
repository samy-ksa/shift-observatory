import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/context";
import RelocateClient from "@/app/relocate/client";
import { buildBreadcrumbLd, buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";
import {
  CostOfLivingLede,
  CostOfLivingDepth,
  FAQ,
} from "@/components/relocate/CostOfLivingEditorial";

const TITLES: Record<Lang, string> = {
  // EN: leads with cluster keyword "Cost of Living" + year + value prop (salary needed) — 60 chars
  en: "Cost of Living Saudi Arabia (2026): Free Calc + Salary Needed",
  fr: "Coût de la vie en Arabie Saoudite (2026) : calc + salaire requis",
  ar: "تكلفة المعيشة في السعودية 2026: حاسبة مجانية + الراتب المطلوب",
};

const DESCRIPTIONS: Record<Lang, string> = {
  // EN: action-oriented, mentions cities, ends with "PDF report" hook — 140 chars
  en: "Free calculator: see the salary you need in Riyadh, Jeddah or Dammam vs your home city. 65 items priced. PDF report. No signup.",
  fr: "Calculateur gratuit : découvrez le salaire qu'il vous faut à Riyad, Djeddah ou Dammam vs votre ville. 65 postes chiffrés. Rapport PDF. Sans inscription.",
  ar: "حاسبة مجانية: اكتشف الراتب المطلوب في الرياض أو جدة أو الدمام مقارنة بمدينتك. 65 بنداً مُسعّراً. تقرير PDF. بدون تسجيل.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: TITLES[lang],
    description: DESCRIPTIONS[lang],
    openGraph: {
      title: TITLES[lang],
      description: DESCRIPTIONS[lang],
      images: [`${SITE_URL}/api/og?lang=${lang}&title=Relocation+Calculator`],
    },
    alternates: buildLanguageAlternates(lang, "/relocate"),
  };
}

const BREADCRUMB_LABEL: Record<Lang, string> = {
  en: "Relocation Calculator",
  fr: "Calculateur de relocation",
  ar: "حاسبة الانتقال",
};

export default async function LangRelocatePage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const breadcrumbLd = buildBreadcrumbLd(lang, [
    { name: BREADCRUMB_LABEL[lang], path: "/relocate" },
  ]);

  // FAQPage JSON-LD targeting the "cost of living in Saudi Arabia" cluster.
  // Per Google policy (Aug 2023), FAQ rich results are restricted to government
  // and health sites — so this won't show as a SERP accordion, but it remains
  // a strong signal for AI Overviews and Perplexity citation.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ[lang].map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <CostOfLivingLede lang={lang} />
      <RelocateClient />
      <CostOfLivingDepth lang={lang} />
    </>
  );
}
