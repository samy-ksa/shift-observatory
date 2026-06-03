import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/context";
import RiskProfileWizard from "@/components/profile/RiskProfileWizard";
import { buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";

const TITLES: Record<Lang, string> = {
  en: "My AI Risk Profile | SHIFT Observatory",
  fr: "Mon profil de risque IA | SHIFT Observatory",
  ar: "ملفي الشخصي لمخاطر الذكاء الاصطناعي | مرصد شيفت",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Discover your personal AI automation risk score based on your occupation, status, region, and sector in Saudi Arabia.",
  fr: "Découvrez votre score de risque personnel d'automatisation IA selon votre métier, statut, région et secteur en Arabie Saoudite.",
  ar: "اكتشف درجة المخاطر الشخصية للأتمتة بالذكاء الاصطناعي بناءً على مهنتك ووضعك ومنطقتك وقطاعك في المملكة العربية السعودية.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: TITLES[lang],
    description: DESCRIPTIONS[lang],
    openGraph: {
      title: TITLES[lang],
      description: DESCRIPTIONS[lang],
      images: [`${SITE_URL}/api/og/profile`],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLES[lang],
      images: [`${SITE_URL}/api/og/profile`],
    },
    alternates: buildLanguageAlternates(lang, "/profile"),
  };
}

export default function LangProfilePage() {
  return <RiskProfileWizard />;
}
