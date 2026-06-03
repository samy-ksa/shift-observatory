import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/context";
import TermsOfUse from "@/app/terms/client";
import { buildLanguageAlternates } from "@/lib/i18n/seo";

const TITLES: Record<Lang, string> = {
  en: "Terms of Use | SHIFT Observatory",
  fr: "Conditions d'utilisation | SHIFT Observatory",
  ar: "شروط الاستخدام | مرصد شيفت",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Terms of use for SHIFT Observatory — AI automation risk dashboard for Saudi Arabia.",
  fr: "Conditions d'utilisation de SHIFT Observatory — tableau de bord du risque d'automatisation IA pour l'Arabie Saoudite.",
  ar: "شروط الاستخدام لمرصد شيفت — لوحة تحكم مخاطر الأتمتة بالذكاء الاصطناعي للمملكة العربية السعودية.",
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
    alternates: buildLanguageAlternates(lang, "/terms"),
  };
}

export default function LangTermsPage() {
  return <TermsOfUse />;
}
