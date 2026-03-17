export interface KpiItem {
  label: string;
  tooltip: string;
}

export interface NavStrings {
  riskTool: string;
  map: string;
  sectors: string;
  employers: string;
  layoffs: string;
  pulse: string;
  wef: string;
  v2030: string;
  nitaqat: string;
  about: string;
}

export interface HeroStrings {
  title: string;
  subtitle: string;
  scrollDown: string;
  kpi: {
    gosi: KpiItem;
    saudi: KpiItem;
    unemployment: KpiItem;
    gdp: KpiItem;
    layoffs: KpiItem;
    v2030: KpiItem;
  };
  toggleSaudi: string;
  toggleEveryone: string;
}

export interface SalaryStrings {
  title: string;
  entry: string;
  mid: string;
  senior: string;
  perMonth: string;
  currency: string;
  source: string;
  national: string;
  nationalNonSaudi: string;
  saudiAvg: string;
  nonSaudiAvg: string;
  note: string;
}

export interface NitaqatStrings {
  title: string;
  reserved: string;
  reservedDesc: string;
  sectorQuota: string;
  sectorQuotaDesc: string;
  saudizationPressure: string;
  taweenDecisions: string;
  noDecisions: string;
  quotaPct: string;
}

export interface ReskillingStrings {
  title: string;
  noPrograms: string;
  visitHRDF: string;
  type: string;
  relevance: string;
}

export interface RiskToolStrings {
  title: string;
  subtitle: string;
  placeholder: string;
  notFound: string;
  notFoundSub: string;
  requestBtn: string;
  tabs: {
    aiRisk: string;
    salary: string;
    nitaqat: string;
    reskilling: string;
  };
  expatToggle: string;
  expatWarning: string;
  verdicts: {
    severe: string;
    significant: string;
    moderate: string;
    protected: string;
  };
  groupHighRisk: string;
  groupLowRisk: string;
  nitaqat: NitaqatStrings;
  reskilling: ReskillingStrings;
  demandRank: string;
  occupationsCount: string;
  rankOf: string;
}

export interface MapStrings {
  title: string;
  subtitle: string;
  legend: {
    lower: string;
    higher: string;
    giga: string;
  };
  detail: {
    workers: string;
    workersNote: string;
    saudiShare: string;
    saudiNote: string;
    nonSaudi: string;
    riskScore: string;
    riskNote: string;
    gdpShare: string;
    gdpNote: string;
    sectors: string;
    topSectors: string;
    gigaProjects: string;
    v2030Focus: string;
    gosiSource: string;
  };
}

export interface NitaqatSectionStrings {
  title: string;
  subtitle: string;
  reservedCount: string;
  taweenCount: string;
  sectorsWithParams: string;
  bandsCount: string;
  recentDecisions: string;
  profession: string;
  quota: string;
  effective: string;
  phase: string;
  redWarning: string;
  platinumBenefit: string;
  bandName: string;
  newVisas: string;
  changeOccupations: string;
  renewPermits: string;
  transferIn: string;
  yes: string;
  no: string;
}

export interface SectorStrings {
  title: string;
  subtitle: string;
  tooltip: string;
  pctSaudi: string;
}

export interface EmployerStrings {
  title: string;
  subtitle: string;
  headers: {
    rank: string;
    company: string;
    sector: string;
    employees: string;
    saudisation: string;
    risk: string;
  };
  tadawul: string;
  allSectors: string;
  countLabel: string;
  estimatedNote: string;
}

export interface LayoffStrings {
  title: string;
  subtitle: string;
  tabs: {
    gulf: string;
    international: string;
    all: string;
  };
  confirmed: string;
  probable: string;
  suspected: string;
  jobsLabel: string;
  postHolidayLull: string;
  stats: {
    total: string;
    biggest: string;
    countries: string;
    trend: string;
  };
  kpiLabels: {
    techLayoffs2024: string;
    techLayoffs2025: string;
    aiCited: string;
    peakAi: string;
    techLayoffs2026Ytd: string;
    aiPct2025: string;
  };
  showAll: string;
  showLess: string;
}

export interface WefStrings {
  title: string;
  subtitle: string;
  growing: string;
  declining: string;
  trends: {
    veryRapid: string;
    rapid: string;
  };
}

export interface V2030Strings {
  title: string;
  subtitle: string;
  created: string;
  exposed: string;
  gap: string;
  tabs: {
    sector: string;
    timeline: string;
  };
  note: string;
  createdSubtitle: string;
  exposedSubtitle: string;
  confidence: string;
  gapLabel: string;
}

export interface GigaProjectStrings {
  title: string;
  subtitle: string;
  projectedJobs: string;
  currentWorkforce: string;
  region: string;
  components: string;
}

export interface MethodologyStrings {
  title: string;
  subtitle: string;
  panels: {
    data: string;
    scoring: string;
    limitations: string;
    about: string;
    changelog: string;
  };
}

export interface FooterStrings {
  tagline: string;
  version: string;
}

export interface EmailStrings {
  title: string;
  subtitle: string;
  placeholder: string;
  button: string;
  success: string;
  error: string;
  privacy: string;
}

export interface CommonStrings {
  veryHigh: string;
  high: string;
  moderate: string;
  low: string;
  veryLow: string;
  clickDetails: string;
  source: string;
}

export interface PulseStrings {
  title: string;
  subtitle: string;
  updated: string;
  globalLayoffs: string;
  aiCited: string;
  gulfEvents: string;
  trend: string;
  tabs: {
    global: string;
    gulf: string;
    policy: string;
    signals: string;
  };
  source: string;
  noData: string;
  direct: string;
  contributing: string;
  suspected: string;
  jobs: string;
  estimated: string;
  effectiveDate: string;
  relevanceDirect: string;
  relevanceIndirect: string;
  relevanceContextual: string;
  eventLayoff: string;
  eventAutomation: string;
  eventAiReplacement: string;
  eventRestructuring: string;
  trendUp: string;
  trendDown: string;
  trendStable: string;
}

export interface ProfileStrings {
  title: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  saudi: string;
  expat: string;
  results: string;
  overall: string;
  breakdown: string;
  occupationRisk: string;
  sectorPressure: string;
  regionExposure: string;
  nitaqatImpact: string;
  wefTrend: string;
  findings: string;
  actions: string;
  emailCta: string;
  send: string;
  startOver: string;
  next: string;
  back: string;
  reservedWarning: string;
  navLabel: string;
}

export interface CareerStrings {
  title: string;
  subtitle: string;
  selectOccupation: string;
  yourRisk: string;
  recommendations: string;
  riskReduction: string;
  salaryChange: string;
  skillsOverlap: string;
  demand: string;
  trainingPath: string;
  difficulty: string;
  easy: string;
  moderate: string;
  hard: string;
  emerging: string;
  emergingNote: string;
  sortBest: string;
  sortSalary: string;
  sortRisk: string;
  sortEasy: string;
  sortBy: string;
  noResults: string;
  downloadPdf: string;
  emailCta: string;
  sendPlan: string;
  shareText: string;
  highDemand: string;
  growing: string;
  stable: string;
  pointsLower: string;
  navLabel: string;
  cta: string;
  saudi: string;
  expat: string;
  salary: string;
  score: string;
  category: string;
  nitaqat: string;
  wefTrend: string;
  demandRank: string;
  skillsRequired: string;
}

export interface TreemapStrings {
  title: string;
  subtitle: string;
  totalWorkforce: string;
  avgExposure: string;
  byExposureTier: string;
  byPayBand: string;
  byEducation: string;
  wagesExposed: string;
  workers: string;
  salary: string;
  education: string;
  saudiPct: string;
  lowExposure: string;
  highExposure: string;
  everyone: string;
  saudiOnly: string;
  expatOnly: string;
  mapView: string;
  listView: string;
}

export interface Dictionary {
  nav: NavStrings;
  hero: HeroStrings;
  riskTool: RiskToolStrings;
  salary: SalaryStrings;
  map: MapStrings;
  sectors: SectorStrings;
  employers: EmployerStrings;
  layoffs: LayoffStrings;
  pulse: PulseStrings;
  wef: WefStrings;
  v2030: V2030Strings;
  nitaqatSection: NitaqatSectionStrings;
  gigaProjects: GigaProjectStrings;
  methodology: MethodologyStrings;
  email: EmailStrings;
  common: CommonStrings;
  footer: FooterStrings;
  profile: ProfileStrings;
  career: CareerStrings;
  treemap: TreemapStrings;
}
