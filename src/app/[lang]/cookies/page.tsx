import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/context";
import CookiePolicy from "@/app/cookies/client";
import { buildLanguageAlternates } from "@/lib/i18n/seo";

const TITLES: Record<Lang, string> = {
  en: "Cookie Policy | SHIFT Observatory",
  fr: "Politique de cookies | SHIFT Observatory",
  ar: "سياسة ملفات تعريف الارتباط | مرصد شيفت",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Cookie policy for SHIFT Observatory — AI automation risk dashboard for Saudi Arabia.",
  fr: "Politique de cookies de SHIFT Observatory — tableau de bord du risque d'automatisation IA pour l'Arabie Saoudite.",
  ar: "سياسة ملفات تعريف الارتباط لمرصد شيفت — لوحة تحكم مخاطر الأتمتة بالذكاء الاصطناعي للمملكة العربية السعودية.",
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
    alternates: buildLanguageAlternates(lang, "/cookies"),
  };
}

export default function LangCookiesPage() {
  // CookiePolicy reads lang from LangProvider (URL-driven via [lang]/layout)
  return <CookiePolicy />;
}
