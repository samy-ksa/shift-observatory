import RiskProfileWizard from "@/components/profile/RiskProfileWizard";
import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shift-observatory.vercel.app";

export const metadata: Metadata = {
  title: "My AI Risk Profile | SHIFT Observatory",
  description:
    "Discover your personal AI automation risk score based on your occupation, status, region, and sector in Saudi Arabia.",
  openGraph: {
    title: "My AI Risk Profile | SHIFT Observatory",
    description:
      "Discover your personal AI automation risk score based on your occupation, status, region, and sector.",
    images: [`${BASE_URL}/api/og/profile`],
  },
  twitter: {
    card: "summary_large_image",
    title: "My AI Risk Profile | SHIFT Observatory",
    images: [`${BASE_URL}/api/og/profile`],
  },
};

export default function ProfilePage() {
  return <RiskProfileWizard />;
}
