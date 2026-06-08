import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { Lang } from "@/lib/i18n/context";
import { buildLanguageAlternates } from "@/lib/i18n/seo";
import { localizedHref } from "@/lib/i18n/links";
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
  en: "SHIFT Observatory scores the AI automation risk of 237 occupations in Saudi Arabia. Explore salary benchmarks, Nitaqat saudization bands, career transition paths, and cost-of-living comparisons for expats relocating to Riyadh, Jeddah, or Dammam. Data from GOSI Q4-2024, WEF Future of Jobs 2025, and Frey & Osborne methodology. Free, trilingual (English, French, Arabic), updated Q2 2026.",
  fr: "SHIFT Observatory évalue le risque d'automatisation IA de 237 professions en Arabie Saoudite. Explorez les benchmarks salariaux, les bandes Nitaqat, les transitions de carrière, et les comparaisons coût de la vie pour les expats à Riyad, Djeddah ou Dammam. Données GOSI T4-2024, WEF Future of Jobs 2025, et méthodologie Frey & Osborne. Gratuit, trilingue, mis à jour T2 2026.",
  ar: "يُقيّم مرصد شيفت مخاطر الأتمتة بالذكاء الاصطناعي لـ 237 مهنة في المملكة العربية السعودية. استكشف معايير الرواتب، نطاقات السعودة، مسارات الانتقال الوظيفي، ومقارنات تكلفة المعيشة للوافدين إلى الرياض وجدة والدمام. مجاناً، ثلاثي اللغة، محدث T2 2026.",
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
    alternates: buildLanguageAlternates(lang, "/"),
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
  en: "SHIFT Observatory is a free AI job risk dashboard for Saudi Arabia. It scores 237 occupations using the Frey and Osborne automation probability framework combined with LLM exposure data from Eloundou et al. Each occupation includes entry, median, and senior salary benchmarks in SAR, Nitaqat saudization band classification, WEF growth trends, and career transition recommendations. The relocation calculator compares cost of living across 17 origin cities including Paris, London, Cairo, Mumbai, and Manila against Riyadh, Jeddah, and Dammam. Built for expats evaluating Saudi Arabia as a career destination under Vision 2030.",
  fr: "SHIFT Observatory est un tableau de bord gratuit du risque IA pour 237 emplois en Arabie Saoudite. Il utilise le cadre Frey-Osborne combiné aux données d'exposition LLM d'Eloundou et al. Chaque profession inclut des benchmarks salariaux SAR, la classification Nitaqat, les tendances WEF, et des recommandations de transition. Le calculateur de relocation compare le coût de la vie entre 17 villes d'origine et Riyad/Djeddah/Dammam. Conçu pour les expats évaluant l'Arabie Saoudite sous Vision 2030.",
  ar: "مرصد شيفت هو لوحة تحكم مجانية لمخاطر الذكاء الاصطناعي على 237 مهنة في المملكة العربية السعودية. يستخدم إطار Frey & Osborne مع بيانات Eloundou et al. كل مهنة تتضمن معايير رواتب SAR، تصنيف نطاقات، اتجاهات WEF، وتوصيات الانتقال. يقارن حاسبة الانتقال تكلفة المعيشة بين 17 مدينة منشأ والرياض/جدة/الدمام. مصمم للوافدين الذين يقيّمون المملكة العربية السعودية تحت رؤية 2030.",
};

const POPULAR_H3: Record<Lang, string> = {
  en: "Popular AI Risk Analyses",
  fr: "Analyses populaires de risque IA",
  ar: "تحليلات شعبية لمخاطر الذكاء الاصطناعي",
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

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {POPULAR_H3[lang]}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { slug: "data-entry-keyers", label: "Data Entry Keyers" },
            { slug: "registered-nurses", label: "Registered Nurses" },
            { slug: "software-developers", label: "Software Developers" },
            { slug: "accountants-auditors", label: "Accountants" },
            { slug: "civil-engineers", label: "Civil Engineers" },
            { slug: "teachers", label: "Teachers" },
          ].map(({ slug, label }) => (
            <a key={slug} href={localizedHref(lang, `/job/${slug}`)} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">
              {label}
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
              vs {label}
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
