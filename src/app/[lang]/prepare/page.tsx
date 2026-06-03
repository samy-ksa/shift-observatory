import type { Metadata } from "next";
import type { Lang } from "@/lib/i18n/context";
import PrepareClient from "@/app/prepare/client";
import { buildLanguageAlternates } from "@/lib/i18n/seo";

const TITLES: Record<Lang, string> = {
  en: "Saudi Arabia Pre-Departure Checklist: Complete Guide by Country (2026) | SHIFT",
  fr: "Check-list pré-départ Arabie Saoudite : guide complet par pays (2026) | SHIFT",
  ar: "قائمة التحضير للسفر إلى المملكة العربية السعودية: دليل شامل حسب البلد (2026) | شيفت",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Personalized pre-departure checklist for Saudi Arabia. Visa, diplomas, certifications (SCFHS, SCE, SOCPA), housing, banking — by country of origin and profession.",
  fr: "Check-list personnalisée pour le départ en Arabie Saoudite. Visa, diplômes, certifications (SCFHS, SCE, SOCPA), logement, banque — selon pays d'origine et profession.",
  ar: "قائمة تحضير شخصية للسفر إلى المملكة العربية السعودية. التأشيرة، الشهادات، التراخيص (SCFHS، SCE، SOCPA)، السكن، البنوك — حسب بلد المنشأ والمهنة.",
};

// FAQ schema preserved in English for now — to be localized per lang in Phase 3c
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What documents do I need to work in Saudi Arabia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You need a valid passport (6+ months validity), apostilled or legalized diplomas, a medical examination certificate, and a work visa sponsored by a Saudi employer. Professional licenses (SCFHS for healthcare, SCE for engineering, SOCPA for accounting) may also be required depending on your profession.",
      },
    },
    {
      "@type": "Question",
      name: "How long does SCFHS registration take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SCFHS (Saudi Commission for Health Specialties) registration typically takes 4-8 weeks. You must complete DataFlow Primary Source Verification first, which adds 2-4 weeks. Start the process at least 3 months before your planned departure.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to apostille my diplomas for Saudi Arabia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, if your country is part of the Hague Convention, you can apostille your diplomas directly. Otherwise, you need embassy legalization through your country's Ministry of Foreign Affairs and the Saudi Embassy. This process can take 2-6 weeks.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Iqama and how do I get it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Iqama is Saudi Arabia's residence permit for expatriate workers. Your employer processes it through Jawazat (the passport office) after your arrival. It typically takes 1-3 weeks and is required for opening a bank account, getting a SIM card, driving, and accessing government services via Absher.",
      },
    },
    {
      "@type": "Question",
      name: "What certifications do engineers need in Saudi Arabia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Engineers must register with the Saudi Council of Engineers (SCE). You need an accredited engineering degree and must complete DataFlow verification. Processing takes 2-4 weeks. Some specializations may require additional certifications depending on the project type.",
      },
    },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const alternates = buildLanguageAlternates(lang, "/prepare");
  return {
    title: TITLES[lang],
    description: DESCRIPTIONS[lang],
    alternates,
    openGraph: {
      title: TITLES[lang],
      description: DESCRIPTIONS[lang],
      url: alternates.canonical,
      siteName: "SHIFT Observatory",
      type: "website",
    },
  };
}

export default function LangPreparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <PrepareClient />
    </>
  );
}
