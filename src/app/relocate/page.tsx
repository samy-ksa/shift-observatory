import type { Metadata } from "next";
import RelocateClient from "./client";

const SITE = "https://www.ksashiftobservatory.online";

export const metadata: Metadata = {
  title:
    "Relocation Calculator — Saudi Arabia Salary & Cost of Living Comparison | SHIFT Observatory",
  description:
    "Calculate your real purchasing power in Saudi Arabia. Compare salaries, cost of living, tax savings, and expat packages from 12 origin cities to Riyadh, Jeddah, or Dammam.",
  keywords: [
    "Saudi Arabia relocation calculator",
    "expat salary Saudi Arabia",
    "cost of living Riyadh",
    "cost of living Jeddah",
    "tax-free salary KSA",
    "expat package Saudi Arabia",
    "move to Saudi Arabia",
    "Saudi Arabia vs Paris cost of living",
    "Saudi Arabia vs London salary",
    "compound housing Riyadh",
    "international school fees Saudi Arabia",
    "Mercer cost of living Saudi Arabia",
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
