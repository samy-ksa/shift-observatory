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
  wefTrendLabel,
  fmt,
} from "@/lib/occupations";
import JobPageClient from "./client";

/* ------------------------------------------------------------------ */
/* SSG: generate all 146 pages at build time                           */
/* ------------------------------------------------------------------ */
export async function generateStaticParams() {
  return getAllOccupations().map((o) => ({ slug: toSlug(o.name_en) }));
}

/* ------------------------------------------------------------------ */
/* Dynamic SEO metadata per page                                       */
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
  const nitaqatDesc =
    occ.nitaqat_status === "reserved_saudi_only"
      ? "Reserved for Saudi nationals."
      : "Open to expats (sector quota).";

  return {
    title: `${occ.name_en} in Saudi Arabia — AI Risk Score ${occ.composite}/100 | SHIFT Observatory`,
    description: `${occ.name_en} has an AI automation risk score of ${occ.composite}/100 in Saudi Arabia. Salary: ${fmt(occ.salary_entry_sar)}-${fmt(occ.salary_senior_sar)} SAR/month. ${nitaqatDesc} WEF trend: ${wefTrendLabel(occ.wef_trend)}. See full analysis, career transitions, and reskilling options.`,
    keywords: [
      occ.name_en,
      occ.name_ar,
      "AI risk Saudi Arabia",
      `${occ.name_en} salary KSA`,
      `${occ.name_en} Saudization`,
      `${occ.name_en} automation risk`,
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
/* Server component: fetch data and pass to client                     */
/* ------------------------------------------------------------------ */
export default function JobPage({ params }: { params: { slug: string } }) {
  const occ = findBySlug(params.slug);

  if (!occ) {
    return <JobPageClient occupation={null} related={[]} sector={null} tawteen={[]} reserved={false} />;
  }

  const sector = getSector(occ.sector_id) ?? null;
  const related = getRelatedOccupations(occ, 5);
  const tawteen = getRelevantTawteen(occ);
  const reserved = isReservedProfession(occ);

  return (
    <JobPageClient
      occupation={occ}
      related={related}
      sector={sector}
      tawteen={tawteen}
      reserved={reserved}
    />
  );
}
