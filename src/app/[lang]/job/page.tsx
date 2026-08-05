import type { Metadata } from "next";
import Link from "next/link";
import type { Lang } from "@/lib/i18n/context";
import { buildBreadcrumbLd, buildLanguageAlternates } from "@/lib/i18n/seo";
import { localizedHref } from "@/lib/i18n/links";
import { getAllOccupations, getSector, toSlug, riskColor, fmt } from "@/lib/occupations";

const TITLES: Record<Lang, string> = {
  en: "Jobs in Saudi Arabia for Foreigners: 237 Roles Scored",
  fr: "Emplois en Arabie Saoudite pour expatriés : 237 métiers notés",
  ar: "وظائف في السعودية للأجانب: 237 مهنة مقيّمة",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "216 of 237 tracked occupations are open to expats under Nitaqat sector quotas. Compare salary, AI automation risk, and visa eligibility for every role. Free, no signup.",
  fr: "216 des 237 métiers suivis sont ouverts aux expatriés sous quotas Nitaqat. Comparez salaire, risque d'automatisation IA et éligibilité au visa pour chaque métier. Gratuit.",
  ar: "216 من أصل 237 مهنة مرصودة مفتوحة للوافدين ضمن حصص نطاقات القطاعية. قارن الراتب ومخاطر الأتمتة وأهلية التأشيرة لكل مهنة. مجاناً.",
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

const FAQ_HEADING: Record<Lang, string> = {
  en: "Frequently Asked Questions",
  fr: "Questions fréquentes",
  ar: "الأسئلة الشائعة",
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

  const allOccs = getAllOccupations();
  const bySector = new Map<string, ReturnType<typeof getAllOccupations>>();
  for (const occ of allOccs) {
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

  const openOccs = allOccs.filter((o) => o.nitaqat_status !== "reserved_saudi_only");
  const reservedCount = allOccs.length - openOccs.length;
  const topPaid = [...openOccs]
    .sort((a, b) => (b.salary_senior_sar || 0) - (a.salary_senior_sar || 0))
    .slice(0, 3);
  const lowRisk = [...openOccs].sort((a, b) => a.composite - b.composite).slice(0, 3);

  const nameOf = (o: (typeof allOccs)[number]) =>
    occupationName(o.name_en, o.name_fr, o.name_ar, lang);

  const faqText = {
    en: {
      q1: "Can foreigners get jobs in Saudi Arabia?",
      a1: `Yes. ${openOccs.length} of the ${allOccs.length} occupations SHIFT Observatory tracks are open to expatriates under Nitaqat sector quotas — you need a job offer, work visa, and iqama. ${reservedCount} occupations are reserved exclusively for Saudi nationals under HRSD regulations.`,
      q2: "Which jobs in Saudi Arabia pay the most for expats?",
      a2: `Among occupations open to expats, the highest-paying are ${topPaid.map((o) => `${nameOf(o)} (up to ${fmt(o.salary_senior_sar)} SAR/month)`).join(", ")}.`,
      q3: "Which Saudi Arabia jobs have the lowest AI automation risk?",
      a3: `The lowest AI-risk occupations open to expats are ${lowRisk.map((o) => `${nameOf(o)} (${o.composite}/100)`).join(", ")} — roles requiring physical presence or interpersonal judgment score lowest.`,
    },
    fr: {
      q1: "Les expatriés peuvent-ils travailler en Arabie Saoudite ?",
      a1: `Oui. ${openOccs.length} des ${allOccs.length} métiers suivis par SHIFT Observatory sont ouverts aux expatriés sous quotas sectoriels Nitaqat — il faut une offre d'emploi, un visa de travail et une iqama. ${reservedCount} métiers sont réservés exclusivement aux nationaux saoudiens.`,
      q2: "Quels métiers paient le mieux les expatriés en Arabie Saoudite ?",
      a2: `Parmi les métiers ouverts aux expatriés, les mieux payés sont ${topPaid.map((o) => `${nameOf(o)} (jusqu'à ${fmt(o.salary_senior_sar)} SAR/mois)`).join(", ")}.`,
      q3: "Quels métiers ont le risque d'automatisation IA le plus faible ?",
      a3: `Les métiers ouverts aux expatriés avec le risque IA le plus faible sont ${lowRisk.map((o) => `${nameOf(o)} (${o.composite}/100)`).join(", ")}.`,
    },
    ar: {
      q1: "هل يمكن للأجانب العمل في المملكة العربية السعودية؟",
      a1: `نعم. ${openOccs.length} من أصل ${allOccs.length} مهنة يرصدها مرصد شيفت مفتوحة للوافدين ضمن حصص نطاقات القطاعية — تحتاج إلى عرض عمل وتأشيرة عمل وإقامة. ${reservedCount} مهنة محصورة حصرياً على المواطنين السعوديين.`,
      q2: "ما هي أعلى الوظائف أجراً للوافدين في السعودية؟",
      a2: `من بين المهن المفتوحة للوافدين، الأعلى أجراً هي ${topPaid.map((o) => `${nameOf(o)} (حتى ${fmt(o.salary_senior_sar)} ريال/شهر)`).join("، ")}.`,
      q3: "ما هي المهن الأقل مخاطرة من الذكاء الاصطناعي؟",
      a3: `المهن المفتوحة للوافدين ذات أقل مخاطر أتمتة هي ${lowRisk.map((o) => `${nameOf(o)} (${o.composite}/100)`).join("، ")}.`,
    },
  }[lang];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: faqText.q1, acceptedAnswer: { "@type": "Answer", text: faqText.a1 } },
      { "@type": "Question", name: faqText.q2, acceptedAnswer: { "@type": "Answer", text: faqText.a2 } },
      { "@type": "Question", name: faqText.q3, acceptedAnswer: { "@type": "Answer", text: faqText.a3 } },
    ],
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

        <section className="mt-14 pt-10 border-t border-white/10" aria-label={FAQ_HEADING[lang]}>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {FAQ_HEADING[lang]}
          </h2>
          <div className="space-y-5">
            {[
              [faqText.q1, faqText.a1],
              [faqText.q2, faqText.a2],
              [faqText.q3, faqText.a3],
            ].map(([q, a]) => (
              <div key={q}>
                <h3 className="text-sm font-medium text-text-primary mb-1">{q}</h3>
                <p className="text-sm text-text-secondary max-w-2xl">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
