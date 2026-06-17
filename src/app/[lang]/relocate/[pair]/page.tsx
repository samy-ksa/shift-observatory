import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RelocateClient from "@/app/relocate/client";
import {
  ORIGIN_CITIES,
  SAUDI_CITIES,
  SCHOOL_TIERS,
  calculateRelocation,
} from "@/data/relocation-data";
import type { Lang } from "@/lib/i18n/context";
import { buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";
import { localizedHref } from "@/lib/i18n/links";

const LANGS: Lang[] = ["en", "fr", "ar"];

export function generateStaticParams() {
  const pairs: { lang: Lang; pair: string }[] = [];
  for (const lang of LANGS) {
    for (const o of ORIGIN_CITIES) {
      for (const s of SAUDI_CITIES) {
        pairs.push({ lang, pair: `${o.id}-to-${s.id}` });
      }
    }
  }
  return pairs;
}

export const dynamicParams = false;

function parsePair(pair: string) {
  const m = pair.match(/^(.+)-to-(.+)$/);
  if (!m) return null;
  const origin = ORIGIN_CITIES.find((c) => c.id === m[1]);
  const saudi = SAUDI_CITIES.find((c) => c.id === m[2]);
  if (!origin || !saudi) return null;
  return { origin, saudi };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang; pair: string }>;
}): Promise<Metadata> {
  const { lang, pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const { origin, saudi } = parsed;

  // Lang-driven content (no more francophone-origin heuristic — URL is source of truth)
  const isFr = lang === "fr";
  // AR falls back to EN until /data/relocation-data.ts ships AR names — Phase 3c

  const medianSalary = 5000;
  const taxSavingsLocal = Math.round(medianSalary * (origin.taxRate / 100));
  const taxSavingsSar = Math.round(taxSavingsLocal * origin.rateToSar);

  const title = isFr
    ? `Coût de la vie : ${origin.name_fr} vs ${saudi.name_fr} — Comparaison salaire et dépenses | SHIFT Observatory`
    : `Cost of Living: ${origin.name_en} vs ${saudi.name_en} — Salary & Expenses Comparison | SHIFT Observatory`;

  const description = isFr
    ? `Comparez le coût de la vie entre ${origin.name_fr} et ${saudi.name_fr}, Arabie Saoudite. ${origin.taxRate}% d'impôts en ${origin.country_fr} → 0% en Arabie Saoudite. Logement, courses, scolarité, transport — 65+ postes comparés.`
    : `Compare cost of living between ${origin.name_en} and ${saudi.name_en}, Saudi Arabia. ${origin.taxRate}% tax in ${origin.country_en} → 0% in KSA. Housing, groceries, schooling, transport — 65+ items compared. Free relocation calculator.`;

  const ogTitle = isFr
    ? origin.taxRate > 0
      ? `${origin.name_fr} → ${saudi.name_fr} : Économisez ${origin.currencySymbol}${taxSavingsLocal}/mois (${taxSavingsSar} SAR) en impôts`
      : `${origin.name_fr} → ${saudi.name_fr} : Comparaison complète`
    : origin.taxRate > 0
      ? `${origin.name_en} → ${saudi.name_en}: Save ${origin.currencySymbol}${taxSavingsLocal}/month (${taxSavingsSar} SAR) in tax alone`
      : `${origin.name_en} → ${saudi.name_en}: Full cost comparison`;

  const ogDesc = isFr
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
      ...(isFr
        ? [
            `coût de la vie ${origin.name_fr} vs ${saudi.name_fr}`,
            `s'expatrier de ${origin.name_fr} à ${saudi.name_fr}`,
            `salaire expatrié ${saudi.name_fr}`,
          ]
        : []),
    ].join(", "),
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      images: [
        `${SITE_URL}/api/og?lang=${lang}&title=${encodeURIComponent(
          lang === "fr"
            ? `${origin.name_fr} → ${saudi.name_fr}`
            : lang === "ar"
              ? `${origin.name_ar || origin.name_en} → ${saudi.name_ar || saudi.name_en}`
              : `${origin.name_en} → ${saudi.name_en}`,
        )}&subtitle=${encodeURIComponent(
          lang === "fr"
            ? "Calculateur coût de la vie"
            : lang === "ar"
              ? "حاسبة تكلفة المعيشة"
              : "Cost of Living Calculator",
        )}`,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      images: [
        `${SITE_URL}/api/og?lang=${lang}&title=${encodeURIComponent(
          lang === "fr"
            ? `${origin.name_fr} → ${saudi.name_fr}`
            : lang === "ar"
              ? `${origin.name_ar || origin.name_en} → ${saudi.name_ar || saudi.name_en}`
              : `${origin.name_en} → ${saudi.name_en}`,
        )}&subtitle=${encodeURIComponent(
          lang === "fr"
            ? "Calculateur coût de la vie"
            : lang === "ar"
              ? "حاسبة تكلفة المعيشة"
              : "Cost of Living Calculator",
        )}`,
      ],
    },
    alternates: buildLanguageAlternates(lang, `/relocate/${pair}`),
  };
}

export default async function LangCityPairPage({
  params,
}: {
  params: Promise<{ lang: Lang; pair: string }>;
}) {
  const { lang, pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const { origin, saudi } = parsed;
  const isFr = lang === "fr";

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

  const mercerComparison = saudi.mercerRank > origin.mercerRank ? "cheaper" : "more expensive";
  const taxSavingsPct = origin.taxRate;

  const otherSaudiCities = SAUDI_CITIES.filter((c) => c.id !== saudi.id).slice(0, 3);
  const otherOriginCities = ORIGIN_CITIES.filter((c) => c.id !== origin.id).slice(0, 4);

  // FAQ schema — EN base + FR additions for fr lang. AR localization deferred to 3c.
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

  if (isFr) {
    faqSchema.mainEntity.push(
      {
        "@type": "Question",
        name: `Est-ce que ${saudi.name_fr} est moins cher que ${origin.name_fr} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `D'après le classement Mercer, ${saudi.name_fr} est classée #${saudi.mercerRank} tandis que ${origin.name_fr} est #${origin.mercerRank}. ${saudi.name_fr} est généralement ${mercerComparison === "cheaper" ? "moins chère" : "plus chère"} que ${origin.name_fr}. L'impôt sur le revenu à 0% en Arabie Saoudite compense partiellement ou totalement les surcoûts.`,
        },
      },
      {
        "@type": "Question",
        name: `Quel salaire faut-il à ${saudi.name_fr} pour vivre comme à ${origin.name_fr} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Pour une famille de 3 à ${saudi.name_fr}, il faut environ ${result.saudi_total_sar.toLocaleString()} SAR/mois. Avec 0% d'impôt (vs ${origin.taxRate}% en ${origin.country_fr}), vos économies d'impôts valent ${result.tax_savings_sar.toLocaleString()} SAR/mois.`,
        },
      },
      {
        "@type": "Question",
        name: `Est-ce que ça vaut le coup de déménager de ${origin.name_fr} à ${saudi.name_fr} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Déménager de ${origin.name_fr} à ${saudi.name_fr} peut être financièrement avantageux. 0% d'impôt (économie de ${result.tax_savings_sar.toLocaleString()} SAR/mois), EOSB (~${result.eosb_5yr_sar.toLocaleString()} SAR après 5 ans).`,
        },
      },
    );
  }

  if (lang === "ar") {
    faqSchema.mainEntity.push(
      {
        "@type": "Question",
        name: `هل ${saudi.name_ar} أرخص من ${origin.name_ar}؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `وفقاً لتصنيف Mercer لتكلفة المعيشة، ${saudi.name_ar} مصنفة رقم ${saudi.mercerRank} بينما ${origin.name_ar} رقم ${origin.mercerRank} (الأقل = أغلى). ${saudi.name_ar} ${mercerComparison === "cheaper" ? "أرخص" : "أغلى"} عموماً من ${origin.name_ar}. ضريبة الدخل 0% في المملكة العربية السعودية تعوض جزئياً أو كلياً التكاليف الإضافية للمساكن والمدارس الدولية.`,
        },
      },
      {
        "@type": "Question",
        name: `ما الراتب الذي أحتاجه في ${saudi.name_ar} لمطابقة نمط حياتي في ${origin.name_ar}؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `للحفاظ على نمط حياة معادل لأسرة مكونة من 3 أفراد (بالغان + طفل واحد) في ${saudi.name_ar}، تحتاج إلى حوالي ${result.saudi_total_sar.toLocaleString()} ريال/شهر. مع 0% ضريبة دخل في المملكة العربية السعودية (مقابل ${origin.taxRate}% في ${origin.country_ar})، توفر ضرائبك وحدها تساوي ${result.tax_savings_sar.toLocaleString()} ريال/شهر. نوصي بالتفاوض على حزمة بحد أدنى ${Math.round(result.saudi_total_sar * 1.2).toLocaleString()} ريال/شهر لتشمل احتياطي ادخار.`,
        },
      },
      {
        "@type": "Question",
        name: `كم تبلغ تكلفة الإيجار في ${saudi.name_ar} مقارنة بـ ${origin.name_ar}؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `تكلف شقة بغرفة نوم واحدة في وسط ${saudi.name_ar} حوالي ${saudi.rent_apt_1br.toLocaleString()} ريال/شهر. فيلات الكمباوند للمغتربين تتراوح من ${saudi.rent_compound_2br.toLocaleString()} إلى ${saudi.rent_compound_3br.toLocaleString()} ريال/شهر. الإيجار ${result.rent_diff_pct > 0 ? `أغلى بنسبة ${result.rent_diff_pct}%` : `أرخص بنسبة ${Math.abs(result.rent_diff_pct)}%`} في ${saudi.name_ar} لمساكن الكمباوند.`,
        },
      },
      {
        "@type": "Question",
        name: `كم تكلف المدارس الدولية في ${saudi.name_ar}؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `تتراوح رسوم المدارس الدولية في ${saudi.name_ar} من 20,000 ريال/سنة (مناهج هندية/باكستانية اقتصادية) إلى 105,000+ ريال/سنة (برامج أمريكية/بريطانية/IB متميزة). المدارس متوسطة المستوى ذات المناهج الأمريكية/البريطانية تبلغ في المتوسط ${schoolAnnual.toLocaleString()} ريال/سنة. يقدم معظم أصحاب العمل بدلات تعليمية كجزء من حزم المغتربين.`,
        },
      },
      {
        "@type": "Question",
        name: `هل يستحق الانتقال من ${origin.name_ar} إلى ${saudi.name_ar} مالياً؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `الانتقال من ${origin.name_ar} إلى ${saudi.name_ar} يمكن أن يكون مفيداً مالياً. الفوائد الرئيسية: 0% ضريبة دخل (توفير ${result.tax_savings_sar.toLocaleString()} ريال/شهر)، مكافأة نهاية الخدمة (مكافأة معفاة من الضرائب بحوالي ${result.eosb_5yr_sar.toLocaleString()} ريال بعد 5 سنوات). التكاليف الرئيسية: مساكن الكمباوند (${rentCompound.toLocaleString()} ريال/شهر)، المدارس الدولية. يعتمد وضعك الصافي على حزمتك التفاوضية.`,
        },
      },
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SHIFT Observatory", item: `${SITE_URL}/${lang}` },
      { "@type": "ListItem", position: 2, name: "Relocation Calculator", item: `${SITE_URL}/${lang}/relocate` },
      { "@type": "ListItem", position: 3, name: `${origin.name_en} to ${saudi.name_en}`, item: `${SITE_URL}/${lang}/relocate/${pair}` },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-5xl mx-auto px-4 pt-8">
        <nav className="text-xs text-gray-500 mb-4">
          <a href={localizedHref(lang, "/")} className="hover:text-gray-300">SHIFT Observatory</a>
          {" › "}
          <a href={localizedHref(lang, "/relocate")} className="hover:text-gray-300">Relocation Calculator</a>
          {" › "}
          <span className="text-gray-400">{origin.name_en} to {saudi.name_en}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide mb-3">
          Moving from {origin.name_en} to {saudi.name_en}?{" "}
          <span className="text-cyan-400">Here&apos;s what it really costs.</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mercer Ranking</p>
            <p className="text-sm text-white">
              {saudi.name_en} <span className="font-mono text-cyan-400">#{saudi.mercerRank}</span>
              {" vs "}
              {origin.name_en} <span className="font-mono text-amber-400">#{origin.mercerRank}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">{saudi.name_en} is {mercerComparison}</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tax Savings</p>
            <p className="text-sm text-white">
              {origin.country_en}: <span className="font-mono text-red-400">{taxSavingsPct}%</span>
              {" → KSA: "}
              <span className="font-mono text-emerald-400">0%</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Save {result.tax_savings_sar.toLocaleString()} SAR/month</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Minimum Package</p>
            <p className="text-sm text-white font-mono">
              <span className="text-cyan-400">{result.saudi_total_sar.toLocaleString()} SAR</span>/mo
            </p>
            <p className="text-xs text-gray-500 mt-1">For family of 3, compound housing</p>
          </div>
        </div>

        <div className="mb-6 text-xs text-gray-500">
          <span className="text-gray-400 font-medium">Also compare: </span>
          {otherSaudiCities.map((sc, i) => (
            <span key={sc.id}>
              {i > 0 && " | "}
              <Link href={localizedHref(lang, `/relocate/${origin.id}-to-${sc.id}`)} className="text-cyan-400/70 hover:text-cyan-400 hover:underline">
                {origin.name_en} → {sc.name_en}
              </Link>
            </span>
          ))}
          {" | "}
          {otherOriginCities.map((oc, i) => (
            <span key={oc.id}>
              {i > 0 && " | "}
              <Link href={localizedHref(lang, `/relocate/${oc.id}-to-${saudi.id}`)} className="text-cyan-400/70 hover:text-cyan-400 hover:underline">
                {oc.name_en} → {saudi.name_en}
              </Link>
            </span>
          ))}
        </div>
      </div>

      <RelocateClient defaultOriginId={origin.id} defaultSaudiId={saudi.id} />
    </>
  );
}
