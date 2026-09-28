import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/i18n/context";
import { buildBreadcrumbLd, buildLanguageAlternates } from "@/lib/i18n/seo";
import { localizedHref } from "@/lib/i18n/links";
import { getAllPulse, getLangContent } from "@/lib/insights";

const TITLES: Record<Lang, string> = {
  en: "Weekly Pulse: AI Workforce Signals in Saudi Arabia | SHIFT Observatory",
  fr: "Pulse hebdomadaire : signaux IA sur l'emploi en Arabie Saoudite | SHIFT Observatory",
  ar: "النبض الأسبوعي: مؤشرات الذكاء الاصطناعي في سوق العمل السعودي | مرصد شيفت",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Every weekly edition of the SHIFT Observatory Pulse: global and Gulf AI-related layoffs, tracked week over week.",
  fr: "Toutes les éditions hebdomadaires du Pulse de SHIFT Observatory : suppressions d'emplois liées à l'IA dans le monde et dans le Golfe, semaine après semaine.",
  ar: "جميع الإصدارات الأسبوعية لنبض مرصد شيفت: تسريح الوظائف المرتبط بالذكاء الاصطناعي عالمياً وفي الخليج، أسبوعاً بعد أسبوع.",
};

const H1: Record<Lang, string> = {
  en: "Weekly Pulse",
  fr: "Pulse hebdomadaire",
  ar: "النبض الأسبوعي",
};

const INTRO: Record<Lang, string> = {
  en: "A weekly read on AI-related workforce moves worldwide and in the Gulf, from SHIFT Observatory. Browse past editions below.",
  fr: "Un point hebdomadaire sur les mouvements de l'emploi liés à l'IA dans le monde et dans le Golfe, par SHIFT Observatory. Retrouvez les éditions précédentes ci-dessous.",
  ar: "قراءة أسبوعية لحركة سوق العمل المرتبطة بالذكاء الاصطناعي عالمياً وفي الخليج، من مرصد شيفت. تصفح الإصدارات السابقة أدناه.",
};

const BREADCRUMB_LABEL: Record<Lang, string> = {
  en: "Pulse",
  fr: "Pulse",
  ar: "النبض",
};

const EMPTY: Record<Lang, string> = {
  en: "No edition published yet.",
  fr: "Aucune édition publiée pour l'instant.",
  ar: "لم يُنشر أي إصدار بعد.",
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
    alternates: buildLanguageAlternates(lang, "/pulse"),
  };
}

export default async function PulseIndexPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const breadcrumbLd = buildBreadcrumbLd(lang, [
    { name: BREADCRUMB_LABEL[lang], path: "/pulse" },
  ]);

  const editions = getAllPulse();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <main className="max-w-3xl mx-auto px-4 py-10" dir={dir}>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
          {H1[lang]}
        </h1>
        <p className="text-text-secondary text-sm md:text-base mb-8 max-w-2xl">
          {INTRO[lang]}
        </p>

        {editions.length === 0 ? (
          <p className="text-text-secondary text-sm">{EMPTY[lang]}</p>
        ) : (
          <ul className="space-y-4">
            {editions.map((rec) => {
              const c = getLangContent(rec, lang);
              if (!c) return null;
              return (
                <li key={rec.date} className="border-b border-white/10 pb-4">
                  <Link
                    href={localizedHref(lang, `/pulse/${rec.date}`)}
                    className="block group"
                  >
                    <time
                      dateTime={rec.date}
                      className="text-xs text-text-muted font-mono"
                    >
                      {rec.date}
                    </time>
                    <h2 className="text-base font-semibold text-text-primary group-hover:underline mt-0.5">
                      {c.title}
                    </h2>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {c.description}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
