/* ------------------------------------------------------------------ */
/* Relocation Calculator — Data & Logic  (V2)                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface OriginCity {
  id: string;
  name_en: string;
  name_ar: string;
  country_en: string;
  country_ar: string;
  currency: string;          // "EUR", "USD", "GBP" …
  currencySymbol: string;    // "€", "$", "£" …
  rateToSar: number;         // 1 local = X SAR
  taxRate: number;            // effective income tax %
  rent_1br: number;          // 1BR apartment (local currency)
  rent_2br: number;          // 2BR apartment
  rent_3br: number;          // 3BR apartment/house
  food: number;              // monthly groceries + household
  transport: number;         // public transit pass
  utilities: number;         // electricity, water, internet
  dining: number;            // eating out (moderate)
  schoolFree: boolean;       // public school free?
  mercerRank: number;        // Mercer CoL rank 2024
}

export interface SaudiCity {
  id: string;
  name_en: string;
  name_ar: string;
  rent_apt_1br: number;      // SAR — 1BR apartment
  rent_apt_2br: number;      // SAR — 2BR apartment
  rent_apt_3br: number;      // SAR — 3BR apartment
  rent_compound_2br: number; // SAR — 2BR compound villa
  rent_compound_3br: number; // SAR — 3BR compound villa
  food: number;              // SAR — groceries + household
  car: number;               // SAR — car lease/fuel/insurance avg
  utilities: number;         // SAR — electricity, water, internet
  dining: number;            // SAR — eating out (moderate)
  mercerRank: number;
  desc_en: string;
  desc_ar: string;
}

export type HousingType = "apartment" | "compound";

export interface SchoolTier {
  id: string;
  label_en: string;
  label_ar: string;
  monthly_sar: number;       // per child, monthly
}

export interface RelocationResult {
  /* Income */
  gross_local: number;
  tax_local: number;
  net_local: number;
  gross_sar: number;        // equivalent SAR (salary * rateToSar)
  net_sar: number;          // = gross_sar (0% tax)

  /* Costs (local currency for origin, SAR for saudi) */
  origin_costs: CostBreakdown;
  saudi_costs: CostBreakdown & { school: number; dep_fee: number };

  /* Totals */
  origin_total_local: number;
  saudi_total_sar: number;

  /* Savings */
  origin_savings_local: number;
  saudi_savings_sar: number;

  /* Key metrics */
  tax_savings_sar: number;
  tax_savings_local: number;
  rent_diff_pct: number;       // +/- % vs origin (in SAR terms)
  school_cost_sar: number;     // total schooling cost

  /* EOSB */
  eosb_5yr_sar: number;

  /* Mercer */
  origin_mercer: number;
  saudi_mercer: number;
}

export interface CostBreakdown {
  rent: number;
  food: number;
  transport: number;
  utilities: number;
  dining: number;
}

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */

export const SAR_TO_USD = 0.2667;
export const USD_TO_SAR = 3.75;

/* Dependent / iqama processing fee per dependent (SAR/month amortised) */
export const DEPENDENT_FEE_SAR = 400; // 4,800/yr per dep

/* ------------------------------------------------------------------ */
/* School tiers                                                         */
/* ------------------------------------------------------------------ */

export const SCHOOL_TIERS: SchoolTier[] = [
  { id: "public",  label_en: "Public / Arabic",         label_ar: "حكومي / عربي",             monthly_sar: 0 },
  { id: "budget",  label_en: "Budget International",    label_ar: "دولي اقتصادي",             monthly_sar: 2500 },
  { id: "midtier", label_en: "Mid-tier (US/UK curr.)",  label_ar: "متوسط (منهج أمريكي/بريطاني)", monthly_sar: 5400 },
  { id: "premium", label_en: "Premium (IB/top tier)",   label_ar: "مميز (IB/بكالوريا دولية)",  monthly_sar: 8500 },
];

/* ------------------------------------------------------------------ */
/* Origin Cities (15)                                                   */
/* ------------------------------------------------------------------ */

export const ORIGIN_CITIES: OriginCity[] = [
  {
    id: "paris",
    name_en: "Paris", name_ar: "باريس",
    country_en: "France", country_ar: "فرنسا",
    currency: "EUR", currencySymbol: "€", rateToSar: 4.10,
    taxRate: 35,
    rent_1br: 1400, rent_2br: 2200, rent_3br: 3200,
    food: 550, transport: 80, utilities: 180, dining: 200,
    schoolFree: true, mercerRank: 29,
  },
  {
    id: "new-york",
    name_en: "New York", name_ar: "نيويورك",
    country_en: "USA", country_ar: "أمريكا",
    currency: "USD", currencySymbol: "$", rateToSar: 3.75,
    taxRate: 37,
    rent_1br: 3200, rent_2br: 4500, rent_3br: 5800,
    food: 650, transport: 130, utilities: 200, dining: 300,
    schoolFree: true, mercerRank: 7,
  },
  {
    id: "san-francisco",
    name_en: "San Francisco", name_ar: "سان فرانسيسكو",
    country_en: "USA", country_ar: "أمريكا",
    currency: "USD", currencySymbol: "$", rateToSar: 3.75,
    taxRate: 40,
    rent_1br: 2900, rent_2br: 4200, rent_3br: 5400,
    food: 620, transport: 110, utilities: 180, dining: 280,
    schoolFree: true, mercerRank: 16,
  },
  {
    id: "london",
    name_en: "London", name_ar: "لندن",
    country_en: "UK", country_ar: "بريطانيا",
    currency: "GBP", currencySymbol: "£", rateToSar: 4.80,
    taxRate: 33,
    rent_1br: 2000, rent_2br: 2800, rent_3br: 3800,
    food: 400, transport: 160, utilities: 200, dining: 180,
    schoolFree: true, mercerRank: 17,
  },
  {
    id: "dubai",
    name_en: "Dubai", name_ar: "دبي",
    country_en: "UAE", country_ar: "الإمارات",
    currency: "AED", currencySymbol: "د.إ", rateToSar: 1.02,
    taxRate: 0,
    rent_1br: 6500, rent_2br: 10000, rent_3br: 15000,
    food: 1800, transport: 500, utilities: 700, dining: 600,
    schoolFree: false, mercerRank: 18,
  },
  {
    id: "cairo",
    name_en: "Cairo", name_ar: "القاهرة",
    country_en: "Egypt", country_ar: "مصر",
    currency: "EGP", currencySymbol: "ج.م", rateToSar: 0.076,
    taxRate: 22.5,
    rent_1br: 12000, rent_2br: 18000, rent_3br: 25000,
    food: 6000, transport: 1500, utilities: 1800, dining: 3000,
    schoolFree: true, mercerRank: 139,
  },
  {
    id: "amman",
    name_en: "Amman", name_ar: "عمّان",
    country_en: "Jordan", country_ar: "الأردن",
    currency: "JOD", currencySymbol: "د.أ", rateToSar: 5.29,
    taxRate: 20,
    rent_1br: 300, rent_2br: 450, rent_3br: 650,
    food: 180, transport: 40, utilities: 80, dining: 80,
    schoolFree: true, mercerRank: 120,
  },
  {
    id: "beirut",
    name_en: "Beirut", name_ar: "بيروت",
    country_en: "Lebanon", country_ar: "لبنان",
    currency: "USD", currencySymbol: "$", rateToSar: 3.75,
    taxRate: 25,
    rent_1br: 500, rent_2br: 700, rent_3br: 1000,
    food: 250, transport: 60, utilities: 80, dining: 120,
    schoolFree: false, mercerRank: 130,
  },
  {
    id: "mumbai",
    name_en: "Mumbai", name_ar: "مومباي",
    country_en: "India", country_ar: "الهند",
    currency: "INR", currencySymbol: "₹", rateToSar: 0.045,
    taxRate: 30,
    rent_1br: 40000, rent_2br: 65000, rent_3br: 100000,
    food: 12000, transport: 3000, utilities: 4000, dining: 6000,
    schoolFree: true, mercerRank: 136,
  },
  {
    id: "manila",
    name_en: "Manila", name_ar: "مانيلا",
    country_en: "Philippines", country_ar: "الفلبين",
    currency: "PHP", currencySymbol: "₱", rateToSar: 0.066,
    taxRate: 25,
    rent_1br: 20000, rent_2br: 35000, rent_3br: 50000,
    food: 12000, transport: 3000, utilities: 5000, dining: 5000,
    schoolFree: true, mercerRank: 109,
  },
  {
    id: "toronto",
    name_en: "Toronto", name_ar: "تورنتو",
    country_en: "Canada", country_ar: "كندا",
    currency: "CAD", currencySymbol: "C$", rateToSar: 2.70,
    taxRate: 33,
    rent_1br: 2200, rent_2br: 2900, rent_3br: 3800,
    food: 450, transport: 160, utilities: 170, dining: 200,
    schoolFree: true, mercerRank: 89,
  },
  {
    id: "islamabad",
    name_en: "Islamabad", name_ar: "إسلام آباد",
    country_en: "Pakistan", country_ar: "باكستان",
    currency: "PKR", currencySymbol: "Rs", rateToSar: 0.013,
    taxRate: 20,
    rent_1br: 60000, rent_2br: 90000, rent_3br: 130000,
    food: 30000, transport: 8000, utilities: 10000, dining: 12000,
    schoolFree: true, mercerRank: 190,
  },
  {
    id: "sydney",
    name_en: "Sydney", name_ar: "سيدني",
    country_en: "Australia", country_ar: "أستراليا",
    currency: "AUD", currencySymbol: "A$", rateToSar: 2.42,
    taxRate: 32.5,
    rent_1br: 2800, rent_2br: 3800, rent_3br: 5200,
    food: 500, transport: 217, utilities: 294, dining: 250,
    schoolFree: true, mercerRank: 58,
  },
  {
    id: "casablanca",
    name_en: "Casablanca", name_ar: "الدار البيضاء",
    country_en: "Morocco", country_ar: "المغرب",
    currency: "MAD", currencySymbol: "د.م", rateToSar: 0.38,
    taxRate: 30,
    rent_1br: 5000, rent_2br: 7500, rent_3br: 12000,
    food: 2500, transport: 250, utilities: 600, dining: 800,
    schoolFree: true, mercerRank: 128,
  },
  {
    id: "tunis",
    name_en: "Tunis", name_ar: "تونس",
    country_en: "Tunisia", country_ar: "تونس",
    currency: "TND", currencySymbol: "د.ت", rateToSar: 1.20,
    taxRate: 26,
    rent_1br: 900, rent_2br: 1300, rent_3br: 1800,
    food: 400, transport: 48, utilities: 175, dining: 120,
    schoolFree: true, mercerRank: 170,
  },
];

/* ------------------------------------------------------------------ */
/* Saudi Cities (5)                                                     */
/* ------------------------------------------------------------------ */

export const SAUDI_CITIES: SaudiCity[] = [
  {
    id: "riyadh",
    name_en: "Riyadh", name_ar: "الرياض",
    rent_apt_1br: 3000, rent_apt_2br: 5000, rent_apt_3br: 7500,
    rent_compound_2br: 12000, rent_compound_3br: 18000,
    food: 2200, car: 800, utilities: 500, dining: 500,
    mercerRank: 90,
    desc_en: "Capital — tech & finance hub, NEOM nearby, largest expat community",
    desc_ar: "العاصمة — مركز التقنية والمال، قرب نيوم، أكبر مجتمع وافدين",
  },
  {
    id: "jeddah",
    name_en: "Jeddah", name_ar: "جدة",
    rent_apt_1br: 2500, rent_apt_2br: 4200, rent_apt_3br: 6500,
    rent_compound_2br: 10000, rent_compound_3br: 15000,
    food: 2000, car: 750, utilities: 550, dining: 450,
    mercerRank: 100,
    desc_en: "Red Sea gateway — commercial port, AMAALA & The Red Sea projects",
    desc_ar: "بوابة البحر الأحمر — ميناء تجاري، مشاريع أمالا والبحر الأحمر",
  },
  {
    id: "dammam",
    name_en: "Dammam / Eastern Province", name_ar: "الدمام / المنطقة الشرقية",
    rent_apt_1br: 2000, rent_apt_2br: 3500, rent_apt_3br: 5500,
    rent_compound_2br: 8000, rent_compound_3br: 13000,
    food: 1800, car: 700, utilities: 450, dining: 400,
    mercerRank: 115,
    desc_en: "Oil & gas hub — Aramco HQ, industrial city, lowest cost of living",
    desc_ar: "مركز النفط والغاز — مقر أرامكو، مدينة صناعية، أقل تكلفة معيشة",
  },
  {
    id: "makkah",
    name_en: "Makkah", name_ar: "مكة المكرمة",
    rent_apt_1br: 2500, rent_apt_2br: 4000, rent_apt_3br: 6000,
    rent_compound_2br: 7000, rent_compound_3br: 10000,
    food: 1700, car: 700, utilities: 480, dining: 400,
    mercerRank: 115,
    desc_en: "Holy city — religious tourism hub, Hajj & Umrah economy, growing tech sector",
    desc_ar: "المدينة المقدسة — مركز السياحة الدينية، اقتصاد الحج والعمرة، قطاع تقني متنامي",
  },
  {
    id: "madinah",
    name_en: "Madinah", name_ar: "المدينة المنورة",
    rent_apt_1br: 2000, rent_apt_2br: 3200, rent_apt_3br: 5000,
    rent_compound_2br: 6000, rent_compound_3br: 8500,
    food: 1600, car: 650, utilities: 450, dining: 380,
    mercerRank: 120,
    desc_en: "Holy city — knowledge economy, Islamic university hub, growing service sector",
    desc_ar: "المدينة المقدسة — اقتصاد المعرفة، مركز الجامعات الإسلامية، قطاع خدمات متنامي",
  },
];

/* ------------------------------------------------------------------ */
/* Salary presets                                                       */
/* ------------------------------------------------------------------ */

export const SALARY_PRESETS = [
  { label_en: "Entry Level",  label_ar: "مبتدئ",       sar: 6000 },
  { label_en: "Junior",       label_ar: "مبتدئ متقدم", sar: 10000 },
  { label_en: "Mid-Level",    label_ar: "متوسط",       sar: 18000 },
  { label_en: "Senior",       label_ar: "أقدم",        sar: 30000 },
  { label_en: "Manager",      label_ar: "مدير",        sar: 45000 },
  { label_en: "Executive",    label_ar: "تنفيذي",      sar: 70000 },
];

/* ------------------------------------------------------------------ */
/* Calculator                                                           */
/* ------------------------------------------------------------------ */

export function getRent(
  origin: OriginCity,
  adults: number,
  children: number
): number {
  const people = adults + children;
  if (people <= 1) return origin.rent_1br;
  if (people <= 3) return origin.rent_2br;
  return origin.rent_3br;
}

export function getSaudiRent(
  city: SaudiCity,
  housing: HousingType,
  adults: number,
  children: number
): number {
  const people = adults + children;
  if (housing === "compound") {
    return people <= 3 ? city.rent_compound_2br : city.rent_compound_3br;
  }
  if (people <= 1) return city.rent_apt_1br;
  if (people <= 3) return city.rent_apt_2br;
  return city.rent_apt_3br;
}

export function calculateRelocation(params: {
  origin: OriginCity;
  saudi: SaudiCity;
  salaryLocal: number;
  adults: number;
  children: number;
  housing: HousingType;
  schoolTier: SchoolTier;
}): RelocationResult {
  const { origin, saudi, salaryLocal, adults, children, housing, schoolTier } = params;

  /* ---- Origin side (local currency) ---- */
  const taxLocal = salaryLocal * (origin.taxRate / 100);
  const netLocal = salaryLocal - taxLocal;

  const originRent = getRent(origin, adults, children);
  const originFood = origin.food * Math.max(1, (adults + children * 0.5) / 2);
  const originCosts: CostBreakdown = {
    rent: Math.round(originRent),
    food: Math.round(originFood),
    transport: origin.transport,
    utilities: origin.utilities,
    dining: origin.dining,
  };
  const originTotal = originCosts.rent + originCosts.food + originCosts.transport + originCosts.utilities + originCosts.dining;
  const originSavings = netLocal - originTotal;

  /* ---- Saudi side (SAR) ---- */
  const grossSar = Math.round(salaryLocal * origin.rateToSar);
  const netSar = grossSar; // 0% tax

  const saudiRent = getSaudiRent(saudi, housing, adults, children);
  const saudiFood = Math.round(saudi.food * Math.max(1, (adults + children * 0.5) / 2));
  const schoolMonthly = schoolTier.monthly_sar * children;
  const depFee = DEPENDENT_FEE_SAR * (adults - 1 + children); // fees for dependents (excl. main worker)

  const saudiCosts = {
    rent: saudiRent,
    food: saudiFood,
    transport: saudi.car,
    utilities: saudi.utilities,
    dining: saudi.dining,
    school: schoolMonthly,
    dep_fee: depFee,
  };
  const saudiTotal = saudiCosts.rent + saudiCosts.food + saudiCosts.transport +
    saudiCosts.utilities + saudiCosts.dining + saudiCosts.school + saudiCosts.dep_fee;
  const saudiSavings = netSar - saudiTotal;

  /* ---- Tax savings ---- */
  const taxSavingsSar = Math.round(taxLocal * origin.rateToSar);

  /* ---- Rent comparison ---- */
  const originRentSar = originRent * origin.rateToSar;
  const rentDiff = originRentSar > 0
    ? Math.round(((saudiRent - originRentSar) / originRentSar) * 100)
    : 0;

  /* ---- EOSB (end-of-service benefit) ---- */
  // First 5 years: 15 days salary per year; after: 30 days
  const dailySar = grossSar / 30;
  const eosb5yr = Math.round(dailySar * 15 * 5);

  return {
    gross_local: salaryLocal,
    tax_local: Math.round(taxLocal),
    net_local: Math.round(netLocal),
    gross_sar: grossSar,
    net_sar: netSar,

    origin_costs: originCosts,
    saudi_costs: saudiCosts,

    origin_total_local: Math.round(originTotal),
    saudi_total_sar: Math.round(saudiTotal),

    origin_savings_local: Math.round(originSavings),
    saudi_savings_sar: Math.round(saudiSavings),

    tax_savings_sar: taxSavingsSar,
    tax_savings_local: Math.round(taxLocal),

    rent_diff_pct: rentDiff,
    school_cost_sar: schoolMonthly,

    eosb_5yr_sar: eosb5yr,

    origin_mercer: origin.mercerRank,
    saudi_mercer: saudi.mercerRank,
  };
}
