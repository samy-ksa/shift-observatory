import RiskProfileWizard from "@/components/profile/RiskProfileWizard";
import type { Metadata } from "next";
import { getServerLang } from "@/lib/server-lang";

const SITE = "https://www.ksashiftobservatory.online";
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || SITE;

export async function generateMetadata(): Promise<Metadata> {
  const lang = getServerLang();

  const title =
    lang === "fr"
      ? "Mon profil de risque IA | SHIFT Observatory"
      : lang === "ar"
      ? "ملف مخاطر الذكاء الاصطناعي الخاص بي | SHIFT Observatory"
      : "My AI Risk Profile | SHIFT Observatory";

  const description =
    lang === "fr"
      ? "Découvrez votre score personnel de risque d'automatisation IA selon votre métier, statut, région et secteur en Arabie Saoudite."
      : lang === "ar"
      ? "اكتشف درجة مخاطر أتمتة الذكاء الاصطناعي الشخصية بناءً على مهنتك وحالتك ومنطقتك وقطاعك في المملكة العربية السعودية."
      : "Discover your personal AI automation risk score based on your occupation, status, region, and sector in Saudi Arabia.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`${BASE_URL}/api/og/profile`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [`${BASE_URL}/api/og/profile`],
    },
    alternates: {
      canonical: `${SITE}/profile`,
    },
  };
}

export default function ProfilePage() {
  return <RiskProfileWizard />;
}
