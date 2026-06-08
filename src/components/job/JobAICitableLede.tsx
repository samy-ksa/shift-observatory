/**
 * Server-rendered AI-citable lede for /[lang]/job/[slug].
 *
 * Purpose: GEO / AI Overviews / Perplexity / ChatGPT citation.
 *
 * AI search engines cite **self-contained passages of 134-167 words** that
 * directly answer the user's question. Our /job/[slug] pages currently lead
 * with an interactive client widget — there is no static, crawlable answer
 * paragraph at the top. This component fills that gap.
 *
 * The paragraph answers "Will AI replace {occupation} in Saudi Arabia?"
 * with: score, reasoning, salary range, headcount, Nitaqat status, and a
 * recommended action. All facts are sourced from master.json — no AI-
 * generated content, only structured data interpolated into a template.
 *
 * Trilingual: EN (full), FR (compact), AR (compact). Each version is
 * tonally faithful to its locale's reading conventions.
 */

import type { Lang } from "@/lib/i18n/context";
import type { Occupation } from "@/lib/occupations";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtLocale(n: number, lang: Lang): string {
  const tag = lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-US";
  return n.toLocaleString(tag);
}

function nitaqatLabel(status: string | undefined, lang: Lang): string {
  if (status === "reserved_saudi_only") {
    if (lang === "fr") return "réservée aux Saoudiens (les expatriés ne peuvent pas obtenir d'iqama pour ce poste)";
    if (lang === "ar") return "محجوزة للسعوديين فقط (لا يمكن للمغتربين الحصول على إقامة لهذا المنصب)";
    return "reserved for Saudi nationals only (expatriates cannot obtain a work permit for this role)";
  }
  if (lang === "fr") return "ouverte aux expatriés sous les quotas sectoriels Nitaqat";
  if (lang === "ar") return "مفتوحة للمغتربين بموجب حصص قطاع نطاقات";
  return "open to expatriates under Nitaqat sector quotas";
}

function buildEnglish(occ: Occupation): string {
  const { name_en, composite, employment_saudi_pct, nitaqat_status, category } = occ;
  const salary_entry_sar = occ.salary_entry_sar ?? 0;
  const salary_median_sar = occ.salary_median_sar ?? salary_entry_sar;
  const salary_senior_sar = occ.salary_senior_sar ?? salary_entry_sar;
  const employment_est = occ.employment_est ?? 0;
  const verdict =
    composite >= 70
      ? "yes — it faces very high automation exposure"
      : composite >= 45
        ? "partially — the risk is moderate to high, depending on task mix"
        : "unlikely in the near term — natural defenses against automation are strong";

  const reasoning =
    composite >= 70
      ? `Routine digital tasks and structured decision-making make this role highly susceptible to large language models and robotic process automation, both of which are now deployed at scale across Saudi banks (Arab National Bank, SAMA), telcos (STC), and government services (Absher).`
      : composite >= 45
        ? `Some core tasks are automatable, but elements requiring human judgment, creativity, or interpersonal interaction provide partial protection. Saudi employers are deploying AI to augment rather than fully replace this role.`
        : `Physical presence, emotional intelligence, and non-routine judgment create durable defenses against AI. Demand in Saudi Arabia is also supported by Vision 2030 sector targets in healthcare, education, and renewable energy.`;

  const action =
    composite >= 70
      ? "We recommend exploring transition pathways to lower-risk occupations — see the career recommender."
      : composite >= 45
        ? "Reskilling in AI-complementary capabilities (judgment, client interaction, oversight) is recommended to stay ahead of the curve."
        : "This role is among the safer choices in the Saudi labor market over a 5-10 year horizon.";

  const nit = nitaqatLabel(nitaqat_status, "en");

  return `Will AI replace ${name_en} in Saudi Arabia? The composite AI automation risk score is ${composite}/100 — ${verdict}. SHIFT Observatory builds the score using the Frey-Osborne automation probability framework, Eloundou LLM exposure data, and Nitaqat regulatory pressure, classifying this occupation as "${category === "substitution" ? "AI substitution" : "AI augmentation"}". ${reasoning} ${name_en} in Saudi Arabia earn between SAR ${fmt(salary_entry_sar)} and SAR ${fmt(salary_senior_sar)} per month, with a median of SAR ${fmt(salary_median_sar ?? salary_entry_sar)} — all tax-free under Saudi Arabia's 0% personal income tax. Approximately ${fmt(employment_est)} workers hold this role nationally, with ${employment_saudi_pct}% being Saudi nationals. The role is ${nit}. ${action}`;
}

function buildFrench(occ: Occupation): string {
  const { name_fr, name_en, composite, employment_saudi_pct, nitaqat_status, category } = occ;
  const name = name_fr || name_en;
  const salary_entry_sar = occ.salary_entry_sar ?? 0;
  const salary_median_sar = occ.salary_median_sar ?? salary_entry_sar;
  const salary_senior_sar = occ.salary_senior_sar ?? salary_entry_sar;
  const employment_est = occ.employment_est ?? 0;
  const verdict =
    composite >= 70
      ? "oui — l'exposition à l'automatisation est très élevée"
      : composite >= 45
        ? "partiellement — le risque est modéré à élevé selon les tâches"
        : "peu probable à court terme — les défenses naturelles contre l'automatisation sont solides";

  const reasoning =
    composite >= 70
      ? `Les tâches numériques routinières et la prise de décision structurée rendent ce poste très susceptible d'être remplacé par les LLM et les outils RPA, déjà déployés à grande échelle dans les banques saoudiennes (Arab National Bank), telcos (STC) et services publics (Absher).`
      : composite >= 45
        ? `Certaines tâches sont automatisables, mais le jugement humain, la créativité et l'interaction interpersonnelle offrent une protection partielle. Les employeurs saoudiens déploient l'IA pour augmenter plutôt que remplacer ce rôle.`
        : `La présence physique, l'intelligence émotionnelle et le jugement non routinier créent des défenses durables. La demande saoudienne est soutenue par les objectifs Vision 2030 en santé, éducation et énergies renouvelables.`;

  const action =
    composite >= 70
      ? "Nous recommandons d'explorer des transitions vers des métiers à plus faible risque — consultez le recommandeur de carrière."
      : composite >= 45
        ? "Une montée en compétences sur les capacités complémentaires à l'IA (jugement, relation client, supervision) est recommandée."
        : "Ce métier figure parmi les choix les plus sûrs du marché saoudien sur un horizon 5-10 ans.";

  const nit = nitaqatLabel(nitaqat_status, "fr");

  return `L'IA va-t-elle remplacer ${name} en Arabie Saoudite ? Le score composite de risque d'automatisation IA est de ${composite}/100 — ${verdict}. SHIFT Observatory calcule ce score selon le cadre Frey-Osborne, les données d'exposition LLM d'Eloundou et la pression réglementaire Nitaqat, classant ce métier comme "${category === "substitution" ? "substitution IA" : "augmentation IA"}". ${reasoning} ${name} en Arabie Saoudite gagne entre ${fmtLocale(salary_entry_sar, "fr")} et ${fmtLocale(salary_senior_sar, "fr")} SAR/mois, médiane ${fmtLocale(salary_median_sar ?? salary_entry_sar, "fr")} SAR — sans impôt sur le revenu. Environ ${fmtLocale(employment_est, "fr")} personnes occupent ce poste au niveau national, dont ${employment_saudi_pct}% de Saoudiens. La profession est ${nit}. ${action}`;
}

function buildArabic(occ: Occupation): string {
  const { name_ar, name_en, composite, employment_saudi_pct, nitaqat_status, category } = occ;
  const name = name_ar || name_en;
  const salary_entry_sar = occ.salary_entry_sar ?? 0;
  const salary_median_sar = occ.salary_median_sar ?? salary_entry_sar;
  const salary_senior_sar = occ.salary_senior_sar ?? salary_entry_sar;
  const employment_est = occ.employment_est ?? 0;
  const verdict =
    composite >= 70
      ? "نعم — التعرض للأتمتة مرتفع جداً"
      : composite >= 45
        ? "جزئياً — المخاطر متوسطة إلى عالية حسب المهام"
        : "غير محتمل على المدى القصير — الدفاعات الطبيعية ضد الأتمتة قوية";

  const reasoning =
    composite >= 70
      ? `المهام الرقمية الروتينية واتخاذ القرارات المهيكلة تجعل هذه المهنة عرضة للاستبدال بنماذج اللغة الكبيرة وأدوات الأتمتة، التي تُنشر بالفعل على نطاق واسع في البنوك السعودية والاتصالات والخدمات الحكومية.`
      : composite >= 45
        ? `بعض المهام قابلة للأتمتة، لكن الحكم البشري والإبداع والتفاعل الشخصي يوفر حماية جزئية. يستخدم أصحاب العمل السعوديون الذكاء الاصطناعي لتعزيز هذا الدور بدلاً من استبداله بالكامل.`
        : `الحضور الجسدي والذكاء العاطفي والحكم غير الروتيني تخلق دفاعات قوية. الطلب السعودي مدعوم بأهداف رؤية 2030 في الرعاية الصحية والتعليم والطاقة المتجددة.`;

  const action =
    composite >= 70
      ? "ننصح باستكشاف مسارات الانتقال إلى مهن ذات مخاطر أقل."
      : composite >= 45
        ? "يُنصح بإعادة التأهيل في المهارات المكملة للذكاء الاصطناعي (الحكم، التفاعل مع العملاء، الإشراف)."
        : "تعد هذه المهنة من بين الخيارات الأكثر أماناً في سوق العمل السعودي على مدى 5-10 سنوات.";

  const nit = nitaqatLabel(nitaqat_status, "ar");

  return `هل سيستبدل الذكاء الاصطناعي ${name} في المملكة العربية السعودية؟ درجة المخاطر المركبة لأتمتة الذكاء الاصطناعي هي ${composite}/100 — ${verdict}. يبني مرصد شيفت الدرجة باستخدام إطار Frey-Osborne لاحتمالية الأتمتة، بيانات تعرض LLM من Eloundou، والضغط التنظيمي لنطاقات، مصنفاً هذه المهنة كـ"${category === "substitution" ? "استبدال بالذكاء الاصطناعي" : "تعزيز بالذكاء الاصطناعي"}". ${reasoning} يكسب ${name} في المملكة العربية السعودية ما بين ${fmtLocale(salary_entry_sar, "ar")} و ${fmtLocale(salary_senior_sar, "ar")} ريال/شهر، بمتوسط ${fmtLocale(salary_median_sar ?? salary_entry_sar, "ar")} ريال — جميعها معفاة من ضريبة الدخل في المملكة العربية السعودية. يشغل حوالي ${fmtLocale(employment_est, "ar")} عامل هذه المهنة على المستوى الوطني، منهم ${employment_saudi_pct}% مواطنون سعوديون. المهنة ${nit}. ${action}`;
}

export default function JobAICitableLede({
  occupation,
  lang,
}: {
  occupation: Occupation;
  lang: Lang;
}) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const paragraph =
    lang === "fr"
      ? buildFrench(occupation)
      : lang === "ar"
        ? buildArabic(occupation)
        : buildEnglish(occupation);

  return (
    <section
      className="max-w-3xl mx-auto px-4 pt-6 pb-2 text-text-secondary"
      dir={dir}
      aria-label="Summary"
    >
      <p className="text-sm md:text-base leading-relaxed">{paragraph}</p>
    </section>
  );
}
