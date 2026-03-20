import type { Metadata } from "next";
import CookiePolicy from "./client";

const SITE = "https://www.ksashiftobservatory.online";

export const metadata: Metadata = {
  title: "Cookie Policy | SHIFT Observatory",
  description:
    "Cookie policy for SHIFT Observatory — AI automation risk dashboard for Saudi Arabia.",
  alternates: {
    canonical: `${SITE}/cookies`,
  },
};

export default function CookiesPage() {
  return <CookiePolicy />;
}
