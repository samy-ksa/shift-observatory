import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RelocateClient from "../client";
import {
  ORIGIN_CITIES,
  SAUDI_CITIES,
  SCHOOL_TIERS,
  calculateRelocation,
} from "@/data/relocation-data";

const SITE = "https://www.ksashiftobservatory.online";

/* ------------------------------------------------------------------ */
/* Generate all 60 city-pair pages at build time                        */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  const pairs: { pair: string }[] = [];
  for (const o of ORIGIN_CITIES) {
    for (const s of SAUDI_CITIES) {
      pairs.push({ pair: `${o.id}-to-${s.id}` });
    }
  }
  return pairs;
}

/* ------------------------------------------------------------------ */
/* Parse the slug                                                       */
/* ------------------------------------------------------------------ */

function parsePair(pair: string) {
  const m = pair.match(/^(.+)-to-(.+)$/);
  if (!m) return null;
  const origin = ORIGIN_CITIES.find((c) => c.id === m[1]);
  const saudi = SAUDI_CITIES.find((c) => c.id === m[2]);
  if (!origin || !saudi) return null;
  return { origin, saudi };
}

/* ------------------------------------------------------------------ */
/* Metadata                                                             */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const { origin, saudi } = parsed;

  // Pre-compute a quick stat for the OG title
  const medianSalary = 5000; // representative mid-level salary in local currency
  const taxSavingsLocal = Math.round(medianSalary * (origin.taxRate / 100));
  const taxSavingsSar = Math.round(taxSavingsLocal * origin.rateToSar);

  const title = `Cost of Living: ${origin.name_en} vs ${saudi.name_en} — Salary & Expenses Comparison | SHIFT Observatory`;
  const description = `Compare cost of living between ${origin.name_en} and ${saudi.name_en}, Saudi Arabia. ${origin.taxRate}% tax in ${origin.country_en} → 0% in KSA. Housing, groceries, schooling, transport — 65+ items compared. Free relocation calculator.`;

  const ogTitle =
    origin.taxRate > 0
      ? `${origin.name_en} → ${saudi.name_en}: Save ${origin.currencySymbol}${taxSavingsLocal}/month (${taxSavingsSar} SAR) in tax alone`
      : `${origin.name_en} → ${saudi.name_en}: Full cost comparison`;
  const ogDesc = `${saudi.name_en} Mercer rank #${saudi.mercerRank} vs ${origin.name_en} #${origin.mercerRank}. 0% income tax. Compare 65+ items.`;

  return {
    title,
    description,
    keywords: [
      `cost of living ${origin.name_en} vs ${saudi.name_en}`,
      `relocate from ${origin.name_en} to ${saudi.name_en}`,
      `expat salary ${saudi.name_en}`,
      `${origin.name_en} to Saudi Arabia`,
      `move from ${origin.name_en} to Saudi Arabia`,
      `${saudi.name_en} cost of living`,
      `${origin.name_en} vs ${saudi.name_en} salary`,
      `expat package ${saudi.name_en}`,
      `tax savings Saudi Arabia ${origin.country_en}`,
      `international school fees ${saudi.name_en}`,
    ].join(", "),
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      images: [
        `${SITE}/api/og?title=${encodeURIComponent(`${origin.name_en} → ${saudi.name_en}`)}`,
      ],
    },
    alternates: {
      canonical: `${SITE}/relocate/${pair}`,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Page Component                                                       */
/* ------------------------------------------------------------------ */

export default async function CityPairPage({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const { origin, saudi } = parsed;

  // Pre-compute a quick comparison for the server-rendered summary
  const midtier = SCHOOL_TIERS.find((s) => s.id === "midtier")!;
  const result = calculateRelocation({
    origin,
    saudi,
    salaryLocal: Math.round(5000 * (origin.currency === "USD" ? 1 : origin.currency === "EUR" ? 1.1 : 1)),
    adults: 2,
    children: 1,
    housing: "compound",
    schoolTier: midtier,
  });

  const mercerComparison =
    saudi.mercerRank > origin.mercerRank ? "cheaper" : "more expensive";
  const taxSavingsPct = origin.taxRate;

  // Other city pairs for internal linking
  const otherSaudiCities = SAUDI_CITIES.filter(
    (c) => c.id !== saudi.id
  ).slice(0, 3);
  const otherOriginCities = ORIGIN_CITIES.filter(
    (c) => c.id !== origin.id
  ).slice(0, 4);

  // FAQ schema
  const rentCompound = saudi.rent_compound_3br;
  const schoolAnnual = midtier.monthly_sar * 12;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${saudi.name_en} cheaper than ${origin.name_en}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Based on Mercer Cost of Living data, ${saudi.name_en} is ranked #${saudi.mercerRank} while ${origin.name_en} is #${origin.mercerRank} (lower = more expensive). ${saudi.name_en} is generally ${mercerComparison} than ${origin.name_en}. However, expat compound housing (${rentCompound.toLocaleString()} SAR/month) and international schooling (${schoolAnnual.toLocaleString()} SAR/year) can significantly increase costs for families. The 0% income tax in Saudi Arabia partially or fully offsets these additional costs.`,
        },
      },
      {
        "@type": "Question",
        name: `What salary do I need in ${saudi.name_en} to match my ${origin.name_en} lifestyle?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `To maintain an equivalent lifestyle for a family of 3 (2 adults + 1 child) in ${saudi.name_en}, you need approximately ${result.saudi_total_sar.toLocaleString()} SAR/month. With 0% income tax in Saudi Arabia (vs ${origin.taxRate}% in ${origin.country_en}), your tax savings alone are worth ${result.tax_savings_sar.toLocaleString()} SAR/month. We recommend negotiating a package of at least ${Math.round(result.saudi_total_sar * 1.2).toLocaleString()} SAR/month to include savings buffer.`,
        },
      },
      {
        "@type": "Question",
        name: `How much is rent in ${saudi.name_en} compared to ${origin.name_en}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `A 1-bedroom apartment in ${saudi.name_en} city center costs approximately ${saudi.rent_apt_1br.toLocaleString()} SAR/month. Expat compound villas range from ${saudi.rent_compound_2br.toLocaleString()}-${saudi.rent_compound_3br.toLocaleString()} SAR/month. In ${origin.name_en}, a comparable 1-bedroom is ${origin.currencySymbol}${origin.rent_1br.toLocaleString()}/month. Rent is ${result.rent_diff_pct > 0 ? `${result.rent_diff_pct}% more expensive` : `${Math.abs(result.rent_diff_pct)}% cheaper`} in ${saudi.name_en} for compound housing.`,
        },
      },
      {
        "@type": "Question",
        name: `How much do international schools cost in ${saudi.name_en}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `International school fees in ${saudi.name_en} range from 20,000 SAR/year (budget Indian/Pakistani curriculum) to 105,000+ SAR/year (premium American/British/IB programs). Mid-tier American/British curriculum schools average ${schoolAnnual.toLocaleString()} SAR/year. ${origin.schoolFree ? `Public schooling is free in ${origin.country_en}, making education allowance a critical negotiation point for expats.` : `Compare this with school costs in ${origin.name_en} to understand the full picture.`} Most employers offer education allowances as part of expat packages.`,
        },
      },
      {
        "@type": "Question",
        name: `Is it worth moving from ${origin.name_en} to ${saudi.name_en} financially?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Moving from ${origin.name_en} to ${saudi.name_en} can be financially advantageous. Key benefits: 0% income tax (saving ${result.tax_savings_sar.toLocaleString()} SAR/month), End of Service Benefit (tax-free severance of ~${result.eosb_5yr_sar.toLocaleString()} SAR after 5 years). Key costs: compound housing (${rentCompound.toLocaleString()} SAR/month), international schooling. Your net position depends on your negotiated package. Use our calculator above to model your specific situation with your actual salary and family size.`,
        },
      },
    ],
  };

  return (
    <>
      {/* JSON-LD FAQPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Server-rendered SEO summary */}
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <nav className="text-xs text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-300">
            SHIFT Observatory
          </a>
          {" › "}
          <a href="/relocate" className="hover:text-gray-300">
            Relocation Calculator
          </a>
          {" › "}
          <span className="text-gray-400">
            {origin.name_en} to {saudi.name_en}
          </span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide mb-3">
          Moving from {origin.name_en} to {saudi.name_en}?{" "}
          <span className="text-cyan-400">Here&apos;s what it really costs.</span>
        </h1>

        {/* Pre-computed summary for SEO crawlers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Mercer Ranking
            </p>
            <p className="text-sm text-white">
              {saudi.name_en} <span className="font-mono text-cyan-400">#{saudi.mercerRank}</span>
              {" vs "}
              {origin.name_en} <span className="font-mono text-amber-400">#{origin.mercerRank}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {saudi.name_en} is {mercerComparison}
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Tax Savings
            </p>
            <p className="text-sm text-white">
              {origin.country_en}:{" "}
              <span className="font-mono text-red-400">{taxSavingsPct}%</span>
              {" → KSA: "}
              <span className="font-mono text-emerald-400">0%</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Save {result.tax_savings_sar.toLocaleString()} SAR/month
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Minimum Package
            </p>
            <p className="text-sm text-white font-mono">
              <span className="text-cyan-400">
                {result.saudi_total_sar.toLocaleString()} SAR
              </span>
              /mo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              For family of 3, compound housing
            </p>
          </div>
        </div>

        {/* Internal links — other city pairs */}
        <div className="mb-6 text-xs text-gray-500">
          <span className="text-gray-400 font-medium">Also compare: </span>
          {otherSaudiCities.map((sc, i) => (
            <span key={sc.id}>
              {i > 0 && " | "}
              <Link
                href={`/relocate/${origin.id}-to-${sc.id}`}
                className="text-cyan-400/70 hover:text-cyan-400 hover:underline"
              >
                {origin.name_en} → {sc.name_en}
              </Link>
            </span>
          ))}
          {" | "}
          {otherOriginCities.map((oc, i) => (
            <span key={oc.id}>
              {i > 0 && " | "}
              <Link
                href={`/relocate/${oc.id}-to-${saudi.id}`}
                className="text-cyan-400/70 hover:text-cyan-400 hover:underline"
              >
                {oc.name_en} → {saudi.name_en}
              </Link>
            </span>
          ))}
        </div>
      </div>

      {/* Interactive calculator pre-filled with this city pair */}
      <RelocateClient
        defaultOriginId={origin.id}
        defaultSaudiId={saudi.id}
      />
    </>
  );
}
