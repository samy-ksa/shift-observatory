import { Suspense } from "react";
import CareerRecommender from "@/components/career/CareerRecommender";
import type { Metadata } from "next";
import { getServerLang } from "@/lib/server-lang";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.ksashiftobservatory.online";

export async function generateMetadata(): Promise<Metadata> {
  const lang = getServerLang();

  const title =
    lang === "fr"
      ? "Recommandation de transition de carrière | SHIFT Observatory"
      : lang === "ar"
      ? "توصيات التحول المهني | SHIFT Observatory"
      : "Career Transition Recommender | SHIFT Observatory";

  const description =
    lang === "fr"
      ? "Trouvez des parcours de carrière protégés de l'IA selon votre métier actuel. Recommandations personnalisées avec réduction de risque, évolution salariale et formations."
      : lang === "ar"
      ? "اكتشف مسارات مهنية آمنة من الذكاء الاصطناعي بناءً على مهنتك الحالية. توصيات مخصصة مع تقليل المخاطر وتغيير الراتب ومسارات التدريب."
      : "Find AI-safe career paths based on your current occupation. Get personalized transition recommendations with risk reduction, salary change, and training paths.";

  return {
    title,
    description,
    openGraph: {
      title,
      description:
        lang === "fr"
          ? "Découvrez des transitions de carrière protégées de l'IA — réduction du risque, salaires et formations."
          : "Discover AI-safe career transitions — risk reduction, salary insights, demand signals, and training paths.",
      images: [`${BASE_URL}/api/og/career`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [`${BASE_URL}/api/og/career`],
    },
  };
}

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
