import masterData from "@/data/master.json";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface Occupation {
  rank: number;
  name_en: string;
  name_ar: string;
  name_fr: string;
  eloundou: number;
  frey_osborne: number;
  felten: string;
  category: "substitution" | "augmentation";
  composite: number;
  wef_trend: string;
  nitaqat_risk: string;
  ksa_relevance: string;
  salary_median_sar: number;
  salary_entry_sar: number;
  salary_senior_sar: number;
  salary_source: string;
  nitaqat_status: string;
  hrdf_programs: HrdfProgram[];
  employment_est: number;
  sector_id: string;
  employment_saudi_pct: number;
}

export interface HrdfProgram {
  name: string;
  name_ar: string;
  type: string;
  relevance: string;
}

export interface Sector {
  id: string;
  name_en: string;
  name_ar: string;
  name_fr: string;
  ai_risk_score: number;
  ai_risk_category: string;
  total: number;
  saudi: number;
  non_saudi: number;
  pct_saudi: number;
}

/* ------------------------------------------------------------------ */
/* Slug helpers                                                        */
/* ------------------------------------------------------------------ */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ------------------------------------------------------------------ */
/* Data access                                                         */
/* ------------------------------------------------------------------ */
const data = masterData as {
  occupations: { high_risk: Occupation[]; low_risk: Occupation[] };
  sectors: Sector[];
  nitaqat: {
    tawteen_decisions_2024_2025: {
      profession: string;
      quota_pct: number;
      phase: string;
      effective: string;
      note: string;
    }[];
    reserved_professions_100: string[];
  };
};

/** All 146 occupations sorted by composite descending */
export function getAllOccupations(): Occupation[] {
  const all = [
    ...data.occupations.high_risk,
    ...data.occupations.low_risk,
  ];
  return all.sort((a, b) => b.composite - a.composite);
}

/** Find by slug — returns undefined if not found */
export function findBySlug(slug: string): Occupation | undefined {
  return getAllOccupations().find((o) => toSlug(o.name_en) === slug);
}

/** Get sector details by sector_id */
export function getSector(sectorId: string): Sector | undefined {
  return (data.sectors as Sector[]).find((s) => s.id === sectorId);
}

/** Get tawteen decisions relevant to an occupation (keyword match) */
export function getRelevantTawteen(occ: Occupation) {
  const nameWords = occ.name_en.toLowerCase().split(/\s+/);
  return data.nitaqat.tawteen_decisions_2024_2025.filter((td) => {
    const profLower = td.profession.toLowerCase();
    return nameWords.some(
      (w) => w.length > 3 && profLower.includes(w)
    );
  });
}

/** Check if occupation is in reserved professions list */
export function isReservedProfession(occ: Occupation): boolean {
  if (occ.nitaqat_status === "reserved_saudi_only") return true;
  const nameLower = occ.name_en.toLowerCase();
  return data.nitaqat.reserved_professions_100.some(
    (rp) => nameLower.includes(rp.toLowerCase()) || rp.toLowerCase().includes(nameLower)
  );
}

/** Get closest occupations by composite score */
export function getRelatedOccupations(occ: Occupation, count = 5): Occupation[] {
  return getAllOccupations()
    .filter((o) => o.name_en !== occ.name_en)
    .sort((a, b) => Math.abs(a.composite - occ.composite) - Math.abs(b.composite - occ.composite))
    .slice(0, count);
}

/** Risk label */
export function riskLabel(score: number): "Very High" | "High" | "Moderate" | "Low" {
  if (score >= 70) return "Very High";
  if (score >= 45) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
}

/** Risk label in Arabic */
export function riskLabelAr(score: number): string {
  if (score >= 70) return "مرتفع جداً";
  if (score >= 45) return "مرتفع";
  if (score >= 25) return "متوسط";
  return "منخفض";
}

/** Risk label in French */
export function riskLabelFr(score: number): string {
  if (score >= 70) return "Très élevé";
  if (score >= 45) return "Élevé";
  if (score >= 25) return "Modéré";
  return "Faible";
}

/** Risk color class */
export function riskColor(score: number): string {
  if (score >= 70) return "text-red-500";
  if (score >= 45) return "text-orange-500";
  if (score >= 25) return "text-yellow-500";
  return "text-green-500";
}

/** Risk bg color */
export function riskBg(score: number): string {
  if (score >= 70) return "bg-red-500";
  if (score >= 45) return "bg-orange-500";
  if (score >= 25) return "bg-yellow-500";
  return "bg-green-500";
}

/** WEF trend display label */
export function wefTrendLabel(trend?: string): string {
  if (!trend) return "N/A";
  const map: Record<string, string> = {
    decline_brutal: "Rapid Decline",
    decline_progressive: "Progressive Decline",
    stable: "Stable",
    growth_ai_augmented: "AI-Augmented Growth",
    growth_organic: "Organic Growth",
    growth_rapid: "Rapid Growth",
  };
  return map[trend] || trend.replace(/_/g, " ");
}

/** WEF trend AR */
export function wefTrendLabelAr(trend?: string): string {
  if (!trend) return "غير متوفر";
  const map: Record<string, string> = {
    decline_brutal: "تراجع حاد",
    decline_progressive: "تراجع تدريجي",
    stable: "مستقر",
    growth_ai_augmented: "نمو معزز بالذكاء الاصطناعي",
    growth_organic: "نمو عضوي",
    growth_rapid: "نمو سريع",
  };
  return map[trend] || trend;
}

/** WEF trend FR */
export function wefTrendLabelFr(trend?: string): string {
  if (!trend) return "N/D";
  const map: Record<string, string> = {
    decline_brutal: "Déclin rapide",
    decline_progressive: "Déclin progressif",
    stable: "Stable",
    growth_ai_augmented: "Croissance augmentée par l'IA",
    growth_organic: "Croissance organique",
    growth_rapid: "Croissance rapide",
  };
  return map[trend] || trend.replace(/_/g, " ");
}

/** Format number with commas */
export function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** Format SAR salary */
export function fmtSAR(n: number): string {
  return `SAR ${n.toLocaleString("en-US")}`;
}
