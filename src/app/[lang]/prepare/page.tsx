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

// FAQ schema — localized per lang for SEO rich results in each market
const FAQ_BY_LANG: Record<Lang, Array<{ q: string; a: string }>> = {
  en: [
    { q: "What documents do I need to work in Saudi Arabia?", a: "You need a valid passport (6+ months validity), apostilled or legalized diplomas, a medical examination certificate, and a work visa sponsored by a Saudi employer. Professional licenses (SCFHS for healthcare, SCE for engineering, SOCPA for accounting) may also be required depending on your profession." },
    { q: "How long does SCFHS registration take?", a: "SCFHS (Saudi Commission for Health Specialties) registration typically takes 4-8 weeks. You must complete DataFlow Primary Source Verification first, which adds 2-4 weeks. Start the process at least 3 months before your planned departure." },
    { q: "Do I need to apostille my diplomas for Saudi Arabia?", a: "Yes, if your country is part of the Hague Convention, you can apostille your diplomas directly. Otherwise, you need embassy legalization through your country's Ministry of Foreign Affairs and the Saudi Embassy. This process can take 2-6 weeks." },
    { q: "What is the Iqama and how do I get it?", a: "The Iqama is Saudi Arabia's residence permit for expatriate workers. Your employer processes it through Jawazat (the passport office) after your arrival. It typically takes 1-3 weeks and is required for opening a bank account, getting a SIM card, driving, and accessing government services via Absher." },
    { q: "What certifications do engineers need in Saudi Arabia?", a: "Engineers must register with the Saudi Council of Engineers (SCE). You need an accredited engineering degree and must complete DataFlow verification. Processing takes 2-4 weeks. Some specializations may require additional certifications depending on the project type." },
  ],
  fr: [
    { q: "Quels documents pour travailler en Arabie Saoudite ?", a: "Il faut un passeport valide (6+ mois), des diplômes apostillés ou légalisés, un certificat médical et un visa de travail sponsorisé par un employeur saoudien. Des licences professionnelles (SCFHS pour la santé, SCE pour l'ingénierie, SOCPA pour la comptabilité) peuvent aussi être requises selon votre métier." },
    { q: "Combien de temps prend l'enregistrement SCFHS ?", a: "L'enregistrement SCFHS (Commission saoudienne des spécialités de santé) prend généralement 4 à 8 semaines. Vous devez d'abord effectuer la vérification DataFlow (2-4 semaines supplémentaires). Commencez le processus au moins 3 mois avant votre départ." },
    { q: "Faut-il apostiller ses diplômes pour l'Arabie Saoudite ?", a: "Oui. Si votre pays fait partie de la Convention de La Haye, vous pouvez apostiller directement. Sinon, vous devez passer par la légalisation par le ministère des Affaires étrangères et l'ambassade saoudienne. Ce processus peut prendre 2 à 6 semaines." },
    { q: "Qu'est-ce que l'Iqama et comment l'obtenir ?", a: "L'Iqama est le permis de résidence saoudien pour les travailleurs expatriés. Votre employeur le traite via le Jawazat (bureau des passeports) après votre arrivée. Il faut 1 à 3 semaines et il est requis pour ouvrir un compte bancaire, obtenir une carte SIM, conduire et accéder aux services publics via Absher." },
    { q: "Quelles certifications pour les ingénieurs en Arabie Saoudite ?", a: "Les ingénieurs doivent s'enregistrer au Saudi Council of Engineers (SCE). Il faut un diplôme accrédité et la vérification DataFlow. Le traitement prend 2 à 4 semaines. Certaines spécialisations requièrent des certifications additionnelles selon le type de projet." },
  ],
  ar: [
    { q: "ما المستندات المطلوبة للعمل في المملكة العربية السعودية؟", a: "تحتاج إلى جواز سفر ساري المفعول (6+ أشهر صلاحية)، شهادات مصدقة بالأبوستيل أو الموثقة، شهادة فحص طبي، وتأشيرة عمل برعاية صاحب عمل سعودي. قد تكون التراخيص المهنية مطلوبة أيضاً حسب مهنتك (هيئة التخصصات الصحية SCFHS للرعاية الصحية، الهيئة السعودية للمهندسين SCE للهندسة، الهيئة السعودية للمحاسبين SOCPA للمحاسبة)." },
    { q: "كم تستغرق هيئة التخصصات الصحية SCFHS للتسجيل؟", a: "يستغرق تسجيل هيئة التخصصات الصحية (SCFHS) عادةً 4 إلى 8 أسابيع. يجب إكمال التحقق من المصدر الأساسي عبر DataFlow أولاً، مما يضيف 2 إلى 4 أسابيع. ابدأ العملية قبل 3 أشهر على الأقل من تاريخ السفر المخطط." },
    { q: "هل أحتاج إلى تصديق شهاداتي بالأبوستيل للمملكة العربية السعودية؟", a: "نعم، إذا كان بلدك جزءاً من اتفاقية لاهاي، يمكنك تصديق شهاداتك مباشرة بالأبوستيل. وإلا، تحتاج إلى تصديق السفارة عبر وزارة الخارجية في بلدك والسفارة السعودية. يمكن أن تستغرق هذه العملية من 2 إلى 6 أسابيع." },
    { q: "ما هي الإقامة وكيف أحصل عليها؟", a: "الإقامة هي تصريح الإقامة في المملكة العربية السعودية للعمال المغتربين. يعالجها صاحب العمل عبر الجوازات بعد وصولك. تستغرق عادة من 1 إلى 3 أسابيع وهي مطلوبة لفتح حساب بنكي، الحصول على شريحة SIM، القيادة، والوصول إلى الخدمات الحكومية عبر أبشر." },
    { q: "ما الشهادات التي يحتاجها المهندسون في المملكة العربية السعودية؟", a: "يجب على المهندسين التسجيل في الهيئة السعودية للمهندسين (SCE). تحتاج إلى شهادة هندسية معتمدة ويجب إكمال التحقق عبر DataFlow. تستغرق المعالجة من 2 إلى 4 أسابيع. قد تتطلب بعض التخصصات شهادات إضافية حسب نوع المشروع." },
  ],
};

function buildFaqLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_BY_LANG[lang].map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

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

export default async function LangPreparePage({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqLd(lang)) }}
      />
      <PrepareClient />
    </>
  );
}
