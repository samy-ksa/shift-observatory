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
  occupationsUp: string;
  occupationsStable: string;
  occupationsDown: string;
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
  downloadBtn: string;
  error: string;
  privacy: string;
}

export interface PopupStrings {
  title: string;
  body: string;
  button: string;
  footer: string;
  success: string;
  downloadBtn: string;
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

export interface FindJobStrings {
  tabLabel: string;
  requirements: string;
  degree: string;
  certifications: string;
  certBody: string;
  certTimeline: string;
  skills: string;
  edge: string;
  gccAdvantage: string;
  market: string;
  demandHigh: string;
  demandGrowing: string;
  demandStable: string;
  demandDeclining: string;
  topDemand: string;
  salaryPackage: string;
  packageNote: string;
  visa: string;
  visaReserved: string;
  visaReservedNote: string;
  visaOpen: string;
  visaOpenSteps: string[];
  visaTimeline: string;
  employers: string;
  jobBoards: string;
  employees: string;
}

export interface JobPageStrings {
  backToDashboard: string;
  breadcrumbJobs: string;
  tabs: {
    aiRisk: string;
    salary: string;
    nitaqat: string;
    reskilling: string;
    findJob: string;
  };
  score: string;
  outOf: string;
  category: string;
  substitution: string;
  augmentation: string;
  wefTrend: string;
  workforce: string;
  saudiPct: string;
  sector: string;
  aiRiskAnalysis: string;
  automationProb: string;
  gptExposure: string;
  feltenScore: string;
  verdictVeryHigh: string;
  verdictHigh: string;
  verdictModerate: string;
  verdictLow: string;
  salaryRange: string;
  entry: string;
  median: string;
  senior: string;
  perMonth: string;
  salarySource: string;
  nitaqatStatus: string;
  reservedSaudiOnly: string;
  sectorQuota: string;
  openToExpats: string;
  reservedWarning: string;
  relevantTawteen: string;
  noTawteen: string;
  quota: string;
  effective: string;
  phase: string;
  reskillingTitle: string;
  hrdfPrograms: string;
  programType: string;
  programRelevance: string;
  noPrograms: string;
  shareTitle: string;
  shareText: string;
  copyLink: string;
  copied: string;
  relatedTitle: string;
  compareCta: string;
  viewFullAnalysis: string;
  notFound: string;
  notFoundSub: string;
  scoreEvolution: string;
  riskIncreasing: string;
  riskDecreasing: string;
  riskStable: string;
  pointsSince: string;
  nextUpdate: string;
  vsQuarter: string;
}

export interface ExploreStrings {
  title: string;
  searchPlaceholder: string;
  popular: string;
  showAll: string;
  showLess: string;
  noResults: string;
  clearSearch: string;
  filterAll: string;
  filterHighRisk: string;
  filterModerate: string;
  filterLowRisk: string;
  filterReserved: string;
  workers: string;
}

export interface JobsDropdownStrings {
  nav: string;
  searchPlaceholder: string;
  browseAll: string;
  filterAll: string;
  filterHigh: string;
  filterModerate: string;
  filterLow: string;
  noResults: string;
}

export interface MatchStrings {
  matchNotFound: string;
  matchClosest: string;
  matchDirect: string;
  matchRelated: string;
  matchFuzzy: string;
  matchConfidence: string;
}

export interface PrepareStrings {
  title: string;
  subtitle: string;
  navLabel: string;
  countryLabel: string;
  sectorLabel: string;
  generate: string;
  progress: string;
  itemsOf: string;
  completed: string;
  critical: string;
  important: string;
  recommended: string;
  downloadChecklist: string;
  downloadDesc: string;
  timeline6_12: string;
  timeline3_6: string;
  timeline1_3: string;
  timeline1mo: string;
  timelineArrival: string;
  timelineFirstMonth: string;
}

export interface RelocateStrings {
  title: string;
  subtitle: string;
  navLabel: string;
  /* Form */
  currentSituation: string;
  iLiveIn: string;
  monthlySalary: string;
  myOccupation: string;
  selectOccupation: string;
  noMatch: string;
  browseAll: string;
  matchedTo: string;
  customJob: string;
  family: string;
  adults: string;
  children: string;
  saudiOptions: string;
  targetCity: string;
  housing: string;
  housingApt: string;
  housingCompound: string;
  schoolTier: string;
  calculate: string;
  /* Tabs */
  tabOverview: string;
  tabGroceries: string;
  tabDining: string;
  tabSubscriptions: string;
  tabTech: string;
  tabTransport: string;
  tabHousing: string;
  tabUtilities: string;
  tabEducation: string;
  tabLifestyle: string;
  tabKsaFees: string;
  /* Results */
  results: string;
  gross: string;
  tax: string;
  net: string;
  monthlyCosts: string;
  rent: string;
  food: string;
  transport: string;
  utilities: string;
  dining: string;
  school: string;
  depFee: string;
  total: string;
  savings: string;
  /* Table headers */
  thItem: string;
  thOriginPrice: string;
  thSaudiPrice: string;
  thInSar: string;
  thDiff: string;
  cheaper: string;
  pricier: string;
  /* Key insights */
  keyInsights: string;
  taxSavings: string;
  taxSaved: string;
  rentLabel: string;
  moreExpensive: string;
  lessExpensive: string;
  schooling: string;
  freeInOrigin: string;
  mercer: string;
  mercerCheaper: string;
  mercerPricier: string;
  eosb: string;
  eosbAfter5yr: string;
  aiRisk: string;
  considerTransition: string;
  netVerdict: string;
  verdictNeed: string;
  verdictSavings: string;
  negotiate: string;
  tipNoChildren: string;
  tipWithChildren: string;
  tipHighTax: string;
  tipEmergingMarket: string;
  /* Chart */
  comparisonChart: string;
  /* Radar */
  radarTitle: string;
  radarHousing: string;
  radarFood: string;
  radarTransport: string;
  radarUtilities: string;
  radarDining: string;
  radarEducation: string;
  radarHealthcare: string;
  radarLifestyle: string;
  /* Price Pulse */
  pricePulse: string;
  pricePulseDate: string;
  ppItem: string;
  ppPrice: string;
  ppTrend: string;
  ppChange: string;
  /* Education */
  schoolsInCity: string;
  annualFee: string;
  curriculum: string;
  /* Share */
  shareLinkedIn: string;
  downloadPdf: string;
  shareText: string;
  /* Actions */
  back: string;
  tryAnother: string;
  disclaimer: string;
  perMonth: string;
  perYear: string;
  taxFree: string;
  shiftDataShows: string;
  salaryRange: string;
  median: string;
  vsCity: string;
  /* Tooltips */
  tooltipEosb: string;
  tooltipMercer: string;
  tooltipSar: string;
  tooltipNitaqat: string;
  tooltipIqama: string;
  tooltipGosi: string;
  tooltipDepFee: string;
  tooltipVat: string;
  tooltipCompound: string;
  /* Price Pulse context */
  pricePulseSubtitle: string;
  pricePulseVs: string;
  ppCity: string;
  ppOriginPrice: string;
  /* Exchange rate */
  exchangeRate: string;
  exchangeRateUpdated: string;
  exchangeRateNote: string;
  exchangeRatePeg: string;
  /* Dual currency */
  approx: string;
  equivalent: string;
  /* Single income */
  incomeMode: string;
  bothWork: string;
  oneWorksKsa: string;
  partnerSalary: string;
  singleIncomeAlert: string;
  singleIncomeWarning: string;
  incomeReduction: string;
  toCompensate: string;
  tipHousingCover: string;
  tipEducationAllow: string;
  tipFlights: string;
  tipSpousalSupport: string;
  /* Savings explainer */
  youSave: string;
  youSpend: string;
  taxOffset: string;
  netPosition: string;
  almostBreakeven: string;
  /* Net verdict hero */
  minimumSalary: string;
  recommendedSalary: string;
  withSavingsBuffer: string;
  yourTaxSavings: string;
  moneyYouKeep: string;
  eosbAfterLabel: string;
  taxFreeSeverance: string;
  /* Negotiation checklist */
  packageChecklist: string;
  checkBaseSalary: string;
  checkHousing: string;
  checkHousingGap: string;
  checkEducation: string;
  checkEducationGap: string;
  checkFlights: string;
  checkTransport: string;
  checkMedical: string;
  checkLeave: string;
  proTip: string;
  /* Radar summary */
  radarSummary: string;
  radarCheaperBy: string;
  radarPricierBy: string;
  /* Info boxes */
  howItWorks: string;
  howItWorksText: string;
  compoundInfo: string;
  schoolTierInfo: string;
  /* Tab item counts */
  items: string;
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
  popup: PopupStrings;
  common: CommonStrings;
  footer: FooterStrings;
  profile: ProfileStrings;
  career: CareerStrings;
  treemap: TreemapStrings;
  jobPage: JobPageStrings;
  explore: ExploreStrings;
  jobsDropdown: JobsDropdownStrings;
  findJob: FindJobStrings;
  relocate: RelocateStrings;
  match: MatchStrings;
  prepare: PrepareStrings;
}
