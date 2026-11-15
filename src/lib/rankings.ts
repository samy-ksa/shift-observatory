import type { Lang } from "@/lib/i18n/context";
import { getAllOccupations, getSector, type Occupation, type Sector } from "@/lib/occupations";
import masterData from "@/data/master.json";

export const RANKING_SLUGS = [
  "jobs-most-at-risk-from-ai-saudi-arabia",
  "jobs-safest-from-ai-saudi-arabia",
  "jobs-reserved-for-saudis",
  "highest-paid-jobs-saudi-arabia-ai-risk",
] as const;
export type RankingSlug = (typeof RANKING_SLUGS)[number];

export const TEXT: Record<Lang, {
  headings: Record<RankingSlug, string>; rankings: string; sectors: string;
  rank: string; occupation: string; risk: string; category: string; salary: string; status: string;
  faq: string; method: string; related: string; substitution: string; augmentation: string;
  reserved: string; quota: string; open: string; none: string;
}> = {
  en: {
    headings: {
      "jobs-most-at-risk-from-ai-saudi-arabia": "30 jobs most at risk from AI in Saudi Arabia",
      "jobs-safest-from-ai-saudi-arabia": "30 jobs safest from AI in Saudi Arabia",
      "jobs-reserved-for-saudis": "Jobs reserved for Saudis: occupation list",
      "highest-paid-jobs-saudi-arabia-ai-risk": "Highest-paid jobs in Saudi Arabia and their AI risk",
    }, rankings: "Rankings", sectors: "Sectors", rank: "Rank", occupation: "Occupation", risk: "AI risk /100", category: "AI impact", salary: "Median salary (SAR/month)", status: "Nitaqat status", faq: "Frequently asked questions", method: "Methodology", related: "Explore related pages", substitution: "Substitution", augmentation: "Augmentation", reserved: "Reserved for Saudi nationals only", quota: "Subject to a sector Saudization quota; this does not by itself prohibit non-Saudi employment", open: "No occupation-specific reservation recorded", none: "No occupations in the detailed dataset",
  },
  fr: {
    headings: {
      "jobs-most-at-risk-from-ai-saudi-arabia": "30 métiers les plus exposés à l’IA en Arabie saoudite",
      "jobs-safest-from-ai-saudi-arabia": "30 métiers les moins exposés à l’IA en Arabie saoudite",
      "jobs-reserved-for-saudis": "Métiers réservés aux Saoudiens : la liste",
      "highest-paid-jobs-saudi-arabia-ai-risk": "Métiers les mieux rémunérés en Arabie saoudite et risque IA",
    }, rankings: "Classements", sectors: "Secteurs", rank: "Rang", occupation: "Métier", risk: "Risque IA /100", category: "Effet de l’IA", salary: "Salaire médian (SAR/mois)", status: "Statut Nitaqat", faq: "Questions fréquentes", method: "Méthodologie", related: "Pages liées", substitution: "Substitution", augmentation: "Augmentation", reserved: "Réservé aux ressortissants saoudiens", quota: "Soumis à un quota de saoudisation sectoriel, sans interdiction générale d’employer des non-Saoudiens", open: "Aucune réservation propre à ce métier recensée", none: "Aucun métier dans le jeu de données détaillé",
  },
  ar: {
    headings: {
      "jobs-most-at-risk-from-ai-saudi-arabia": "أكثر 30 مهنة عرضة لمخاطر الذكاء الاصطناعي في السعودية",
      "jobs-safest-from-ai-saudi-arabia": "أقل 30 مهنة عرضة لمخاطر الذكاء الاصطناعي في السعودية",
      "jobs-reserved-for-saudis": "قائمة المهن المحصورة على السعوديين",
      "highest-paid-jobs-saudi-arabia-ai-risk": "أعلى المهن أجراً في السعودية ومخاطر الذكاء الاصطناعي",
    }, rankings: "التصنيفات", sectors: "القطاعات", rank: "الترتيب", occupation: "المهنة", risk: "مخاطر الذكاء الاصطناعي /100", category: "أثر الذكاء الاصطناعي", salary: "الراتب الوسيط (ريال/شهر)", status: "حالة نطاقات", faq: "الأسئلة الشائعة", method: "المنهجية", related: "صفحات ذات صلة", substitution: "استبدال", augmentation: "تعزيز", reserved: "مقصورة على المواطنين السعوديين", quota: "تخضع لنسبة توطين قطاعية؛ وهذا لا يمنع بحد ذاته توظيف غير السعوديين", open: "لا يوجد حصر مهني مسجل", none: "لا توجد مهن في مجموعة البيانات التفصيلية",
  },
};

export const SECTORS = masterData.sectors as Sector[];
export const occupationName = (o: Occupation, lang: Lang) => o[`name_${lang}`] || o.name_en;
export const sectorName = (s: Sector, lang: Lang) => s[`name_${lang}`] || s.name_en;
export const occupationsInSector = (id: string) => getAllOccupations().filter((o) => o.sector_id === id);
export function rankingOccupations(slug: RankingSlug): Occupation[] {
  const all = getAllOccupations();
  if (slug === "jobs-most-at-risk-from-ai-saudi-arabia") return all.slice(0, 30);
  if (slug === "jobs-safest-from-ai-saudi-arabia") return all.sort((a, b) => a.composite - b.composite).slice(0, 30);
  if (slug === "jobs-reserved-for-saudis") return all.filter((o) => o.nitaqat_status === "reserved_saudi_only");
  return all.sort((a, b) => b.salary_median_sar - a.salary_median_sar).slice(0, 30);
}
export function stats(rows: Occupation[]) {
  const scores = rows.map((o) => o.composite);
  const salaries = rows.map((o) => o.salary_median_sar).sort((a, b) => a - b);
  const count = rows.length;
  return {
    count,
    average: count ? Math.round(scores.reduce((a, b) => a + b, 0) / count) : 0,
    median: count ? Math.round((salaries[Math.floor((count - 1) / 2)] + salaries[Math.floor(count / 2)]) / 2) : 0,
    min: count ? Math.min(...scores) : 0,
    max: count ? Math.max(...scores) : 0,
    substitution: rows.filter((o) => o.category === "substitution").length,
    reserved: rows.filter((o) => o.nitaqat_status === "reserved_saudi_only").length,
  };
}
export function topSectors(rows: Occupation[], limit = 3): Sector[] {
  return SECTORS.map((s) => ({ sector: s, count: rows.filter((o) => o.sector_id === s.id).length }))
    .filter((x) => x.count > 0).sort((a, b) => b.count - a.count || a.sector.id.localeCompare(b.sector.id))
    .slice(0, limit).map((x) => x.sector);
}
export function relatedSectors(id: string): Sector[] {
  const source = getSector(id);
  return SECTORS.filter((s) => s.id !== id && occupationsInSector(s.id).length > 0)
    .sort((a, b) => Math.abs(a.ai_risk_score - (source?.ai_risk_score ?? 0)) - Math.abs(b.ai_risk_score - (source?.ai_risk_score ?? 0)))
    .slice(0, 3);
}
export function statusLabel(status: string, lang: Lang): string {
  const t = TEXT[lang];
  return status === "reserved_saudi_only" ? t.reserved : status === "sector_quota" ? t.quota : t.open;
}
export function methodology(lang: Lang, rows: Occupation[]): string {
  const sources = Array.from(new Set(rows.map((o) => o.salary_source).filter(Boolean)));
  const samples = sources.slice(0, 4).join(", ");
  const sourceText = samples || "the occupation records";
  return {
    en: `The composite AI risk score draws on Frey–Osborne automation probabilities and Eloundou et al. LLM exposure, alongside local signals. Median monthly salaries are estimates from each occupation’s recorded source, including ${sourceText}. Rankings describe this dataset, not individual employment outcomes.`,
    fr: `Le score composite de risque IA s’appuie sur les probabilités d’automatisation de Frey–Osborne et l’exposition aux grands modèles de langage étudiée par Eloundou et al., ainsi que sur des indicateurs locaux. Les salaires médians mensuels sont des estimations issues des sources enregistrées pour chaque métier${samples ? `, dont ${samples}` : ""}.`,
    ar: `تستند درجة مخاطر الذكاء الاصطناعي المركبة إلى احتمالات الأتمتة لدى فري وأوزبورن وقياسات التعرّض للنماذج اللغوية لدى إلوندو وآخرين، إلى جانب مؤشرات محلية. الرواتب الشهرية الوسيطة تقديرات من المصادر المسجلة لكل مهنة${samples ? `، ومنها ${samples}` : ""}.`,
  }[lang];
}
