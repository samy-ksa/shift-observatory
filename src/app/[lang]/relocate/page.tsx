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
  // Lead with "Cost of Living Saudi Arabia 2026" (cluster keyword carrying 9+7
  // impressions on GSC) + a curiosity gap ("How Much Salary You Need") that
  // differentiates from generic aggregators (Numbeo/Expatistan) at position 25.
  en: "Cost of Living Saudi Arabia 2026: How Much Salary You Need",
  fr: "Coût de la vie en Arabie Saoudite 2026 : quel salaire pour vivre",
  ar: "تكلفة المعيشة في السعودية 2026: ما الراتب الذي تحتاجه",
};

const DESCRIPTIONS: Record<Lang, string> = {
  // Add data-source trust signal ("Numbeo + GASTAT") absent from competitors.
  en: "Free calculator comparing your city to Riyadh, Jeddah, Dammam. 65 prices, required salary, downloadable PDF. Numbeo + GASTAT data. No signup.",
  fr: "Calculateur gratuit comparant votre ville à Riyad, Djeddah, Dammam. 65 prix, salaire nécessaire, PDF téléchargeable. Sources Numbeo + GASTAT. Sans inscription.",
  ar: "حاسبة مجانية تقارن مدينتك بالرياض وجدة والدمام. 65 سعراً، الراتب المطلوب، تقرير PDF. مصادر Numbeo + GASTAT. بدون تسجيل.",
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
