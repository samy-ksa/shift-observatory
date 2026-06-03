import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/context";
import RiskProfileWizard from "@/components/profile/RiskProfileWizard";
import { buildBreadcrumbLd, buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";

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
      images: [`${SITE_URL}/api/og/profile?lang=${lang}`],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLES[lang],
      images: [`${SITE_URL}/api/og/profile?lang=${lang}`],
    },
    alternates: buildLanguageAlternates(lang, "/profile"),
  };
}

const BREADCRUMB_LABEL: Record<Lang, string> = {
  en: "AI Risk Profile",
  fr: "Profil de risque IA",
  ar: "ملف مخاطر الذكاء الاصطناعي",
};

const SR_H1: Record<Lang, string> = {
  en: "My Personal AI Automation Risk Score in Saudi Arabia",
  fr: "Mon score personnel de risque d'automatisation IA en Arabie Saoudite",
  ar: "درجة المخاطر الشخصية للأتمتة بالذكاء الاصطناعي في المملكة العربية السعودية",
};

const SR_INTRO: Record<Lang, string> = {
  en: "Personalized AI risk profile for workers in Saudi Arabia. Select your occupation, status (Saudi national or expat), region (Riyadh, Jeddah, Eastern Province, etc.) and sector to get a composite automation risk score combining the Frey & Osborne automation probability, Eloundou LLM exposure scores, your sector's Nitaqat saudization pressure, and your region's labour market dynamics. Free, instant, no signup. Results include career transition recommendations from 237 occupations scored.",
  fr: "Profil personnalisé de risque IA pour les travailleurs en Arabie Saoudite. Sélectionnez votre métier, statut (Saoudien ou expat), région (Riyad, Djeddah, Province Orientale, etc.) et secteur pour obtenir un score de risque composite combinant la probabilité d'automatisation Frey-Osborne, l'exposition aux LLM d'Eloundou, la pression Nitaqat de votre secteur, et la dynamique du marché du travail de votre région. Gratuit, instantané, sans inscription. Les résultats incluent des recommandations de transition vers les 237 métiers notés.",
  ar: "ملف شخصي مخصص لمخاطر الذكاء الاصطناعي للعمال في المملكة العربية السعودية. اختر مهنتك، وضعك (مواطن سعودي أو وافد)، منطقتك (الرياض، جدة، المنطقة الشرقية، إلخ) والقطاع للحصول على درجة مخاطر مركّبة تجمع بين احتمالية الأتمتة وفقاً لـ Frey & Osborne، درجات تعرض LLM من Eloundou، ضغط نطاقات السعودة لقطاعك، وديناميكيات سوق العمل في منطقتك. مجاني، فوري، بدون تسجيل. تتضمن النتائج توصيات الانتقال من بين 237 مهنة مقيّمة.",
};

export default async function LangProfilePage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const breadcrumbLd = buildBreadcrumbLd(lang, [
    { name: BREADCRUMB_LABEL[lang], path: "/profile" },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <section className="sr-only">
        <h1>{SR_H1[lang]}</h1>
        <p>{SR_INTRO[lang]}</p>
      </section>
      <RiskProfileWizard />
    </>
  );
}
