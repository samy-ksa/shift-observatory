import type { Metadata } from "next";
import PrivacyPolicy from "./client";

const SITE = "https://www.ksashiftobservatory.online";

export const metadata: Metadata = {
  title: "Privacy Policy | SHIFT Observatory",
  description:
    "Privacy policy for SHIFT Observatory — AI automation risk dashboard for Saudi Arabia.",
  alternates: {
    canonical: `${SITE}/privacy`,
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
