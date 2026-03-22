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
import JobPageClient from "./client";
import { getScoreTrend } from "@/data/score-history";

/* ------------------------------------------------------------------ */
/* SSG: generate all 146 pages at build time                           */
/* ------------------------------------------------------------------ */
export async function generateStaticParams() {
  return getAllOccupations().map((o) => ({ slug: toSlug(o.name_en) }));
}

/* ------------------------------------------------------------------ */
/* Dynamic SEO metadata per page                                       */
/* NOTE: No cookies() call — keeps pages statically generated          */
/* ------------------------------------------------------------------ */
const SITE = "https://www.ksashiftobservatory.online";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const occ = findBySlug(params.slug);
  if (!occ) {
    return { title: "Occupation Not Found | SHIFT Observatory" };
  }

  const rl = riskLabel(occ.composite);

  return {
    title: `${occ.name_en}: ${occ.composite}% AI Risk in Saudi Arabia (2026 Data) | SHIFT`,
    description: `Is your job safe? ${occ.name_en} face ${occ.composite}% AI automation risk in Saudi Arabia. Check salary (${occ.salary_entry_sar.toLocaleString()}-${occ.salary_senior_sar.toLocaleString()} SAR), Nitaqat status, career transitions. Free analysis.`,
    keywords: [
      occ.name_en,
      occ.name_ar,
      occ.name_fr || occ.name_en,
      "AI risk Saudi Arabia",
      `${occ.name_en} salary KSA`,
      `${occ.name_en} Saudization`,
      `${occ.name_en} automation risk`,
      // French keywords for discoverability
      `${occ.name_fr || occ.name_en} Arabie Saoudite`,
      `risque IA ${occ.name_fr || occ.name_en}`,
    ].join(", "),
    openGraph: {
      title: `${occ.name_en} — ${rl} (${occ.composite}/100)`,
      description: `AI automation risk analysis for ${occ.name_en} in Saudi Arabia`,
      images: [
        `${SITE}/api/og?occupation=${encodeURIComponent(occ.name_en)}&score=${occ.composite}`,
      ],
    },
    alternates: {
      canonical: `${SITE}/job/${params.slug}`,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Server component: fetch data, render JSON-LD, pass to client        */
/* ------------------------------------------------------------------ */
export default function JobPage({ params }: { params: { slug: string } }) {
  const occ = findBySlug(params.slug);

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

  /* ---- Build WEF trend description ---- */
  const wefDesc = (occ.wef_trend || "").includes("decline")
    ? "declining"
    : (occ.wef_trend || "").includes("growth")
      ? "growing"
      : "stable";

  /* ---- FAQ structured data (English) ---- */
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
        const t = getScoreTrend(params.slug, occ.composite);
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

  /* ---- French FAQ questions (merged into single FAQPage to avoid Google duplicate error) ---- */
  const nameFr = occ.name_fr || occ.name_en;
  const tFr = getScoreTrend(params.slug, occ.composite);
  const trendWordFr = tFr.direction === "up" ? "augmenté" : tFr.direction === "down" ? "diminué" : "resté stable";
  const frenchQuestions = [
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
  ];

  // Merge EN + FR questions into a single FAQPage (Google rejects duplicate FAQPage types)
  faqSchema.mainEntity = [...faqSchema.mainEntity, ...frenchQuestions];

  /* ---- Occupation structured data ---- */
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

  /* ---- Breadcrumb structured data ---- */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SHIFT Observatory", item: SITE },
      { "@type": "ListItem", position: 2, name: "Occupations", item: `${SITE}/career` },
      { "@type": "ListItem", position: 3, name: occ.name_en, item: `${SITE}/job/${params.slug}` },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(occupationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
