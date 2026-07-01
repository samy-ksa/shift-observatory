import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/i18n/context";
import { buildBreadcrumbLd, buildLanguageAlternates } from "@/lib/i18n/seo";
import { localizedHref } from "@/lib/i18n/links";
import { getAllOccupations, getSector, toSlug, riskColor } from "@/lib/occupations";

const TITLES: Record<Lang, string> = {
  en: "Browse All 237 Occupations | SHIFT Observatory",
  fr: "Parcourir les 237 métiers | SHIFT Observatory",
  ar: "تصفح جميع المهن (237) | مرصد شيفت",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Full directory of 237 occupations rated for AI automation risk in Saudi Arabia, grouped by sector. Find any role's risk score, salary range, and Nitaqat status.",
  fr: "Répertoire complet des 237 métiers évalués selon leur risque d'automatisation IA en Arabie Saoudite, classés par secteur. Score de risque, salaire et statut Nitaqat pour chaque métier.",
  ar: "دليل شامل لـ 237 مهنة مقيّمة حسب مخاطر أتمتة الذكاء الاصطناعي في المملكة العربية السعودية، مصنفة حسب القطاع. درجة المخاطر ونطاق الراتب وحالة نطاقات لكل مهنة.",
};

const H1: Record<Lang, string> = {
  en: "Browse All Occupations",
  fr: "Parcourir tous les métiers",
  ar: "تصفح جميع المهن",
};

const INTRO: Record<Lang, string> = {
  en: "Every occupation SHIFT Observatory tracks, grouped by sector. Click any role for its AI automation risk score, salary range, and Nitaqat status in Saudi Arabia.",
  fr: "Tous les métiers suivis par SHIFT Observatory, classés par secteur. Cliquez sur un métier pour son score de risque d'automatisation IA, son salaire et son statut Nitaqat en Arabie Saoudite.",
  ar: "جميع المهن التي يرصدها مرصد شيفت، مصنفة حسب القطاع. اضغط على أي مهنة للاطلاع على درجة مخاطر الأتمتة والراتب وحالة نطاقات في المملكة العربية السعودية.",
};

const BREADCRUMB_LABEL: Record<Lang, string> = {
  en: "Browse All Occupations",
  fr: "Parcourir tous les métiers",
  ar: "تصفح جميع المهن",
};

function sectorName(sectorId: string | undefined, lang: Lang): string {
  const sector = sectorId ? getSector(sectorId) : undefined;
  if (!sector) return lang === "ar" ? "أخرى" : lang === "fr" ? "Autre" : "Other";
  if (lang === "fr") return sector.name_fr || sector.name_en;
  if (lang === "ar") return sector.name_ar || sector.name_en;
  return sector.name_en;
}

function occupationName(name_en: string, name_fr: string, name_ar: string, lang: Lang): string {
  if (lang === "fr") return name_fr || name_en;
  if (lang === "ar") return name_ar || name_en;
  return name_en;
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
    alternates: buildLanguageAlternates(lang, "/job"),
  };
}

export default async function JobIndexPage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const breadcrumbLd = buildBreadcrumbLd(lang, [
    { name: BREADCRUMB_LABEL[lang], path: "/job" },
  ]);

  const bySector = new Map<string, ReturnType<typeof getAllOccupations>>();
  for (const occ of getAllOccupations()) {
    const key = occ.sector_id || "other";
    if (!bySector.has(key)) bySector.set(key, []);
    bySector.get(key)!.push(occ);
  }
  const sections = Array.from(bySector.entries())
    .map(([sectorId, occs]) => ({
      sectorId,
      name: sectorName(sectorId, lang),
      occs: [...occs].sort((a, b) => b.composite - a.composite),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, lang));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <main className="max-w-5xl mx-auto px-4 py-10" dir={dir}>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
          {H1[lang]}
        </h1>
        <p className="text-text-secondary text-sm md:text-base mb-10 max-w-2xl">
          {INTRO[lang]}
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.sectorId} aria-label={section.name}>
              <h2 className="text-lg font-semibold text-text-primary mb-3 pb-2 border-b border-white/10">
                {section.name}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                {section.occs.map((occ) => (
                  <li key={`${occ.name_en}-${occ.composite}`}>
                    <Link
                      href={localizedHref(lang, `/job/${toSlug(occ.name_en)}`)}
                      className="flex items-baseline justify-between gap-2 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <span className="truncate">
                        {occupationName(occ.name_en, occ.name_fr, occ.name_ar, lang)}
                      </span>
                      <span className={`font-mono text-xs shrink-0 ${riskColor(occ.composite)}`}>
                        {occ.composite}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
