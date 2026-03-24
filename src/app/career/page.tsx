import { Suspense } from "react";
import CareerRecommender from "@/components/career/CareerRecommender";
import type { Metadata } from "next";

const SITE = "https://www.ksashiftobservatory.online";

// Static metadata — no cookies() call, enables SSG
export const metadata: Metadata = {
  title: "Career Transition Recommender | SHIFT Observatory",
  description:
    "Find AI-safe career paths based on your current occupation. Get personalized transition recommendations with risk reduction, salary change, and training paths.",
  openGraph: {
    title: "Career Transition Recommender | SHIFT Observatory",
    description:
      "Discover AI-safe career transitions — risk reduction, salary insights, demand signals, and training paths.",
    images: [`${SITE}/api/og/career`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Transition Recommender | SHIFT Observatory",
    images: [`${SITE}/api/og/career`],
  },
  alternates: {
    canonical: `${SITE}/career`,
  },
};

export default function CareerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="text-text-muted animate-pulse">Loading...</div>
        </div>
      }
    >
      <CareerRecommender />
    </Suspense>
  );
}
