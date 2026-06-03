import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  LazyLayoffsChart,
  LazyParadoxChart,
} from "@/components/shared/LazyRecharts";

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
/*
 * LayoffsChart and ParadoxChart use LazyRecharts (IntersectionObserver +
 * import() inside useEffect) instead of next/dynamic(). This prevents the
 * 346 KiB Recharts chunk from appearing as <script async> in the initial
 * HTML — it only downloads when those sections scroll into view.
 */

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
// Static metadata — no cookies() call, enables SSG
export const metadata: Metadata = {
  title: "AI Job Risk Saudi Arabia: 237 Jobs Scored | SHIFT",
  description: "Which Saudi jobs will AI replace? Free dashboard scoring 237 occupations with salary data, Nitaqat status, career transitions and relocation calculator.",
  alternates: {
    canonical: "https://www.ksashiftobservatory.online",
  },
};

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

      {/* SSR SEO content — screen-reader + crawler only, invisible at runtime */}
      <section className="sr-only">
        <h1>AI Job Risk in Saudi Arabia — SHIFT Observatory Dashboard</h1>
        <p>
          SHIFT Observatory scores the AI automation risk of 237 occupations in Saudi Arabia.
          Explore salary benchmarks, Nitaqat saudization bands, career transition paths, and
          cost-of-living comparisons for expats relocating to Riyadh, Jeddah, or Dammam.
          Data from GOSI Q4-2024, WEF Future of Jobs 2025, and Frey &amp; Osborne methodology.
          Free, trilingual (English, French, Arabic), updated Q2 2026.
        </p>
      </section>

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

      {/* Section 7: Layoffs — IntersectionObserver defers Recharts until in view */}
      <LazyLayoffsChart />

      {/* Section 8: SHIFT Pulse */}
      <ShiftPulse />
      <div className="section-divider" />

      {/* Section 9: WEF Growth vs Decline */}
      <WEFDualList />

      {/* V2030 Paradox — IntersectionObserver defers Recharts until in view */}
      <LazyParadoxChart />
      <div className="section-divider" />

      {/* Giga-Projects */}
      <GigaProjectsSection />

      {/* Email Capture */}
      <EmailCapture />

      {/* Methodology & About */}
      <MethodologyAccordion />

      {/* About the Author */}
      <AboutAuthor />

      {/* SSR SEO footer content — crawlable text for keyword density + internal links */}
      <section className="px-4 py-8 max-w-5xl mx-auto border-t border-gray-800/50">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          About SHIFT Observatory
        </h2>
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          SHIFT Observatory is a free AI job risk dashboard for Saudi Arabia.
          It scores 237 occupations using the Frey and Osborne automation probability framework
          combined with LLM exposure data from Eloundou et al. Each occupation includes entry,
          median, and senior salary benchmarks in SAR, Nitaqat saudization band classification,
          WEF growth trends, and career transition recommendations.
          The relocation calculator compares cost of living across 17 origin cities including
          Paris, London, Cairo, Mumbai, and Manila against Riyadh, Jeddah, and Dammam.
          Built for expats evaluating Saudi Arabia as a career destination under Vision 2030.
        </p>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Popular AI Risk Analyses
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
            <a key={slug} href={`/job/${slug}`} className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">
              {label}
            </a>
          ))}
        </div>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Tools
        </h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <a href="/relocate" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">Cost of Living Calculator</a>
          <a href="/career" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">Career Transition Recommender</a>
          <a href="/profile" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">AI Risk Profile</a>
          <a href="/prepare" className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">Pre-Departure Checklist</a>
        </div>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Compare SHIFT
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
            <a
              key={slug}
              href={`/vs/${slug}`}
              className="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
            >
              vs {label}
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Fixed bottom ticker */}
      <LayoffsTicker />

      {/* Smart email popup */}
      <SmartPopup />
    </main>
  );
}
