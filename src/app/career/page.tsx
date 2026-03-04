import { Suspense } from "react";
import CareerRecommender from "@/components/career/CareerRecommender";
import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shift-observatory.vercel.app";

export const metadata: Metadata = {
  title: "Career Transition Recommender | SHIFT Observatory",
  description:
    "Find AI-safe career paths based on your current occupation. Get personalized transition recommendations with risk reduction, salary change, and training paths.",
  openGraph: {
    title: "Career Transition Recommender | SHIFT Observatory",
    description:
      "Discover AI-safe career transitions \u2014 risk reduction, salary insights, demand signals, and training paths.",
    images: [`${BASE_URL}/api/og/career`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Transition Recommender | SHIFT Observatory",
    images: [`${BASE_URL}/api/og/career`],
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
