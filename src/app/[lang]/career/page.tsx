import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/i18n/context";
import CareerRecommender from "@/components/career/CareerRecommender";
import { buildBreadcrumbLd, buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";
import { localizedHref } from "@/lib/i18n/links";
import { recommendTransitions } from "@/lib/utils";
import { toSlug } from "@/lib/occupations";
import masterData from "@/data/master.json";
import type { Occupation } from "@/lib/data-types";

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

const SR_INTRO: Record<Lang, string> = {
  en: "Free career transition recommender for workers in Saudi Arabia. Select your current occupation from 237 scored jobs and get up to 5 personalized pivot recommendations toward lower AI-automation-risk occupations, each showing the risk score reduction, expected salary change in SAR, and the HRDF reskilling programs available for that transition. Built on the same composite score (Frey & Osborne automation probability, Eloundou LLM exposure, Nitaqat regulatory pressure, WEF demand signal) used across SHIFT Observatory. Free, instant, no signup.",
  fr: "Recommandeur gratuit de transition de carrière pour les travailleurs en Arabie Saoudite. Sélectionnez votre métier actuel parmi 237 professions notées et obtenez jusqu'à 5 recommandations de transition personnalisées vers des métiers à moindre risque IA, avec pour chacune la réduction du score de risque, l'évolution salariale attendue en SAR, et les programmes de formation HRDF disponibles pour cette transition. Basé sur le même score composite (probabilité d'automatisation Frey-Osborne, exposition LLM d'Eloundou, pression réglementaire Nitaqat, signal de demande WEF) utilisé dans tout SHIFT Observatory. Gratuit, instantané, sans inscription.",
  ar: "موصي مجاني لانتقال المهنة للعاملين في المملكة العربية السعودية. اختر مهنتك الحالية من بين 237 مهنة مقيّمة واحصل على حتى 5 توصيات انتقال شخصية نحو مهن أقل عرضة لمخاطر الذكاء الاصطناعي، مع تخفيض درجة المخاطر، التغيير المتوقع في الراتب بالريال السعودي، وبرامج التدريب HRDF المتاحة لهذا الانتقال لكل توصية. مبني على نفس الدرجة المركّبة (احتمالية الأتمتة Frey-Osborne، تعرض LLM من Eloundou، الضغط التنظيمي لنطاقات، إشارة الطلب من WEF) المستخدمة في جميع أنحاء مرصد شيفت. مجاني، فوري، بدون تسجيل.",
};

const BREADCRUMB_LABEL: Record<Lang, string> = {
  en: "Career Transition Recommender",
  fr: "Recommandeur de transition de carrière",
  ar: "موصي الانتقال المهني",
};

// Static, server-rendered examples (26/11 : /career est quasi vide pour Google,
// tout le contenu reel vient de CareerRecommender ("use client", rien avant
// selection d'un metier) — notIndexed en EN/FR/AR dans index-coverage.jsonl.
// Calcules avec le meme moteur (recommendTransitions) que l'outil interactif,
// aucun chiffre invente.
const EXAMPLES_HEADING: Record<Lang, string> = {
  en: "Example transitions",
  fr: "Exemples de transition",
  ar: "أمثلة على الانتقال",
};

const EXAMPLES_INTRO: Record<Lang, string> = {
  en: "Two of the highest AI-risk occupations tracked, and the top pivots the tool recommends for them. Select your own occupation above for a personalized result.",
  fr: "Deux des métiers les plus exposés à l'IA suivis par l'observatoire, et les meilleures pistes de reconversion que l'outil recommande pour eux. Sélectionnez votre propre métier ci-dessus pour un résultat personnalisé.",
  ar: "مهنتان من أعلى المهن تعرضاً لمخاطر الذكاء الاصطناعي، وأفضل مسارات التحول التي يوصي بها الأداة لهما. اختر مهنتك الخاصة أعلاه للحصول على نتيجة مخصصة.",
};

const SEE_FULL: Record<Lang, string> = {
  en: "See the full analysis for",
  fr: "Voir l'analyse complète pour",
  ar: "عرض التحليل الكامل لمهنة",
};

const DIFFICULTY_LABEL: Record<Lang, Record<"easy" | "moderate" | "hard", string>> = {
  en: { easy: "Easy", moderate: "Moderate", hard: "Hard" },
  fr: { easy: "Facile", moderate: "Modérée", hard: "Difficile" },
  ar: { easy: "سهل", moderate: "متوسط", hard: "صعب" },
};

const RISK_REDUCTION_LABEL: Record<Lang, (pts: number) => string> = {
  en: (pts) => `-${pts.toFixed(0)} pts AI risk`,
  fr: (pts) => `-${pts.toFixed(0)} pts de risque IA`,
  ar: (pts) => `-${pts.toFixed(0)} نقطة من مخاطر الذكاء الاصطناعي`,
};

const SALARY_CHANGE_LABEL: Record<Lang, (pct: number) => string> = {
  en: (pct) => (pct >= 0 ? `+${pct}% salary` : `${pct}% salary`),
  fr: (pct) => (pct >= 0 ? `+${pct}% de salaire` : `${pct}% de salaire`),
  ar: (pct) => (pct >= 0 ? `+${pct}% راتب` : `${pct}% راتب`),
};

function occupationName(o: Occupation, lang: Lang): string {
  if (lang === "fr") return o.name_fr || o.name_en;
  if (lang === "ar") return o.name_ar || o.name_en;
  return o.name_en;
}

const EXAMPLE_SOURCES = ["Data Entry Keyers", "Technical Writers"];

function buildExamples() {
  const allOccupations: Occupation[] = [
    ...(masterData.occupations.high_risk as Occupation[]),
    ...(masterData.occupations.low_risk as Occupation[]),
  ];
  return EXAMPLE_SOURCES.map((name) => {
    const source = allOccupations.find((o) => o.name_en === name)!;
    const picks = recommendTransitions(source, allOccupations, false).slice(0, 2);
    return { source, picks };
  });
}

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
  const examples = buildExamples();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <section className="sr-only">
        <h1>{SR_H1[lang]}</h1>
        <p>{SR_INTRO[lang]}</p>
      </section>
      <section className="max-w-3xl mx-auto px-4 pt-8" dir={lang === "ar" ? "rtl" : "ltr"}>
        <h2 className="text-lg font-semibold text-text-primary mb-2">{EXAMPLES_HEADING[lang]}</h2>
        <p className="text-sm text-text-secondary mb-5">{EXAMPLES_INTRO[lang]}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          {examples.map(({ source, picks }) => (
            <div key={source.name_en} className="rounded-lg border border-white/10 p-4">
              <Link
                href={localizedHref(lang, `/job/${toSlug(source.name_en)}`)}
                className="text-sm font-medium text-text-primary hover:underline"
              >
                {occupationName(source, lang)} ({source.composite}/100)
              </Link>
              <ul className="mt-3 space-y-3">
                {picks.map((p) => (
                  <li key={p.occupation.name_en} className="text-sm text-text-secondary">
                    <span className="text-text-primary">{occupationName(p.occupation, lang)}</span>
                    {" — "}
                    {RISK_REDUCTION_LABEL[lang](p.risk_reduction)}, {SALARY_CHANGE_LABEL[lang](p.salary_change_pct)},{" "}
                    {DIFFICULTY_LABEL[lang][p.transition_difficulty]}
                  </li>
                ))}
              </ul>
              <Link
                href={localizedHref(lang, `/career?occ=${toSlug(source.name_en)}`)}
                className="mt-3 inline-block text-sm text-cyan-400 hover:underline"
              >
                {SEE_FULL[lang]} {occupationName(source, lang)} →
              </Link>
            </div>
          ))}
        </div>
      </section>
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
