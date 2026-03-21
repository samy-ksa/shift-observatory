import type { Metadata } from "next";
import RelocateClient from "./client";
import { getServerLang } from "@/lib/server-lang";

const SITE = "https://www.ksashiftobservatory.online";

export async function generateMetadata(): Promise<Metadata> {
  const lang = getServerLang();

  const title =
    lang === "fr"
      ? "Coût de la vie en Arabie Saoudite : comparez 65+ postes | Outil gratuit"
      : lang === "ar"
      ? "حاسبة تكلفة المعيشة في السعودية: قارن 65+ عنصراً | أداة مجانية"
      : "Saudi Arabia Cost of Living Calculator: Compare 65+ Items | Free Tool";

  const description =
    lang === "fr"
      ? "Comparez le coût de la vie entre votre ville et l'Arabie Saoudite. Logement, alimentation, transport, écoles, impôts — 65+ postes comparés. Calculateur gratuit avec rapport PDF personnalisé."
      : lang === "ar"
      ? "قارن قوتك الشرائية بين مدينتك والمملكة العربية السعودية. الرواتب، الضرائب، السكن، المدارس — 65+ بند للمقارنة."
      : "Compare cost of living between your city and Saudi Arabia. Housing, food, transport, schools, taxes — 65+ items compared. Free relocation calculator with personalized PDF report.";

  return {
    title,
    description,
    keywords: [
      "Saudi Arabia relocation calculator",
      "expat salary Saudi Arabia",
      "cost of living Riyadh",
      "cost of living Jeddah",
      "cost of living Dammam",
      "tax-free salary KSA",
      "expat package Saudi Arabia",
      "move to Saudi Arabia",
      "Saudi Arabia vs Paris cost of living",
      "Saudi Arabia vs London salary",
      "Saudi Arabia vs New York",
      "Saudi Arabia vs Dubai",
      "Saudi Arabia vs Cairo",
      "Saudi Arabia vs Mumbai",
      "Saudi Arabia vs Sydney",
      "Saudi Arabia vs Casablanca",
      "Saudi Arabia vs Tunis",
      "Saudi Arabia vs Amman",
      "compound housing Riyadh",
      "international school fees Saudi Arabia",
      "Mercer cost of living Saudi Arabia",
      "grocery prices Riyadh",
      "expat life Saudi Arabia",
      // French
      "calculateur expatriation Arabie Saoudite",
      "coût de la vie Riyad",
      "salaire expatrié Arabie Saoudite",
      "s'expatrier en Arabie Saoudite",
    ].join(", "),
    openGraph: {
      title:
        lang === "fr"
          ? "Calculateur d'expatriation — Coût de la vie en Arabie Saoudite | SHIFT Observatory"
          : "Relocation Calculator — Saudi Arabia Salary & Cost of Living | SHIFT Observatory",
      description:
        lang === "fr"
          ? "Comparez votre ville vs l'Arabie Saoudite : salaire, économies d'impôts, logement, scolarité et packages expatriés."
          : "Compare your city vs. Saudi Arabia: salary, tax savings, housing, schooling, and expat packages.",
      images: [`${SITE}/api/og?title=Relocation+Calculator`],
    },
    alternates: {
      canonical: `${SITE}/relocate`,
    },
  };
}

export default function RelocatePage() {
  return <RelocateClient />;
}
