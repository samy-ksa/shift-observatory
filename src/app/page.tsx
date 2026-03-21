import type { Metadata } from "next";
import dynamic from "next/dynamic";

/* ------------------------------------------------------------------ */
/* Above the fold — loaded immediately                                 */
/* ------------------------------------------------------------------ */
import LangToggle from "@/components/ui/LangToggle";
import StickyNav from "@/components/nav/StickyNav";
import HeroCounter from "@/components/hero/HeroCounter";
import RiskCalculator from "@/components/occupations/RiskCalculator";
import CareerCTA from "@/components/career/CareerCTA";

/* ------------------------------------------------------------------ */
/* Below the fold — lazy loaded with ssr: false                        */
/* Recharts (335KB), Treemap (322KB), Map, etc. only load on scroll    */
/* ------------------------------------------------------------------ */
const KSAMapSection = dynamic(
  () => import("@/components/risk-map/KSAMapSection"),
  {
    loading: () => <div className="h-[500px] animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const AIExposureTreemap = dynamic(
  () => import("@/components/treemap/AIExposureTreemap"),
  {
    loading: () => <div className="h-[600px] animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const NitaqatSection = dynamic(
  () => import("@/components/nitaqat/NitaqatSection"),
  {
    loading: () => <div className="h-96 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const EmployerTable = dynamic(
  () => import("@/components/employers/EmployerTable"),
  {
    loading: () => <div className="h-96 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const LayoffsSection = dynamic(
  () => import("@/components/layoffs/LayoffsChart"),
  {
    loading: () => <div className="h-80 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const ShiftPulse = dynamic(
  () => import("@/components/pulse/ShiftPulse"),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const WEFDualList = dynamic(
  () => import("@/components/wef/WEFDualList"),
  {
    loading: () => <div className="h-80 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const ParadoxChart = dynamic(
  () => import("@/components/paradox/ParadoxChart"),
  {
    loading: () => <div className="h-80 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const GigaProjectsSection = dynamic(
  () => import("@/components/giga/GigaProjectsSection"),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const EmailCapture = dynamic(
  () => import("@/components/EmailCapture"),
  {
    loading: () => <div className="h-40 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const MethodologyAccordion = dynamic(
  () => import("@/components/observatory/MethodologyAccordion"),
  {
    loading: () => <div className="h-40 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const AboutAuthor = dynamic(
  () => import("@/components/footer/AboutAuthor"),
  {
    loading: () => <div className="h-40 animate-pulse bg-gray-900/50 rounded-lg mx-4" />,
    ssr: false,
  },
);

const Footer = dynamic(
  () => import("@/components/footer/Footer"),
  { ssr: false },
);

const LayoffsTicker = dynamic(
  () => import("@/components/layoffs/LayoffsTicker"),
  { ssr: false },
);

const SmartPopup = dynamic(
  () => import("@/components/SmartPopup"),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */
import { getServerLang } from "@/lib/server-lang";

export async function generateMetadata(): Promise<Metadata> {
  const lang = getServerLang();

  const titles: Record<string, string> = {
    en: "AI Job Risk in Saudi Arabia: 237 Jobs Scored (2026) | Free Dashboard",
    fr: "Risque IA sur l'emploi en Arabie Saoudite : 237 métiers analysés (2026) | Gratuit",
    ar: "مخاطر الذكاء الاصطناعي على الوظائف في السعودية: 237 وظيفة (2026) | مجاني",
  };

  const descriptions: Record<string, string> = {
    en: "Which Saudi jobs will AI replace? Free dashboard scoring 237 occupations. Salary data, Nitaqat status, career transitions, relocation calculator. Updated Q1 2026.",
    fr: "Quels métiers l'IA va-t-elle remplacer en Arabie Saoudite ? Dashboard gratuit évaluant 237 métiers. Salaires, Nitaqat, reconversions, calculateur d'expatriation. Mis à jour T1 2026.",
    ar: "أي الوظائف ستحل محلها الذكاء الاصطناعي في السعودية؟ لوحة تحكم مجانية تقيّم 237 وظيفة. بيانات الرواتب، نطاقات، تحولات مهنية. محدّث الربع الأول 2026.",
  };

  return {
    title: titles[lang] ?? titles.en,
    description: descriptions[lang] ?? descriptions.en,
    alternates: {
      canonical: "https://www.ksashiftobservatory.online",
    },
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary pb-20 md:pb-10">
      {/* Language Toggle */}
      <LangToggle />

      {/* Sticky Navigation */}
      <StickyNav />

      {/* Section 1: Hero */}
      <HeroCounter />
      <div className="section-divider" />

      {/* Section 2: Is My Job at Risk? */}
      <RiskCalculator />

      {/* Career Transition CTA */}
      <CareerCTA />
      <div className="section-divider" />

      {/* Section 3: AI Risk Map */}
      <KSAMapSection />

      {/* Section 4: Sector Analysis */}
      <AIExposureTreemap />
      <div className="section-divider" />

      {/* Section 5: Nitaqat & Saudization */}
      <NitaqatSection />
      <div className="section-divider" />

      {/* Section 6: Top Employers */}
      <EmployerTable />
      <div className="section-divider" />

      {/* Section 7: Layoffs */}
      <LayoffsSection />

      {/* Section 8: SHIFT Pulse */}
      <ShiftPulse />
      <div className="section-divider" />

      {/* Section 9: WEF Growth vs Decline */}
      <WEFDualList />

      {/* V2030 Paradox */}
      <ParadoxChart />
      <div className="section-divider" />

      {/* Giga-Projects */}
      <GigaProjectsSection />

      {/* Email Capture */}
      <EmailCapture />

      {/* Methodology & About */}
      <MethodologyAccordion />

      {/* About the Author */}
      <AboutAuthor />

      {/* Footer */}
      <Footer />

      {/* Fixed bottom ticker */}
      <LayoffsTicker />

      {/* Smart email popup */}
      <SmartPopup />
    </main>
  );
}
