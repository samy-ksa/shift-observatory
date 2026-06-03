import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/context";
import RelocateClient from "@/app/relocate/client";
import { buildBreadcrumbLd, buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";

const TITLES: Record<Lang, string> = {
  en: "Saudi Arabia Cost of Living Calculator: Compare 65+ Items | Free Tool",
  fr: "Calculateur de coût de la vie en Arabie Saoudite : 65+ items | SHIFT",
  ar: "حاسبة تكلفة المعيشة في المملكة العربية السعودية: قارن 65+ صنفاً | أداة مجانية",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Compare cost of living between your city and Saudi Arabia. Housing, food, transport, schools, taxes — 65+ items compared. Free relocation calculator with personalized PDF report.",
  fr: "Comparez le coût de la vie entre votre ville et l'Arabie Saoudite. Logement, alimentation, transport, écoles, impôts — 65+ articles comparés. Calculateur gratuit avec rapport PDF personnalisé.",
  ar: "قارن تكلفة المعيشة بين مدينتك والمملكة العربية السعودية. السكن، الطعام، النقل، المدارس، الضرائب — أكثر من 65 صنفاً. حاسبة مجانية مع تقرير PDF شخصي.",
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <RelocateClient />
    </>
  );
}
