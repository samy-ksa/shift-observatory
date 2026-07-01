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
 * recommended action. Score/salary/headcount/Nitaqat are structured data
 * interpolated into a template. reasoning/action are per-occupation text
 * generated once offline (scripts/generate-risk-reasoning.py, grounded
 * strictly in the occupation's own scores — zero invention) and stored in
 * master.json, replacing the 3 fixed score-tier blocks that caused
 * duplicate-content across all 711 job pages.
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

  const reasoning = occ.risk_reasoning_en;
  const action = occ.risk_action_en;

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

  const reasoning = occ.risk_reasoning_fr;
  const action = occ.risk_action_fr;

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

  const reasoning = occ.risk_reasoning_ar;
  const action = occ.risk_action_ar;

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
