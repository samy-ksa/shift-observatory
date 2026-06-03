import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/context";
import PrivacyPolicy from "@/app/privacy/client";
import { buildLanguageAlternates } from "@/lib/i18n/seo";

const TITLES: Record<Lang, string> = {
  en: "Privacy Policy | SHIFT Observatory",
  fr: "Politique de confidentialité | SHIFT Observatory",
  ar: "سياسة الخصوصية | مرصد شيفت",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Privacy policy for SHIFT Observatory — AI automation risk dashboard for Saudi Arabia.",
  fr: "Politique de confidentialité de SHIFT Observatory — tableau de bord du risque d'automatisation IA pour l'Arabie Saoudite.",
  ar: "سياسة الخصوصية لمرصد شيفت — لوحة تحكم مخاطر الأتمتة بالذكاء الاصطناعي للمملكة العربية السعودية.",
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
    alternates: buildLanguageAlternates(lang, "/privacy"),
  };
}

export default function LangPrivacyPage() {
  return <PrivacyPolicy />;
}
