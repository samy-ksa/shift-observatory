import CareerCTA from "@/components/career/CareerCTA";
import HeroCounter from "@/components/hero/HeroCounter";
import KSAMapSection from "@/components/risk-map/KSAMapSection";
import SectorGrid from "@/components/sectors/SectorGrid";
import RiskCalculator from "@/components/occupations/RiskCalculator";
import EmployerTable from "@/components/employers/EmployerTable";
import LayoffsTicker from "@/components/layoffs/LayoffsTicker";
import LayoffsSection from "@/components/layoffs/LayoffsChart";
import ShiftPulse from "@/components/pulse/ShiftPulse";
import WEFDualList from "@/components/wef/WEFDualList";
import ParadoxChart from "@/components/paradox/ParadoxChart";
import NitaqatSection from "@/components/nitaqat/NitaqatSection";
import GigaProjectsSection from "@/components/giga/GigaProjectsSection";
import MethodologyAccordion from "@/components/observatory/MethodologyAccordion";
import StickyNav from "@/components/nav/StickyNav";
import EmailCapture from "@/components/EmailCapture";
import LangToggle from "@/components/ui/LangToggle";
import Footer from "@/components/footer/Footer";

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

      {/* Section 2: Is My Job at Risk? (hook personnel immédiat) */}
      <RiskCalculator />

      {/* Career Transition CTA */}
      <CareerCTA />
      <div className="section-divider" />

      {/* Section 3: AI Risk Map */}
      <KSAMapSection />

      {/* Section 4: Sector Analysis */}
      <SectorGrid />
      <div className="section-divider" />

      {/* Section 5: Nitaqat & Saudization */}
      <NitaqatSection />
      <div className="section-divider" />

      {/* Section 6: Top Employers */}
      <EmployerTable />
      <div className="section-divider" />

      {/* Section 7: Layoffs */}
      <LayoffsSection />

      {/* Section 8: SHIFT Pulse — Weekly AI Intelligence */}
      <ShiftPulse />
      <div className="section-divider" />

      {/* Section 9: WEF Growth vs Decline */}
      <WEFDualList />

      {/* Section 8: V2030 Paradox */}
      <ParadoxChart />
      <div className="section-divider" />

      {/* Section 9: Giga-Projects */}
      <GigaProjectsSection />

      {/* Section 10: Email Capture */}
      <EmailCapture />

      {/* Section 10: Methodology & About */}
      <MethodologyAccordion />

      {/* Footer */}
      <Footer />

      {/* Fixed bottom ticker - always visible while scrolling */}
      <LayoffsTicker />
    </main>
  );
}
