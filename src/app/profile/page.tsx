import RiskProfileWizard from "@/components/profile/RiskProfileWizard";
import type { Metadata } from "next";

const SITE = "https://www.ksashiftobservatory.online";

// Static metadata — no cookies() call, enables SSG
export const metadata: Metadata = {
  title: "My AI Risk Profile | SHIFT Observatory",
  description:
    "Discover your personal AI automation risk score based on your occupation, status, region, and sector in Saudi Arabia.",
  openGraph: {
    title: "My AI Risk Profile | SHIFT Observatory",
    description:
      "Discover your personal AI automation risk score based on your occupation, status, region, and sector in Saudi Arabia.",
    images: [`${SITE}/api/og/profile`],
  },
  twitter: {
    card: "summary_large_image",
    title: "My AI Risk Profile | SHIFT Observatory",
    images: [`${SITE}/api/og/profile`],
  },
  alternates: {
    canonical: `${SITE}/profile`,
  },
};

export default function ProfilePage() {
  return <RiskProfileWizard />;
}
