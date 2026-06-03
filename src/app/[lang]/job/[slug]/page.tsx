import type { Metadata } from "next";
import {
  getAllOccupations,
  findBySlug,
  toSlug,
  getSector,
  getRelatedOccupations,
  getRelevantTawteen,
  isReservedProfession,
  riskLabel,
  fmt,
} from "@/lib/occupations";
import JobPageClient from "@/app/job/[slug]/client";
import { getScoreTrend } from "@/data/score-history";
import type { Lang } from "@/lib/i18n/context";
import { buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";

const LANGS: Lang[] = ["en", "fr", "ar"];

export async function generateStaticParams() {
  const slugs = getAllOccupations().map((o) => toSlug(o.name_en));
  return LANGS.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const occ = findBySlug(slug);
  if (!occ) {
    return { title: "Occupation Not Found | SHIFT Observatory" };
  }

  const rl = riskLabel(occ.composite);
  const median = fmt(occ.salary_median_sar ?? occ.salary_entry_sar);
  const entry = fmt(occ.salary_entry_sar);
  const senior = fmt(occ.salary_senior_sar);

  const smartSlice = (s: string): string => {
    let cut = 59;
    if (/[\d,]/.test(s[cut - 1])) {
      const lastSpace = s.lastIndexOf(" ", cut - 1);
      cut = lastSpace > 0 ? lastSpace : cut;
    }
    const result = s.slice(0, cut).trimEnd().replace(/[:–—&/,]+$/, "").trimEnd();
    return result + "…";
  };
  const firstFit = (...candidates: string[]): string => {
    for (const t of candidates) {
      if (t.length <= 60) return t;
    }
    return smartSlice(candidates[candidates.length - 1]);
  };
  const clampDesc = (d: string): string => {
    if (d.length <= 158) return d;
    const truncated = d.slice(0, 155);
    const lastSpace = truncated.lastIndexOf(" ");
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "…";
  };

  // Lang-driven naming. AR uses name_ar when present; falls back to EN.
  const name =
    lang === "fr"
      ? occ.name_fr || occ.name_en
      : lang === "ar"
        ? occ.name_ar || occ.name_en
        : occ.name_en;
  const { composite } = occ;

  let title: string;
  let description: string;

  if (lang === "fr") {
    if (composite >= 70) {
      title = firstFit(
        `${name} : ${composite}/100 risque IA en Arabie Saoudite 2026`,
        `${name} : ${composite}/100 risque IA — Arabie Saoudite`,
        `${name} : ${composite}/100 risque IA KSA`,
        `${name} — Arabie Saoudite`,
      );
      description = `${composite}/100 risque d'automatisation IA pour ${name} en Arabie Saoudite. Salaire ${entry}–${senior} SAR/mois. Voir transitions plus sûres — gratuit.`;
    } else if (composite >= 45) {
      title = firstFit(
        `${name} Arabie Saoudite : ${composite}/100 risque IA, ${median} SAR`,
        `${name} : ${composite}/100 risque IA, ${median} SAR`,
        `${name} — Arabie Saoudite`,
      );
      description = `${name} en Arabie Saoudite : ${composite}/100 risque IA, ${entry}–${senior} SAR/mois (sans impôt). Nitaqat, éligibilité expat. Gratuit.`;
    } else {
      title = firstFit(
        `${name} Salaire Arabie Saoudite 2026 : ${entry}–${senior} SAR/mois`,
        `${name} Salaire Arabie Saoudite : ${median} SAR/mois`,
        `${name} — Arabie Saoudite`,
      );
      description = `${name} en Arabie Saoudite gagne ${entry}–${senior} SAR/mois (sans impôt). Risque IA faible (${composite}/100). Guide expat.`;
    }
  } else if (lang === "ar") {
    // AR: localized title with EN name fallback when name_ar missing
    title = firstFit(
      `${name}: ${composite}/100 مخاطر الذكاء الاصطناعي في السعودية 2026`,
      `${name}: ${composite}/100 مخاطر الذكاء الاصطناعي`,
      `${name} — السعودية`,
    );
    description = `${composite}/100 درجة مخاطر الأتمتة بالذكاء الاصطناعي لـ ${name} في المملكة العربية السعودية. الراتب ${entry}–${senior} ريال/شهر. مجاناً.`;
  } else {
    // English (existing logic, unchanged)
    if (composite >= 70) {
      title = firstFit(
        `${name}: ${composite}/100 AI Risk in Saudi Arabia 2026`,
        `${name}: ${composite}/100 AI Risk — Saudi Arabia`,
        `${name}: ${composite}/100 AI Risk KSA`,
        `${name}: High AI Risk in Saudi Arabia`,
        `${name} — Saudi Arabia`,
        `${name} — KSA`,
      );
      description = `${composite}/100 AI automation risk for ${name} in Saudi Arabia. Salary ${entry}–${senior} SAR/mo. See safer career paths & 2026 outlook — free, no signup.`;
    } else if (composite >= 45) {
      title = firstFit(
        `${name} Saudi Arabia: ${composite}/100 AI Risk, ${median} SAR`,
        `${name}: AI Risk ${composite}/100 · ${median} SAR/mo`,
        `${name}: ${composite}/100 AI Risk, ${median} SAR`,
        `${name} AI Risk ${composite}/100 KSA`,
        `${name}: AI Risk & Salary, Saudi Arabia`,
        `${name} — Saudi Arabia`,
        `${name} — KSA`,
      );
      description = `${name} in Saudi Arabia: ${composite}/100 AI risk, ${entry}–${senior} SAR/mo (tax-free). Nitaqat status, expat eligibility & career transitions. Free.`;
    } else {
      title = firstFit(
        `${name} Salary Saudi Arabia 2026: ${entry}–${senior} SAR/mo`,
        `${name} Salary Saudi Arabia: ${median} SAR/month`,
        `${name} Salary in Saudi Arabia: ${median} SAR`,
        `${name} Salary KSA: ${median} SAR/mo`,
        `${name} Salary in Saudi Arabia (2026)`,
        `${name} — Saudi Arabia`,
        `${name} — KSA`,
      );
      description = `${name} in Saudi Arabia earns ${entry}–${senior} SAR/mo (tax-free). Low AI risk (${composite}/100). Nitaqat status, expat visa guide & demand outlook. Free.`;
    }
  }

  if (occ.nitaqat_status === "reserved_saudi_only" && lang === "en") {
    description = clampDesc("Reserved for Saudi nationals. " + description);
  } else {
    description = clampDesc(description);
  }

  return {
    title,
    description,
    keywords: [
      occ.name_en,
      occ.name_ar,
      occ.name_fr || occ.name_en,
      "AI risk Saudi Arabia",
      `${occ.name_en} salary KSA`,
      `${occ.name_fr || occ.name_en} Arabie Saoudite`,
      `risque IA ${occ.name_fr || occ.name_en}`,
    ].join(", "),
    openGraph: {
      title: `${name} — ${rl} (${occ.composite}/100)`,
      description: `AI automation risk analysis for ${occ.name_en} in Saudi Arabia`,
      images: [
        `${SITE_URL}/api/og?lang=${lang}&occupation=${encodeURIComponent(occ.name_en)}&score=${occ.composite}`,
      ],
    },
    alternates: buildLanguageAlternates(lang, `/job/${slug}`),
  };
}

export default async function LangJobPage({
  params,
}: {
  params: Promise<{ lang: Lang; slug: string }>;
}) {
  const { lang, slug } = await params;
  const occ = findBySlug(slug);

  if (!occ) {
    return (
      <JobPageClient
        occupation={null}
        related={[]}
        sector={null}
        tawteen={[]}
        reserved={false}
      />
    );
  }

  const sector = getSector(occ.sector_id) ?? null;
  const related = getRelatedOccupations(occ, 5);
  const tawteen = getRelevantTawteen(occ);
  const reserved = isReservedProfession(occ);

  const wefDesc = (occ.wef_trend || "").includes("decline")
    ? "declining"
    : (occ.wef_trend || "").includes("growth")
      ? "growing"
      : "stable";

  // FAQ: EN base always. FR additions when lang=fr. AR Phase 3c.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the AI automation risk for ${occ.name_en} in Saudi Arabia?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            occ.composite >= 70
              ? `${occ.name_en} has an AI automation risk score of ${occ.composite}/100 in Saudi Arabia according to SHIFT Observatory. This is classified as very high risk — this occupation faces near-certain significant disruption from AI automation. The score combines automation probability (Frey & Osborne, Eloundou et al.), salary impact, Nitaqat regulatory pressure, and WEF demand signals.`
              : occ.composite >= 45
                ? `${occ.name_en} has an AI automation risk score of ${occ.composite}/100 in Saudi Arabia according to SHIFT Observatory. This is classified as high risk — this occupation faces substantial automation pressure. The score combines automation probability (Frey & Osborne, Eloundou et al.), salary impact, Nitaqat regulatory pressure, and WEF demand signals.`
                : occ.composite >= 25
                  ? `${occ.name_en} has an AI automation risk score of ${occ.composite}/100 in Saudi Arabia according to SHIFT Observatory. This is classified as moderate risk — some tasks are automatable but human judgment provides partial protection. The score combines automation probability, salary impact, Nitaqat regulatory pressure, and WEF demand signals.`
                  : `${occ.name_en} has an AI automation risk score of ${occ.composite}/100 in Saudi Arabia according to SHIFT Observatory. This is classified as low risk — physical presence, emotional intelligence, and non-routine judgment create strong defenses against automation.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the salary for ${occ.name_en} in Saudi Arabia?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${occ.name_en} salaries in Saudi Arabia range from ${fmt(occ.salary_entry_sar)} SAR/month (entry level) to ${fmt(occ.salary_senior_sar)} SAR/month (senior level), with a median of ${fmt(occ.salary_median_sar)} SAR/month. All salaries in Saudi Arabia are tax-free. Typical expat packages also include housing allowance (25-35% of base), transportation, annual return flights, and medical insurance.`,
        },
      },
      {
        "@type": "Question",
        name: `Can expats work as ${occ.name_en} in Saudi Arabia?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            occ.nitaqat_status === "reserved_saudi_only"
              ? `No. ${occ.name_en} is one of 100 professions reserved exclusively for Saudi nationals under HRSD regulations. Expatriates cannot obtain work permits (iqama) for this profession. Related non-reserved occupations may be available.`
              : `Yes. ${occ.name_en} is open to expatriates under Nitaqat sector quotas. You need a job offer from a Saudi employer (sponsor), a work visa, and an iqama (residency permit). Your employer must be in Green or Platinum Nitaqat band. Typical timeline from offer to arrival is 2-8 weeks.`,
        },
      },
      {
        "@type": "Question",
        name: `Will AI replace ${occ.name_en} in Saudi Arabia?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            occ.composite >= 70
              ? `${occ.name_en} faces very high AI replacement risk (${occ.composite}/100). The WEF classifies this role as ${wefDesc} globally. The combination of routine digital tasks and structured decision-making makes this occupation highly susceptible to automation by large language models and RPA tools. Workers in this role should actively explore transition pathways to lower-risk occupations.`
              : occ.composite >= 45
                ? `${occ.name_en} faces moderate to high AI risk (${occ.composite}/100). While some tasks are automatable, elements requiring human judgment, creativity, or interpersonal skills provide partial protection. The WEF classifies this role as ${wefDesc}. Reskilling in AI-complementary skills is recommended.`
                : `${occ.name_en} has relatively low AI replacement risk (${occ.composite}/100). Physical presence requirements, emotional intelligence, and non-routine judgment create strong natural defenses against automation. The WEF classifies this role as ${wefDesc}.`,
        },
      },
      {
        "@type": "Question",
        name: `How many ${occ.name_en} work in Saudi Arabia?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `According to GOSI Q4-2024 data, approximately ${fmt(occ.employment_est)} ${occ.name_en} are employed in Saudi Arabia, with ${occ.employment_saudi_pct}% being Saudi nationals. This occupation is classified as '${occ.category}' by SHIFT Observatory, meaning AI is expected to ${occ.category === "substitution" ? "replace" : "augment"} workers in this role.`,
        },
      },
      (() => {
        const t = getScoreTrend(slug, occ.composite);
        const trendWord = t.direction === "up" ? "increased" : t.direction === "down" ? "decreased" : "remained stable";
        const trendReason = t.direction === "up"
          ? "This increase is driven by rapid advances in AI capabilities, particularly large language models and robotic process automation, which expand the range of automatable tasks in this role."
          : t.direction === "down"
          ? "This decrease reflects growing recognition that human judgment, creativity, and interpersonal skills in this role provide stronger-than-expected defenses against automation."
          : "This stability indicates that while AI capabilities continue to advance, the fundamental risk profile of this occupation has not significantly changed in the past quarter.";
        return {
          "@type": "Question" as const,
          name: `Is the AI risk for ${occ.name_en} in Saudi Arabia increasing or decreasing?`,
          acceptedAnswer: {
            "@type": "Answer" as const,
            text: `The AI automation risk score for ${occ.name_en} has ${trendWord} from ${t.previousScore}/100 to ${occ.composite}/100 between Q4-2025 and Q1-2026 (${t.delta > 0 ? "+" : ""}${t.delta} points). ${trendReason} SHIFT Observatory updates scores quarterly using the latest GOSI data, WEF projections, and academic research.`,
          },
        };
      })(),
    ],
  };

  if (lang === "fr") {
    const nameFr = occ.name_fr || occ.name_en;
    const tFr = getScoreTrend(slug, occ.composite);
    const trendWordFr = tFr.direction === "up" ? "augmenté" : tFr.direction === "down" ? "diminué" : "resté stable";
    faqSchema.mainEntity.push(
      {
        "@type": "Question" as const,
        name: `Quel est le risque d'automatisation IA pour ${nameFr} en Arabie Saoudite ?`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: `${nameFr} a un score de risque d'automatisation IA de ${occ.composite}/100 en Arabie Saoudite selon SHIFT Observatory. Ce score combine la probabilité d'automatisation (Frey & Osborne, Eloundou et al.), l'impact salarial, la pression réglementaire Nitaqat et les signaux de demande WEF.`,
        },
      },
      {
        "@type": "Question" as const,
        name: `Quel est le salaire d'un(e) ${nameFr} en Arabie Saoudite ?`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: `Les salaires de ${nameFr} en Arabie Saoudite varient de ${fmt(occ.salary_entry_sar)} SAR/mois (débutant) à ${fmt(occ.salary_senior_sar)} SAR/mois (senior), avec une médiane de ${fmt(occ.salary_median_sar)} SAR/mois. Tous les salaires en Arabie Saoudite sont exonérés d'impôts.`,
        },
      },
      {
        "@type": "Question" as const,
        name: `Le risque IA pour ${nameFr} en Arabie Saoudite augmente-t-il ou diminue-t-il ?`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: `Le score de risque d'automatisation IA de ${nameFr} a ${trendWordFr}, passant de ${tFr.previousScore}/100 à ${occ.composite}/100 entre le T4-2025 et le T1-2026 (${tFr.delta > 0 ? "+" : ""}${tFr.delta} points). SHIFT Observatory met à jour les scores trimestriellement en utilisant les dernières données GOSI, les projections du WEF et la recherche académique.`,
        },
      },
    );
  }

  if (lang === "ar") {
    const nameAr = occ.name_ar || occ.name_en;
    const tAr = getScoreTrend(slug, occ.composite);
    const trendWordAr =
      tAr.direction === "up"
        ? "ارتفع"
        : tAr.direction === "down"
          ? "انخفض"
          : "ظل مستقراً";
    faqSchema.mainEntity.push(
      {
        "@type": "Question" as const,
        name: `ما هي مخاطر أتمتة الذكاء الاصطناعي لـ ${nameAr} في المملكة العربية السعودية؟`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: `${nameAr} لديه درجة مخاطر أتمتة الذكاء الاصطناعي ${occ.composite}/100 في المملكة العربية السعودية وفقاً لمرصد شيفت. تجمع هذه الدرجة بين احتمالية الأتمتة (Frey & Osborne، Eloundou et al.)، الأثر على الراتب، الضغط التنظيمي لنطاقات، وإشارات الطلب من المنتدى الاقتصادي العالمي (WEF).`,
        },
      },
      {
        "@type": "Question" as const,
        name: `ما هو راتب ${nameAr} في المملكة العربية السعودية؟`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: `تتراوح رواتب ${nameAr} في المملكة العربية السعودية من ${fmt(occ.salary_entry_sar)} ريال/شهر (مستوى مبتدئ) إلى ${fmt(occ.salary_senior_sar)} ريال/شهر (مستوى أول)، بمتوسط ${fmt(occ.salary_median_sar)} ريال/شهر. جميع الرواتب في المملكة العربية السعودية معفاة من الضرائب.`,
        },
      },
      {
        "@type": "Question" as const,
        name: `هل يمكن للمغتربين العمل كـ ${nameAr} في المملكة العربية السعودية؟`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text:
            occ.nitaqat_status === "reserved_saudi_only"
              ? `لا. ${nameAr} هي إحدى 100 مهنة محجوزة حصرياً للمواطنين السعوديين بموجب لوائح وزارة الموارد البشرية والتنمية الاجتماعية. لا يمكن للمغتربين الحصول على تصاريح عمل (إقامة) لهذه المهنة. قد تتوفر مهن غير محجوزة ذات صلة.`
              : `نعم. ${nameAr} مفتوح للمغتربين بموجب حصص قطاع نطاقات. تحتاج إلى عرض عمل من صاحب عمل سعودي (راعٍ)، تأشيرة عمل، وإقامة. يجب أن يكون صاحب العمل في نطاق نطاقات الأخضر أو البلاتيني. الإطار الزمني المعتاد من العرض إلى الوصول هو 2-8 أسابيع.`,
        },
      },
      {
        "@type": "Question" as const,
        name: `هل سيستبدل الذكاء الاصطناعي ${nameAr} في المملكة العربية السعودية؟`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text:
            occ.composite >= 70
              ? `${nameAr} يواجه مخاطر استبدال عالية جداً بواسطة الذكاء الاصطناعي (${occ.composite}/100). الجمع بين المهام الرقمية الروتينية واتخاذ القرارات المهيكلة يجعل هذه المهنة قابلة للأتمتة بشدة بواسطة نماذج اللغة الكبيرة وأدوات RPA. يجب على العمال في هذا الدور استكشاف مسارات الانتقال إلى مهن ذات مخاطر أقل.`
              : occ.composite >= 45
                ? `${nameAr} يواجه مخاطر متوسطة إلى عالية بواسطة الذكاء الاصطناعي (${occ.composite}/100). بينما يمكن أتمتة بعض المهام، فإن العناصر التي تتطلب الحكم البشري والإبداع أو المهارات الشخصية توفر حماية جزئية. يُنصح بإعادة التأهيل في المهارات المكملة للذكاء الاصطناعي.`
                : `${nameAr} لديه مخاطر استبدال منخفضة نسبياً بواسطة الذكاء الاصطناعي (${occ.composite}/100). متطلبات الحضور المادي، الذكاء العاطفي، والحكم غير الروتيني تخلق دفاعات طبيعية قوية ضد الأتمتة.`,
        },
      },
      {
        "@type": "Question" as const,
        name: `كم عدد ${nameAr} العاملين في المملكة العربية السعودية؟`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: `وفقاً لبيانات الهيئة العامة للإحصاء (GOSI) للربع الرابع 2024، يعمل تقريباً ${fmt(occ.employment_est)} ${nameAr} في المملكة العربية السعودية، منهم ${occ.employment_saudi_pct}% مواطنون سعوديون. صنف مرصد شيفت هذه المهنة كـ '${occ.category}'، مما يعني أن الذكاء الاصطناعي متوقع أن ${occ.category === "substitution" ? "يستبدل" : "يعزز"} العمال في هذا الدور.`,
        },
      },
      {
        "@type": "Question" as const,
        name: `هل مخاطر الذكاء الاصطناعي لـ ${nameAr} في المملكة العربية السعودية ترتفع أم تنخفض؟`,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: `درجة مخاطر أتمتة الذكاء الاصطناعي لـ ${nameAr} قد ${trendWordAr} من ${tAr.previousScore}/100 إلى ${occ.composite}/100 بين الربع الرابع 2025 والربع الأول 2026 (${tAr.delta > 0 ? "+" : ""}${tAr.delta} نقطة). يحدّث مرصد شيفت الدرجات ربع سنوياً باستخدام أحدث بيانات GOSI، توقعات المنتدى الاقتصادي العالمي، والأبحاث الأكاديمية.`,
        },
      },
    );
  }

  const occupationSchema = {
    "@context": "https://schema.org",
    "@type": "Occupation",
    name: occ.name_en,
    alternateName: [occ.name_ar, occ.name_fr || occ.name_en],
    description: `${occ.name_en} in Saudi Arabia — AI automation risk score ${occ.composite}/100. ${occ.category === "substitution" ? "High automation exposure." : "AI augments rather than replaces."} Salary range: ${fmt(occ.salary_entry_sar)}-${fmt(occ.salary_senior_sar)} SAR/month.`,
    occupationLocation: {
      "@type": "Country",
      name: "Saudi Arabia",
    },
    estimatedSalary: {
      "@type": "MonetaryAmountDistribution",
      name: "Monthly salary",
      currency: "SAR",
      median: occ.salary_median_sar,
      percentile10: occ.salary_entry_sar,
      percentile90: occ.salary_senior_sar,
      duration: "P1M",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SHIFT Observatory", item: `${SITE_URL}/${lang}` },
      { "@type": "ListItem", position: 2, name: "Occupations", item: `${SITE_URL}/${lang}/career` },
      { "@type": "ListItem", position: 3, name: occ.name_en, item: `${SITE_URL}/${lang}/job/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(occupationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <JobPageClient
        occupation={occ}
        related={related}
        sector={sector}
        tawteen={tawteen}
        reserved={reserved}
      />
    </>
  );
}
