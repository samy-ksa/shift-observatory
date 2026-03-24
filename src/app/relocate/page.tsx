import type { Metadata } from "next";
import RelocateClient from "./client";

const SITE = "https://www.ksashiftobservatory.online";

// Static metadata — no cookies() call, enables SSG
export const metadata: Metadata = {
  title: "Saudi Arabia Cost of Living Calculator: Compare 65+ Items | Free Tool",
  description:
    "Compare cost of living between your city and Saudi Arabia. Housing, food, transport, schools, taxes — 65+ items compared. Free relocation calculator with personalized PDF report.",
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
    "compound housing Riyadh",
    "international school fees Saudi Arabia",
    "Mercer cost of living Saudi Arabia",
    // French
    "calculateur expatriation Arabie Saoudite",
    "coût de la vie Riyad",
    "salaire expatrié Arabie Saoudite",
    "s'expatrier en Arabie Saoudite",
  ].join(", "),
  openGraph: {
    title:
      "Relocation Calculator — Saudi Arabia Salary & Cost of Living | SHIFT Observatory",
    description:
      "Compare your city vs. Saudi Arabia: salary, tax savings, housing, schooling, and expat packages.",
    images: [`${SITE}/api/og?title=Relocation+Calculator`],
  },
  alternates: {
    canonical: `${SITE}/relocate`,
  },
};

export default function RelocatePage() {
  return <RelocateClient />;
}
