import type { Metadata } from "next";
import TermsOfUse from "./client";

const SITE = "https://www.ksashiftobservatory.online";

export const metadata: Metadata = {
  title: "Terms of Use | SHIFT Observatory",
  description:
    "Terms of use for SHIFT Observatory — AI automation risk dashboard for Saudi Arabia.",
  alternates: {
    canonical: `${SITE}/terms`,
  },
};

export default function TermsPage() {
  return <TermsOfUse />;
}
