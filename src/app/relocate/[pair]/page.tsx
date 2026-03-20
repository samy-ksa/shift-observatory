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

  // Detect francophone origins from URL params (no cookies — keeps SSG)
  const isFrancophoneOrigin = ["paris", "casablanca", "tunis", "beirut"].includes(origin.id);

  // Pre-compute a quick stat for the OG title
  const medianSalary = 5000; // representative mid-level salary in local currency
  const taxSavingsLocal = Math.round(medianSalary * (origin.taxRate / 100));
  const taxSavingsSar = Math.round(taxSavingsLocal * origin.rateToSar);

  const title = isFrancophoneOrigin
    ? `Coût de la vie : ${origin.name_fr} vs ${saudi.name_fr} — Comparaison salaire et dépenses | SHIFT Observatory`
    : `Cost of Living: ${origin.name_en} vs ${saudi.name_en} — Salary & Expenses Comparison | SHIFT Observatory`;

  const description = isFrancophoneOrigin
    ? `Comparez le coût de la vie entre ${origin.name_fr} et ${saudi.name_fr}, Arabie Saoudite. ${origin.taxRate}% d'impôts en ${origin.country_fr} → 0% en Arabie Saoudite. Logement, courses, scolarité, transport — 65+ postes comparés.`
    : `Compare cost of living between ${origin.name_en} and ${saudi.name_en}, Saudi Arabia. ${origin.taxRate}% tax in ${origin.country_en} → 0% in KSA. Housing, groceries, schooling, transport — 65+ items compared. Free relocation calculator.`;

  const ogTitle = isFrancophoneOrigin
    ? origin.taxRate > 0
      ? `${origin.name_fr} → ${saudi.name_fr} : Économisez ${origin.currencySymbol}${taxSavingsLocal}/mois (${taxSavingsSar} SAR) en impôts`
      : `${origin.name_fr} → ${saudi.name_fr} : Comparaison complète`
    : origin.taxRate > 0
      ? `${origin.name_en} → ${saudi.name_en}: Save ${origin.currencySymbol}${taxSavingsLocal}/month (${taxSavingsSar} SAR) in tax alone`
      : `${origin.name_en} → ${saudi.name_en}: Full cost comparison`;

  const ogDesc = isFrancophoneOrigin
    ? `${saudi.name_fr} classement Mercer #${saudi.mercerRank} vs ${origin.name_fr} #${origin.mercerRank}. 0% d'impôt sur le revenu. Comparez 65+ postes.`
    : `${saudi.name_en} Mercer rank #${saudi.mercerRank} vs ${origin.name_en} #${origin.mercerRank}. 0% income tax. Compare 65+ items.`;

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
      // French keywords for francophone origins
      ...(isFrancophoneOrigin
        ? [
            `coût de la vie ${origin.name_fr} vs ${saudi.name_fr}`,
            `s'expatrier de ${origin.name_fr} à ${saudi.name_fr}`,
            `salaire expatrié ${saudi.name_fr}`,
            `déménager de ${origin.name_fr} en Arabie Saoudite`,
          ]
        : []),
    ].join(", "),
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      images: [
        `${SITE}/api/og?title=${encodeURIComponent(
          isFrancophoneOrigin
            ? `${origin.name_fr} → ${saudi.name_fr}`
            : `${origin.name_en} → ${saudi.name_en}`
        )}`,
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

  const isFrancophone = ["paris", "casablanca", "tunis", "beirut"].includes(origin.id);

  const faqSchemaFr = isFrancophone ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Est-ce que ${saudi.name_fr} est moins cher que ${origin.name_fr} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `D'après le classement Mercer, ${saudi.name_fr} est classée #${saudi.mercerRank} tandis que ${origin.name_fr} est #${origin.mercerRank} (plus bas = plus cher). ${saudi.name_fr} est généralement ${mercerComparison === "cheaper" ? "moins chère" : "plus chère"} que ${origin.name_fr}. Cependant, le logement en compound (${rentCompound.toLocaleString()} SAR/mois) et la scolarité internationale (${schoolAnnual.toLocaleString()} SAR/an) peuvent augmenter significativement les coûts pour les familles. L'impôt sur le revenu à 0% en Arabie Saoudite compense partiellement ou totalement ces coûts supplémentaires.`,
        },
      },
      {
        "@type": "Question",
        name: `Quel salaire faut-il à ${saudi.name_fr} pour vivre comme à ${origin.name_fr} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Pour maintenir un niveau de vie équivalent pour une famille de 3 (2 adultes + 1 enfant) à ${saudi.name_fr}, il faut environ ${result.saudi_total_sar.toLocaleString()} SAR/mois. Avec 0% d'impôt sur le revenu en Arabie Saoudite (vs ${origin.taxRate}% en ${origin.country_fr}), vos économies d'impôts seules valent ${result.tax_savings_sar.toLocaleString()} SAR/mois. Nous recommandons de négocier un package d'au moins ${Math.round(result.saudi_total_sar * 1.2).toLocaleString()} SAR/mois pour inclure une marge d'épargne.`,
        },
      },
      {
        "@type": "Question",
        name: `Combien coûte le loyer à ${saudi.name_fr} par rapport à ${origin.name_fr} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Un appartement 1 chambre au centre de ${saudi.name_fr} coûte environ ${saudi.rent_apt_1br.toLocaleString()} SAR/mois. Les villas en compound pour expatriés varient de ${saudi.rent_compound_2br.toLocaleString()} à ${saudi.rent_compound_3br.toLocaleString()} SAR/mois. À ${origin.name_fr}, un 1 chambre comparable coûte ${origin.currencySymbol}${origin.rent_1br.toLocaleString()}/mois. Le loyer est ${result.rent_diff_pct > 0 ? `${result.rent_diff_pct}% plus cher` : `${Math.abs(result.rent_diff_pct)}% moins cher`} à ${saudi.name_fr} pour un logement en compound.`,
        },
      },
      {
        "@type": "Question",
        name: `Combien coûtent les écoles internationales à ${saudi.name_fr} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Les frais de scolarité internationale à ${saudi.name_fr} varient de 20 000 SAR/an (curriculum indien/pakistanais économique) à 105 000+ SAR/an (programmes américains/britanniques/IB premium). Les écoles mid-tier de curriculum américain/britannique coûtent en moyenne ${schoolAnnual.toLocaleString()} SAR/an. ${origin.schoolFree ? `L'école publique est gratuite en ${origin.country_fr}, ce qui fait de l'allocation scolaire un point de négociation essentiel pour les expatriés.` : `Comparez avec les coûts scolaires à ${origin.name_fr} pour avoir le tableau complet.`} La plupart des employeurs offrent des allocations scolaires dans les packages expatriés.`,
        },
      },
      {
        "@type": "Question",
        name: `Est-ce que ça vaut le coup de déménager de ${origin.name_fr} à ${saudi.name_fr} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Déménager de ${origin.name_fr} à ${saudi.name_fr} peut être financièrement avantageux. Avantages clés : 0% d'impôt sur le revenu (économie de ${result.tax_savings_sar.toLocaleString()} SAR/mois), indemnité de fin de service EOSB (~${result.eosb_5yr_sar.toLocaleString()} SAR après 5 ans, non imposable). Coûts clés : logement en compound (${rentCompound.toLocaleString()} SAR/mois), scolarité internationale. Votre position nette dépend de votre package négocié. Utilisez notre calculateur ci-dessus pour modéliser votre situation avec votre salaire et taille de famille réels.`,
        },
      },
    ],
  } : null;

  /* ---- Breadcrumb structured data ---- */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SHIFT Observatory", item: SITE },
      { "@type": "ListItem", position: 2, name: "Relocation Calculator", item: `${SITE}/relocate` },
      { "@type": "ListItem", position: 3, name: `${origin.name_en} to ${saudi.name_en}`, item: `${SITE}/relocate/${pair}` },
    ],
  };

  return (
    <>
      {/* JSON-LD FAQPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {isFrancophone && faqSchemaFr && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaFr) }}
        />
      )}

      {/* JSON-LD BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
