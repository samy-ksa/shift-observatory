import { scoreToCategory } from "@/lib/utils";
import { JOB_TIERS, type JobTier } from "@/lib/career/tiers";
import type { Occupation } from "@/lib/data-types";

/** Interpolate a color from green → amber → red based on composite score 0-100 */
export function exposureColor(composite: number): string {
  const t = Math.max(0, Math.min(100, composite)) / 100;
  if (t <= 0.5) {
    const p = t / 0.5;
    return lerpColor("#10B981", "#FBBF24", p);
  }
  const p = (t - 0.5) / 0.5;
  return lerpColor("#FBBF24", "#EF4444", p);
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export type WorkforceFilter = "all" | "saudi" | "expat";

export interface TreemapOccupation {
  name_en: string;
  name_ar: string;
  composite: number;
  category: string;
  employment: number;
  salary_median_sar: number;
  salary_entry_sar: number;
  salary_senior_sar: number;
  sector_id: string;
  saudi_pct: number;
  tier: JobTier;
  wef_trend?: string;
  nitaqat_status?: string;
}

/** Sector labels for hierarchical grouping */
export const SECTOR_LABELS_EN: Record<string, string> = {
  agriculture: "Agriculture",
  mining_oil_gas: "Mining & Oil/Gas",
  manufacturing: "Manufacturing",
  electricity_gas: "Electricity & Gas",
  water_waste: "Water & Waste",
  construction: "Construction",
  wholesale_retail: "Wholesale & Retail",
  transport_storage: "Transport & Storage",
  accommodation_food: "Accommodation & Food",
  ict: "ICT",
  finance_insurance: "Finance & Insurance",
  real_estate: "Real Estate",
  professional_scientific: "Professional & Scientific",
  admin_support: "Admin & Support",
  public_admin: "Public Admin",
  education: "Education",
  health: "Health & Social",
  arts_entertainment: "Arts & Entertainment",
  other_services: "Other Services",
  households_extraterritorial: "Households",
};

export const SECTOR_LABELS_AR: Record<string, string> = {
  agriculture: "الزراعة",
  mining_oil_gas: "التعدين والنفط",
  manufacturing: "التصنيع",
  electricity_gas: "الكهرباء والغاز",
  water_waste: "المياه والنفايات",
  construction: "البناء والتشييد",
  wholesale_retail: "التجارة",
  transport_storage: "النقل والتخزين",
  accommodation_food: "الضيافة والطعام",
  ict: "تقنية المعلومات",
  finance_insurance: "المالية والتأمين",
  real_estate: "العقارات",
  professional_scientific: "الخدمات المهنية",
  admin_support: "الدعم الإداري",
  public_admin: "الإدارة العامة",
  education: "التعليم",
  health: "الصحة",
  arts_entertainment: "الفنون والترفيه",
  other_services: "خدمات أخرى",
  households_extraterritorial: "الأسر",
};

/** Minimum employment to show as individual rect (below = grouped into sector "Other") */
const MIN_EMPLOYMENT_THRESHOLD = 15000;

export interface SectorGroup {
  sector_id: string;
  sector_name_en: string;
  sector_name_ar: string;
  totalEmployment: number;
  avgComposite: number;
  occupations: TreemapOccupation[];
}

/** Convert raw occupations to treemap data with sector grouping */
export function prepareTreemapData(
  highRisk: Occupation[],
  lowRisk: Occupation[],
  filter: WorkforceFilter
): TreemapOccupation[] {
  const all = [...highRisk, ...lowRisk];
  const mapped = all
    .filter((o) => o.employment_est && o.employment_est > 0)
    .map((o) => {
      const baseEmp = o.employment_est || 0;
      const saudiPct = (o.employment_saudi_pct || 0) / 100;
      let employment = baseEmp;
      if (filter === "saudi") employment = Math.round(baseEmp * saudiPct);
      if (filter === "expat") employment = Math.round(baseEmp * (1 - saudiPct));
      return {
        name_en: o.name_en,
        name_ar: o.name_ar,
        composite: o.composite,
        category: o.category,
        employment,
        salary_median_sar: o.salary_median_sar || 0,
        salary_entry_sar: o.salary_entry_sar || 0,
        salary_senior_sar: o.salary_senior_sar || 0,
        sector_id: o.sector_id || "",
        saudi_pct: o.employment_saudi_pct || 0,
        tier: JOB_TIERS[o.name_en] || 3,
        wef_trend: o.wef_trend,
        nitaqat_status: o.nitaqat_status,
      };
    })
    .filter((o) => o.employment > 0);

  // Group small occupations per sector into "Other in [sector]"
  const visible: TreemapOccupation[] = [];
  const smallBySector: Record<string, TreemapOccupation[]> = {};

  mapped.forEach((o) => {
    if (o.employment >= MIN_EMPLOYMENT_THRESHOLD) {
      visible.push(o);
    } else {
      if (!smallBySector[o.sector_id]) smallBySector[o.sector_id] = [];
      smallBySector[o.sector_id].push(o);
    }
  });

  // Create grouped "Other" per sector
  Object.entries(smallBySector).forEach(([sectorId, occs]) => {
    const totalEmp = occs.reduce((s, d) => s + d.employment, 0);
    const avgComp = totalEmp > 0
      ? occs.reduce((s, d) => s + d.composite * d.employment, 0) / totalEmp
      : 50;
    const sectorName = SECTOR_LABELS_EN[sectorId] || sectorId;
    const sectorNameAr = SECTOR_LABELS_AR[sectorId] || sectorId;
    visible.push({
      name_en: `Other ${sectorName} (${occs.length})`,
      name_ar: `أخرى ${sectorNameAr} (${occs.length})`,
      composite: Math.round(avgComp),
      category: "mixed",
      employment: totalEmp,
      salary_median_sar: 0,
      salary_entry_sar: 0,
      salary_senior_sar: 0,
      sector_id: sectorId,
      saudi_pct: 0,
      tier: 3 as JobTier,
      wef_trend: undefined,
      nitaqat_status: undefined,
    });
  });

  return visible;
}

/** Prepare hierarchical data for sector-grouped treemap */
export function prepareSectorHierarchy(
  highRisk: Occupation[],
  lowRisk: Occupation[],
  filter: WorkforceFilter
): SectorGroup[] {
  const flat = prepareTreemapData(highRisk, lowRisk, filter);
  const sectorMap: Record<string, TreemapOccupation[]> = {};

  flat.forEach((o) => {
    const sid = o.sector_id || "other_services";
    if (!sectorMap[sid]) sectorMap[sid] = [];
    sectorMap[sid].push(o);
  });

  return Object.entries(sectorMap)
    .map(([sector_id, occupations]) => {
      const totalEmployment = occupations.reduce((s, o) => s + o.employment, 0);
      const avgComposite = totalEmployment > 0
        ? occupations.reduce((s, o) => s + o.composite * o.employment, 0) / totalEmployment
        : 50;
      return {
        sector_id,
        sector_name_en: SECTOR_LABELS_EN[sector_id] || sector_id,
        sector_name_ar: SECTOR_LABELS_AR[sector_id] || sector_id,
        totalEmployment,
        avgComposite,
        occupations: occupations.sort((a, b) => b.employment - a.employment),
      };
    })
    .filter((s) => s.totalEmployment > 0)
    .sort((a, b) => b.totalEmployment - a.totalEmployment);
}

/** Cube root scaling for much better visual distribution.
 *  Compresses 2.25M vs 450 gap from 5000x to ~170x. */
export function sqrtScale(employment: number): number {
  return Math.pow(employment, 0.4);
}

/** Compute sidebar KPIs from prepared data */
export function computeKPIs(data: TreemapOccupation[]) {
  const totalWorkforce = data.reduce((s, d) => s + d.employment, 0);
  const weightedExposure =
    totalWorkforce > 0
      ? data.reduce((s, d) => s + d.employment * d.composite, 0) / totalWorkforce
      : 0;

  // Jobs by exposure tier
  const tiers: Record<string, number> = { very_low: 0, low: 0, moderate: 0, high: 0, very_high: 0 };
  data.forEach((d) => {
    const cat = scoreToCategory(d.composite);
    tiers[cat] = (tiers[cat] || 0) + d.employment;
  });

  // Exposure by pay band (avg composite per band)
  const payBands = [
    { label: "<5K", min: 0, max: 5000, totalComp: 0, totalEmp: 0 },
    { label: "5-10K", min: 5000, max: 10000, totalComp: 0, totalEmp: 0 },
    { label: "10-15K", min: 10000, max: 15000, totalComp: 0, totalEmp: 0 },
    { label: "15-25K", min: 15000, max: 25000, totalComp: 0, totalEmp: 0 },
    { label: "25K+", min: 25000, max: Infinity, totalComp: 0, totalEmp: 0 },
  ];
  data.forEach((d) => {
    const band = payBands.find((b) => d.salary_median_sar >= b.min && d.salary_median_sar < b.max);
    if (band) {
      band.totalComp += d.composite * d.employment;
      band.totalEmp += d.employment;
    }
  });
  const payBandExposure = payBands.map((b) => ({
    label: b.label,
    avgExposure: b.totalEmp > 0 ? b.totalComp / b.totalEmp : 0,
    workers: b.totalEmp,
  }));

  // Exposure by education tier
  const eduTiers: { tier: number; totalComp: number; totalEmp: number }[] = [1, 2, 3, 4, 5].map(
    (t) => ({ tier: t, totalComp: 0, totalEmp: 0 })
  );
  data.forEach((d) => {
    const et = eduTiers.find((e) => e.tier === d.tier);
    if (et) {
      et.totalComp += d.composite * d.employment;
      et.totalEmp += d.employment;
    }
  });
  const eduExposure = eduTiers.map((e) => ({
    tier: e.tier,
    avgExposure: e.totalEmp > 0 ? e.totalComp / e.totalEmp : 0,
    workers: e.totalEmp,
  }));

  // Wages exposed (total monthly SAR for workers with composite > 60)
  const wagesExposed = data
    .filter((d) => d.composite > 60)
    .reduce((s, d) => s + d.employment * d.salary_median_sar, 0);

  return {
    totalWorkforce,
    weightedExposure,
    tiers,
    payBandExposure,
    eduExposure,
    wagesExposed,
  };
}

export const TIER_LABELS_EN: Record<number, string> = {
  1: "No degree",
  2: "Diploma",
  3: "Bachelor's",
  4: "Professional",
  5: "Advanced",
};

export const TIER_LABELS_AR: Record<number, string> = {
  1: "بدون شهادة",
  2: "دبلوم",
  3: "بكالوريوس",
  4: "مهني متخصص",
  5: "دراسات عليا",
};
