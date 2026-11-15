import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { Lang } from "@/lib/i18n/context";
import { buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";
import { localizedHref } from "@/lib/i18n/links";
import { TEXT } from "@/lib/rankings";
import { toSlug } from "@/lib/occupations";
import data from "@/data/master.json";
import { ORIGIN_CITIES, SAUDI_CITIES } from "@/data/relocation-data";
import {
  LazyLayoffsChart,
  LazyParadoxChart,
} from "@/components/shared/LazyRecharts";

import LangToggle from "@/components/ui/LangToggle";
import StickyNav from "@/components/nav/StickyNav";
import HeroCounter from "@/components/hero/HeroCounter";
import RiskCalculator from "@/components/occupations/RiskCalculator";
import CareerCTA from "@/components/career/CareerCTA";

const KSAMapSection = dynamic(() => import("@/components/risk-map/KSAMapSection"), {
  loading: () => <div className="h-[500px] animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const AIExposureTreemap = dynamic(() => import("@/components/treemap/AIExposureTreemap"), {
  loading: () => <div className="h-[600px] animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const NitaqatSection = dynamic(() => import("@/components/nitaqat/NitaqatSection"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const EmployerTable = dynamic(() => import("@/components/employers/EmployerTable"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const ShiftPulse = dynamic(() => import("@/components/pulse/ShiftPulse"), {
  loading: () => <div className="h-64 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const WEFDualList = dynamic(() => import("@/components/wef/WEFDualList"), {
  loading: () => <div className="h-80 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const GigaProjectsSection = dynamic(() => import("@/components/giga/GigaProjectsSection"), {
  loading: () => <div className="h-64 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const EmailCapture = dynamic(() => import("@/components/EmailCapture"), {
  loading: () => <div className="h-40 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const MethodologyAccordion = dynamic(() => import("@/components/observatory/MethodologyAccordion"), {
  loading: () => <div className="h-40 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const AboutAuthor = dynamic(() => import("@/components/footer/AboutAuthor"), {
  loading: () => <div className="h-40 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
  ssr: false,
});
const Footer = dynamic(() => import("@/components/footer/Footer"), { ssr: false });
const LayoffsTicker = dynamic(() => import("@/components/layoffs/LayoffsTicker"), { ssr: false });
const SmartPopup = dynamic(() => import("@/components/SmartPopup"), { ssr: false });

const TITLES: Record<Lang, string> = {
  // EN: question hook + value prop, ~49 chars (pixel budget OK)
  en: "Is Your Saudi Job at AI Risk? Free 237-Job Score",
  // FR: kept conversion-friendly format (FR market already at 13.5% CTR — don't break what works)
  fr: "Risque IA emplois Arabie Saoudite : 237 métiers scorés | SHIFT",
  // AR: direct question framing for Saudi market — leads with the personal stake
  ar: "هل سيستبدل الذكاء الاصطناعي وظيفتك؟ فحص مجاني لـ 237 مهنة",
};

const DESCRIPTIONS: Record<Lang, string> = {
  // EN: shortened from 178 → 119 chars, action-oriented
  en: "Free tool scoring 237 Saudi occupations for AI risk. Salary in SAR, Nitaqat status, career pivots. No signup, no tracking.",
  // FR: 193 → 117 chars — keep the question hook (FR converts at 13.5% CTR)
  fr: "Quels métiers saoudiens l'IA va-t-elle remplacer ? Outil gratuit notant 237 professions. Salaire, Nitaqat, transitions.",
  // AR: 266 → 119 chars — keep direct question + trust signals
  ar: "أي الوظائف السعودية سيستبدلها الذكاء الاصطناعي؟ أداة مجانية تُقيّم 237 مهنة. الراتب، نطاقات، التحولات. بدون تسجيل.",
};

const SR_INTRO: Record<Lang, string> = {
  en: "SHIFT Observatory scores the AI automation risk of 237 occupations in Saudi Arabia. Explore salary benchmarks, Nitaqat saudization bands, career transition paths, and cost-of-living comparisons for expats relocating to Riyadh, Jeddah, Dammam, Makkah, or Madinah. Data from GOSI Q4-2024, WEF Future of Jobs 2025, and Frey & Osborne methodology. Free, trilingual (English, French, Arabic), core data refreshed March 2026; Pulse and Saudization tracker updated weekly.",
  fr: "SHIFT Observatory évalue le risque d'automatisation IA de 237 professions en Arabie Saoudite. Explorez les benchmarks salariaux, les bandes Nitaqat, les transitions de carrière, et les comparaisons coût de la vie pour les expats à Riyad, Djeddah, Dammam, La Mecque ou Médine. Données GOSI Q4-2024, WEF Future of Jobs 2025, et méthodologie Frey & Osborne. Gratuit, trilingue, données principales actualisées en mars 2026 ; Pulse et le suivi de la saoudisation actualisés chaque semaine.",
  ar: "يُقيّم مرصد شيفت مخاطر الأتمتة بالذكاء الاصطناعي لـ 237 مهنة في المملكة العربية السعودية. استكشف معايير الرواتب، نطاقات السعودة، مسارات الانتقال الوظيفي، ومقارنات تكلفة المعيشة للوافدين إلى الرياض وجدة والدمام ومكة والمدينة المنورة. المصادر: بيانات التأمينات الاجتماعية للربع الرابع 2024، وتقرير مستقبل الوظائف 2025 للمنتدى الاقتصادي العالمي، ومنهجية فري وأوزبورن. مجاني بثلاث لغات. تحديث البيانات الأساسية في مارس 2026؛ يُحدَّث نبض السوق ومتتبع التوطين أسبوعياً.",
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
  // CRITICAL: Next.js REPLACES the openGraph block when redeclared in a child
  // generateMetadata — it does NOT merge with the layout's openGraph. So if
  // we override openGraph.title/description here, we MUST also restate every
  // other field we want preserved (images, type, locale, url, siteName).
  // See: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  const ogImage = `${SITE_URL}/api/og?lang=${lang}`;
  const ogLocale = lang === "fr" ? "fr_FR" : lang === "ar" ? "ar_SA" : "en_US";
  return {
    title: TITLES[lang],
    description: DESCRIPTIONS[lang],
    alternates: buildLanguageAlternates(lang, "/"),
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: `${SITE_URL}/${lang}`,
      siteName: "SHIFT Observatory",
      title: TITLES[lang],
      description: DESCRIPTIONS[lang],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "SHIFT Observatory — AI Job Risk Dashboard for Saudi Arabia",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLES[lang],
      description: DESCRIPTIONS[lang],
      images: [ogImage],
    },
  };
}

const H1: Record<Lang, string> = {
  en: "AI Job Risk in Saudi Arabia — SHIFT Observatory Dashboard",
  fr: "Risque IA sur les emplois en Arabie Saoudite — Tableau de bord SHIFT Observatory",
  ar: "مخاطر الذكاء الاصطناعي على الوظائف في المملكة العربية السعودية — لوحة تحكم مرصد شيفت",
};

const ABOUT_H2: Record<Lang, string> = {
  en: "About SHIFT Observatory",
  fr: "À propos de SHIFT Observatory",
  ar: "حول مرصد شيفت",
};

const ABOUT_BODY: Record<Lang, string> = {
  en: "SHIFT Observatory is a free, independent observatory that tracks how artificial intelligence is reaching the Saudi labour market. Vision 2030 aims to create jobs for Saudis, while the Kingdom is also investing heavily in AI and adopting it fast: the two goals can pull against each other, even if, as in every technological shift, the result is a transformation of jobs and not only a loss. We score 237 occupations by exposure to AI (Frey and Osborne automation probability combined with LLM exposure data from Eloundou et al.), with salary benchmarks in SAR, Nitaqat saudization band, WEF trends and career transition options, and we follow Saudization decisions and AI-related layoffs week by week. Exposure is not a prediction of job loss; see the methodology section. A relocation calculator compares cost of living across 26 origin cities against Riyadh, Jeddah, Dammam, Makkah, and Madinah for expats considering the Kingdom.",
  fr: "SHIFT Observatory est un observatoire gratuit et indépendant qui suit l'arrivée de l'intelligence artificielle sur le marché du travail saoudien. La Vision 2030 vise à créer des emplois pour les Saoudiens, alors que le Royaume investit aussi massivement dans l'IA et l'adopte vite : les deux objectifs peuvent s'opposer, même si, comme dans toute transformation technologique, le résultat est une transformation des emplois et pas seulement une perte. Nous évaluons 237 professions selon leur exposition à l'IA (probabilité d'automatisation de Frey et Osborne combinée aux données d'exposition LLM d'Eloundou et al.), avec salaires en SAR, bande Nitaqat, tendances WEF et pistes de transition, et nous suivons chaque semaine les décisions de saoudisation et les licenciements liés à l'IA. L'exposition n'est pas une prédiction de perte d'emploi ; voir la méthodologie. Un calculateur de relocation compare le coût de la vie entre 26 villes d'origine et Riyad, Djeddah, Dammam, La Mecque et Médine pour les expatriés qui envisagent le Royaume.",
  ar: "مرصد شيفت مرصد مجاني ومستقل يتابع وصول الذكاء الاصطناعي إلى سوق العمل السعودي. تسعى رؤية 2030 إلى خلق وظائف للسعوديين، وفي الوقت نفسه تستثمر المملكة بقوة في الذكاء الاصطناعي وتتبناه بسرعة؛ وقد يتعارض الهدفان، وإن كان الناتج، كما في كل تحول تقني، تحوّلاً في الوظائف وليس خسارة فقط. نقيّم 237 مهنة بحسب تعرضها للذكاء الاصطناعي (احتمال الأتمتة وفق فري وأوزبورن مع بيانات التعرض للنماذج اللغوية من إيلودو وزملائه)، مع معايير الرواتب بالريال وفئة نطاقات واتجاهات المنتدى الاقتصادي العالمي وخيارات الانتقال المهني، ونتابع أسبوعياً قرارات التوطين والتسريحات المرتبطة بالذكاء الاصطناعي. التعرض ليس تنبؤاً بفقدان الوظيفة؛ راجع قسم المنهجية. وتقارن حاسبة الانتقال تكلفة المعيشة بين 26 مدينة منشأ والرياض وجدة والدمام ومكة والمدينة المنورة للوافدين الذين يفكرون في القدوم إلى المملكة.",
};

const POPULAR_H3: Record<Lang, string> = {
  en: "Popular AI Risk Analyses",
  fr: "Analyses populaires de risque IA",
  ar: "تحليلات شعبية لمخاطر الذكاء الاصطناعي",
};

const RELOCATION_H3: Record<Lang, string> = {
  en: "Popular Relocation Comparisons",
  fr: "Comparaisons de relocation populaires",
  ar: "مقارنات الانتقال الشائعة",
};

const TOOLS_H3: Record<Lang, string> = {
  en: "Tools",
  fr: "Outils",
  ar: "أدوات",
};

const COMPARE_H3: Record<Lang, string> = {
  en: "Compare SHIFT",
  fr: "Comparer SHIFT",
  ar: "قارن شيفت",
};

const TOOL_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    relocate: "Cost of Living Calculator",
    career: "Career Transition Recommender",
    profile: "AI Risk Profile",
    prepare: "Pre-Departure Checklist",
  },
  fr: {
    relocate: "Calculateur de coût de la vie",
    career: "Recommandeur de transition de carrière",
    profile: "Profil de risque IA",
    prepare: "Check-list pré-départ",
  },
  ar: {
    relocate: "حاسبة تكلفة المعيشة",
    career: "موصي الانتقال المهني",
    profile: "ملف مخاطر الذكاء الاصطناعي",
    prepare: "قائمة التحضير للسفر",
  },
};

export default async function LangHome({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const allOccupations = [...data.occupations.high_risk, ...data.occupations.low_risk];
  return (
    <main className="min-h-screen bg-bg-primary pb-20 md:pb-10">
      <LangToggle />
      <StickyNav />

      <section className="sr-only">
        <h1>{H1[lang]}</h1>
        <p>{SR_INTRO[lang]}</p>
      </section>

      <HeroCounter />
      <div className="section-divider" />
      <RiskCalculator />
      <CareerCTA />
      <div className="section-divider" />
      <KSAMapSection />
      <AIExposureTreemap />
      <div className="section-divider" />
      <NitaqatSection />
      <p className="max-w-5xl mx-auto px-4 mt-3 mb-8 text-sm"><a href={localizedHref(lang, "/saudization-tracker")} className="text-cyan-400 hover:underline">{{ en: "Explore the 2026 Saudization decisions timeline", fr: "Explorer la chronologie 2026 des décisions de saoudisation", ar: "استكشف الجدول الزمني لقرارات التوطين في 2026" }[lang]}</a></p>
      <div className="section-divider" />
      <EmployerTable />
      <div className="section-divider" />
      <LazyLayoffsChart />
      <ShiftPulse />
      <div className="section-divider" />
      <WEFDualList />
      <LazyParadoxChart />
      <div className="section-divider" />
      <GigaProjectsSection />
      <EmailCapture />
      <MethodologyAccordion />
      <AboutAuthor />

      <section className="px-4 py-8 max-w-5xl mx-auto border-t border-gray-800/50">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {ABOUT_H2[lang]}
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed mb-4">{ABOUT_BODY[lang]}</p>

        <a href={localizedHref(lang, "/rankings/jobs-most-at-risk-from-ai-saudi-arabia")} className="inline-block text-xs text-gray-400 hover:text-cyan-400 mb-4">{TEXT[lang].headings["jobs-most-at-risk-from-ai-saudi-arabia"]}</a>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {POPULAR_H3[lang]}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { slug: "petroleum-engineer", label: "Petroleum Engineer" },
            { slug: "hospital-administrator", label: "Hospital Administrator" },
            { slug: "data-annotation-ai-training-specialist", label: "Data Annotation Specialist" },
            { slug: "rpa-developer", label: "RPA Developer" },
            { slug: "concierge-luxury", label: "Concierge (Luxury)" },
            { slug: "medical-laboratory-technician", label: "Medical Lab Technician" },
            { slug: "ai-prompt-engineer", label: "AI Prompt Engineer" },
            { slug: "respiratory-therapist", label: "Respiratory Therapist" },
          ].map(({ slug, label }) => (
            <a key={slug} href={localizedHref(lang, `/job/${slug}`)} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">
              {lang === "ar" ? (allOccupations.find((o) => toSlug(o.name_en) === slug)?.name_ar || label) : lang === "fr" ? (allOccupations.find((o) => toSlug(o.name_en) === slug)?.name_fr || label) : label}
            </a>
          ))}
        </div>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {RELOCATION_H3[lang]}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { pair: "manila-to-riyadh", label: "Manila → Riyadh" },
            { pair: "manila-to-jeddah", label: "Manila → Jeddah" },
            { pair: "cebu-to-riyadh", label: "Cebu → Riyadh" },
            { pair: "davao-to-riyadh", label: "Davao → Riyadh" },
            { pair: "jakarta-to-riyadh", label: "Jakarta → Riyadh" },
            { pair: "surabaya-to-jeddah", label: "Surabaya → Jeddah" },
            { pair: "dubai-to-riyadh", label: "Dubai → Riyadh" },
            { pair: "mumbai-to-riyadh", label: "Mumbai → Riyadh" },
          ].map(({ pair, label }) => (
            <a key={pair} href={localizedHref(lang, `/relocate/${pair}`)} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">
              {(() => { const [originId, destinationId] = pair.split("-to-"); const origin = ORIGIN_CITIES.find((c) => c.id === originId); const destination = SAUDI_CITIES.find((c) => c.id === destinationId); return origin && destination ? `${lang === "ar" ? origin.name_ar : lang === "fr" ? origin.name_fr : origin.name_en} → ${lang === "ar" ? destination.name_ar : lang === "fr" ? destination.name_fr : destination.name_en}` : label; })()}
            </a>
          ))}
        </div>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {TOOLS_H3[lang]}
        </h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <a href={localizedHref(lang, "/relocate")} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">{TOOL_LABELS[lang].relocate}</a>
          <a href={localizedHref(lang, "/career")} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">{TOOL_LABELS[lang].career}</a>
          <a href={localizedHref(lang, "/profile")} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">{TOOL_LABELS[lang].profile}</a>
          <a href={localizedHref(lang, "/prepare")} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">{TOOL_LABELS[lang].prepare}</a>
        </div>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {COMPARE_H3[lang]}
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { slug: "numbeo", label: "Numbeo" },
            { slug: "glassdoor", label: "Glassdoor" },
            { slug: "linkedin-salary", label: "LinkedIn Salary" },
            { slug: "payscale", label: "PayScale" },
            { slug: "mercer", label: "Mercer" },
            { slug: "bayt", label: "Bayt.com" },
            { slug: "jadarat", label: "Jadarat" },
            { slug: "lightcast", label: "Lightcast" },
          ].map(({ slug, label }) => (
            <a key={slug} href={localizedHref(lang, `/vs/${slug}`)} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">
              {lang === "ar" ? "مقارنة مع" : lang === "fr" ? "Comparer avec" : "vs"} {label}
            </a>
          ))}
        </div>
      </section>

      <Footer />
      <LayoffsTicker />
      <SmartPopup />
    </main>
  );
}
