import { getAllOccupations, toSlug, type Occupation } from "@/lib/occupations";

export interface MatchResult {
  slug: string;
  occupation: Occupation;
  score: number;
  reason: "direct" | "fuzzy" | "related";
}

// Common job titles → slug mapping (FR, EN, AR)
const JOB_SYNONYMS: Record<string, string> = {
  // French
  comptable: "accountants-auditors",
  infirmier: "registered-nurses",
  "infirmière": "registered-nurses",
  "développeur": "software-developers",
  informaticien: "software-developers",
  chauffeur: "heavy-truck-drivers",
  "chauffeur routier": "heavy-truck-drivers",
  "chauffeur poids lourd": "heavy-truck-drivers",
  routier: "heavy-truck-drivers",
  "médecin": "physicians",
  docteur: "physicians",
  avocat: "lawyers",
  professeur: "teachers",
  enseignant: "teachers",
  "ingénieur": "civil-engineers",
  architecte: "architects",
  pharmacien: "pharmacists",
  dentiste: "dentists",
  "kiné": "physiotherapist",
  "kinésithérapeute": "physiotherapist",
  "sage-femme": "midwives",
  "aide-soignant": "home-health-aide",
  "aide-soignante": "home-health-aide",
  cuisinier: "chefs",
  boulanger: "bakers",
  boucher: "butchers",
  coiffeur: "hairdressers",
  coiffeuse: "hairdressers",
  pompier: "firefighters",
  policier: "police-officers",
  "électricien": "electricians",
  plombier: "plumbers",
  soudeur: "welders",
  "maçon": "construction-workers",
  peintre: "painters",
  menuisier: "carpenters",
  serveur: "waiter-waitress",
  serveuse: "waiter-waitress",
  vendeur: "retail-salespersons",
  vendeuse: "retail-salespersons",
  "secrétaire": "administrative-assistants",
  commercial: "sales-managers",
  "community manager": "social-media-manager",
  graphiste: "graphic-designers",
  webdesigner: "web-developers",
  "rédacteur": "technical-writers",
  journaliste: "journalists",
  photographe: "photographers",
  pilote: "pilots",
  "hôtesse de l'air": "flight-attendant",
  steward: "flight-attendant",
  "agent de sécurité": "security-guards",
  gardien: "security-guards",
  livreur: "delivery-driver",
  coursier: "delivery-driver",
  caissier: "retail-salespersons",
  "caissière": "retail-salespersons",
  "réceptionniste": "receptionists",
  barista: "barista-specialty-coffee",
  "pâtissier": "pastry-chef-patissier",
  "audioprothésiste": "audiologist",
  orthophoniste: "speech-therapists",
  "ergothérapeute": "occupational-therapists",
  "diététicien": "dietitians",
  psychologue: "clinical-psychologist",
  opticien: "opticians",
  radiologue: "medical-imaging-specialist",
  laborantin: "medical-laboratory-technicians",
  ambulancier: "paramedics",
  "ostéopathe": "physiotherapist",
  podologue: "podiatrist",
  grutier: "crane-technician",
  consultant: "management-consultant",
  auditeur: "audit-associate-big-4",
  banquier: "islamic-banking-officer",
  notaire: "real-estate-lawyer",
  "coach sportif": "sports-coach-trainer",
  "guide touristique": "tour-guide",
  concierge: "concierge-luxury",
  nourrice: "nanny-au-pair",
  nounou: "nanny-au-pair",
  "chef de projet": "project-managers",
  rh: "human-resources-specialists",
  drh: "human-resources-specialists",
  "responsable rh": "human-resources-specialists",
  // English
  nurse: "registered-nurses",
  developer: "software-developers",
  coder: "software-developers",
  programmer: "software-developers",
  driver: "heavy-truck-drivers",
  trucker: "heavy-truck-drivers",
  doctor: "physicians",
  surgeon: "surgeons",
  lawyer: "lawyers",
  attorney: "lawyers",
  teacher: "teachers",
  engineer: "civil-engineers",
  accountant: "accountants-auditors",
  auditor: "accountants-auditors",
  pharmacist: "pharmacists",
  dentist: "dentists",
  chef: "chefs",
  cook: "chefs",
  barber: "hairdressers",
  firefighter: "firefighters",
  electrician: "electricians",
  plumber: "plumbers",
  welder: "welders",
  carpenter: "carpenters",
  waiter: "waiter-waitress",
  waitress: "waiter-waitress",
  receptionist: "receptionists",
  secretary: "administrative-assistants",
  nanny: "nanny-au-pair",
  babysitter: "nanny-au-pair",
  cleaner: "cleaner-janitor",
  janitor: "cleaner-janitor",
  guard: "security-guards",
  pilot: "pilots",
  mechanic: "aircraft-mechanic-ame",
  physio: "physiotherapist",
  paramedic: "paramedics",
  midwife: "midwives",
  psychologist: "clinical-psychologist",
  dietitian: "dietitians",
  nutritionist: "dietitians",
  radiographer: "medical-imaging-specialist",
  "data analyst": "data-scientists",
  "data engineer": "data-scientists",
  devops: "devops-engineers",
  sysadmin: "network-administrators",
  "product manager": "project-managers",
  "scrum master": "project-managers",
  // Arabic
  "محاسب": "accountants-auditors",
  "ممرض": "registered-nurses",
  "ممرضة": "registered-nurses",
  "طبيب": "physicians",
  "مهندس": "civil-engineers",
  "محامي": "lawyers",
  "معلم": "teachers",
  "سائق": "heavy-truck-drivers",
  "صيدلي": "pharmacists",
  "طبيب أسنان": "dentists",
};

// Sector keywords for tag-based matching
const SECTOR_TAGS: Record<string, string[]> = {
  mining_oil_gas: ["oil", "gas", "petroleum", "energy", "drilling", "refinery", "pipeline", "rig", "pétrole", "gaz", "forage", "نفط", "غاز"],
  health: ["health", "medical", "clinical", "hospital", "patient", "nurse", "doctor", "therapy", "santé", "médical", "clinique", "hôpital", "صحة", "طبي", "مستشفى"],
  construction: ["construction", "building", "site", "structural", "concrete", "scaffold", "BIM", "MEP", "chantier", "bâtiment", "بناء", "إنشاءات"],
  ict: ["IT", "software", "cyber", "cloud", "data", "digital", "tech", "code", "web", "app", "informatique", "numérique", "تقنية", "برمجة"],
  finance_insurance: ["finance", "banking", "investment", "audit", "tax", "accounting", "risk", "treasury", "banque", "comptabilité", "مالية", "بنك"],
  education: ["education", "teaching", "school", "training", "university", "academic", "enseignement", "école", "تعليم", "مدرسة"],
  accommodation_food: ["hotel", "restaurant", "tourism", "hospitality", "food", "beverage", "event", "chef", "hôtel", "tourisme", "فندق", "سياحة"],
  transport_storage: ["logistics", "transport", "shipping", "freight", "aviation", "airline", "delivery", "fleet", "port", "logistique", "نقل", "طيران"],
  professional_scientific: ["consulting", "strategy", "legal", "research", "advisory", "conseil", "juridique", "استشارات", "قانون"],
  arts_entertainment: ["sports", "entertainment", "media", "event", "fitness", "creative", "sport", "رياضة", "ترفيه"],
  wholesale_retail: ["retail", "sales", "store", "shop", "commerce", "merchandise", "vente", "magasin", "تجزئة", "مبيعات"],
  other_services: ["domestic", "personal", "service", "care", "private", "household", "services", "خدمات"],
  admin_support: ["admin", "office", "clerical", "data entry", "support", "administratif", "bureau", "إداري", "مكتب"],
};

function fuzzyScore(query: string, target: string): number {
  if (!target) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t === q) return 100;
  if (t.includes(q) || q.includes(t)) return 85;

  const qWords = q.split(/[\s\-/&,]+/).filter(Boolean);
  const tWords = t.split(/[\s\-/&,]+/).filter(Boolean);
  let matches = 0;
  for (const qw of qWords) {
    if (qw.length < 2) continue;
    if (tWords.some((tw) => tw.includes(qw) || qw.includes(tw))) matches++;
  }
  return qWords.length > 0 ? Math.round((matches / qWords.length) * 80) : 0;
}

export function findClosestOccupations(
  query: string,
  limit = 5,
): MatchResult[] {
  const allOccs = getAllOccupations();
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  // Step 1: synonym lookup
  if (JOB_SYNONYMS[q]) {
    const targetSlug = JOB_SYNONYMS[q];
    const match = allOccs.find((o) => toSlug(o.name_en) === targetSlug);
    if (match) {
      return [{ slug: toSlug(match.name_en), occupation: match, score: 95, reason: "direct" }];
    }
  }

  // Step 2: fuzzy match on names
  const scored = allOccs.map((occ) => {
    const slug = toSlug(occ.name_en);
    const nameScore = Math.max(
      fuzzyScore(q, occ.name_en),
      fuzzyScore(q, occ.name_fr || ""),
      fuzzyScore(q, occ.name_ar || ""),
    );

    // Step 3: sector tag boost
    let tagScore = 0;
    const sectorTags = SECTOR_TAGS[occ.sector_id] || [];
    const qWords = q.split(/[\s\-/&,]+/).filter(Boolean);
    for (const w of qWords) {
      if (w.length < 2) continue;
      if (sectorTags.some((t) => t.toLowerCase().includes(w) || w.includes(t.toLowerCase()))) {
        tagScore += 15;
      }
    }

    const totalScore = Math.min(90, Math.max(nameScore, nameScore * 0.7 + tagScore * 0.3));
    const reason: MatchResult["reason"] = nameScore >= 70 ? "fuzzy" : tagScore > 0 ? "related" : "fuzzy";

    return { slug, occupation: occ, score: Math.round(totalScore), reason };
  });

  return scored
    .filter((r) => r.score > 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
