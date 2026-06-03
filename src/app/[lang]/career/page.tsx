import { Suspense } from "react";
import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/context";
import CareerRecommender from "@/components/career/CareerRecommender";
import { buildBreadcrumbLd, buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";

const TITLES: Record<Lang, string> = {
  en: "Career Transition Recommender | SHIFT Observatory",
  fr: "Recommandeur de transition de carrière | SHIFT Observatory",
  ar: "موصي الانتقال المهني | مرصد شيفت",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Find AI-safe career paths based on your current occupation. Get personalized transition recommendations with risk reduction, salary change, and training paths.",
  fr: "Trouvez des parcours de carrière protégés de l'IA selon votre métier actuel. Recommandations personnalisées avec réduction de risque, évolution salariale et formations.",
  ar: "ابحث عن المسارات المهنية الآمنة من الذكاء الاصطناعي بناءً على مهنتك الحالية. توصيات شخصية للانتقال مع تقليل المخاطر، تغيير الراتب، ومسارات التدريب.",
};

const SR_H1: Record<Lang, string> = {
  en: "AI-Resilient Career Paths in Saudi Arabia — Career Transition Recommender",
  fr: "Parcours de carrière résilients à l'IA en Arabie Saoudite — Recommandeur de transition",
  ar: "مسارات مهنية مرنة للذكاء الاصطناعي في المملكة العربية السعودية — موصي الانتقال المهني",
};

const BREADCRUMB_LABEL: Record<Lang, string> = {
  en: "Career Transition Recommender",
  fr: "Recommandeur de transition de carrière",
  ar: "موصي الانتقال المهني",
};

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }, { lang: "ar" }];
}

export const dynamicParams = false;

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
      images: [`${SITE_URL}/api/og/career?lang=${lang}`],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLES[lang],
      images: [`${SITE_URL}/api/og/career?lang=${lang}`],
    },
    alternates: buildLanguageAlternates(lang, "/career"),
  };
}

export default async function LangCareerPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const breadcrumbLd = buildBreadcrumbLd(lang, [
    { name: BREADCRUMB_LABEL[lang], path: "/career" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <h1 className="sr-only">{SR_H1[lang]}</h1>
      <Suspense
        fallback={
          <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="text-text-muted animate-pulse">Loading...</div>
          </div>
        }
      >
        <CareerRecommender />
      </Suspense>
    </>
  );
}
