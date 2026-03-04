/**
 * Job Tiers — education / experience level required for each occupation.
 *
 * Tier 1: Entry-level, no degree required (high school or vocational)
 * Tier 2: Diploma or short certification (6-12 months)
 * Tier 3: Bachelor's degree or equivalent experience (3-4 years)
 * Tier 4: Specialized degree + professional license (5-6 years)
 * Tier 5: Advanced degree (Master/PhD/Medical) + years of specialization
 *
 * HARD RULE: A person can transition UP by max 1 tier.
 *   Tier 1 → can reach Tier 1 + 2
 *   Tier 2 → can reach Tier 1 + 2 + 3
 *   … and so on.
 *
 * Names MUST match master.json name_en EXACTLY.
 */

export type JobTier = 1 | 2 | 3 | 4 | 5;

export const JOB_TIERS: Record<string, JobTier> = {
  /* ══════════════════════════════════════
   * Tier 1 — Entry level / no degree
   * ══════════════════════════════════════ */
  "Administrative Assistants": 1,
  "Bank Tellers": 1,
  "Barista/Cafe Worker": 1,
  "Call Center Agent": 1,
  "Cashiers": 1,
  "Cleaner/Janitor": 1,
  "Construction Workers": 1,
  "Customer Service Reps": 1,
  "Data Entry Keyers": 1,
  "Delivery Driver": 1,
  "Heavy Truck Drivers": 1,
  "Landscaping Workers": 1,
  "Logistics Clerks": 1,
  "Payroll Clerks": 1,
  "Postal Service Clerks": 1,
  "Receptionists": 1,
  "Retail Salespersons": 1,
  "Security Guard": 1,
  "Telemarketers": 1,
  "Tour Guide": 1,
  "Waiter/Waitress": 1,

  /* ══════════════════════════════════════
   * Tier 2 — Diploma / short certification
   * ══════════════════════════════════════ */
  // Emerging Tier 2
  "Autonomous Vehicle Technician": 2,
  "Data Annotation & AI Training Specialist": 2,
  "Renewable Energy Technician": 2,
  "RPA Developer": 2,
  // Traditional Tier 2
  "Claims Adjusters": 2,
  "CNC Machine Operator": 2,
  "Content Writer/Copywriter": 2,
  "Crane Operator": 2,
  "Customs Broker": 2,
  "Document Controller": 2,
  "Driving Instructor": 2,
  "Electrical Technician": 2,
  "Electricians": 2,
  "Event Planner": 2,
  "Executive Secretary": 2,
  "Fitness Trainers": 2,
  "Flight Attendant": 2,
  "Freight Forwarder": 2,
  "Graphic Designers": 2,
  "HVAC Technician": 2,
  "Insurance Agent": 2,
  "Insurance Underwriters": 2,
  "IT Support Specialist": 2,
  "Legal Secretaries": 2,
  "Maintenance Technicians": 2,
  "Medical Coder": 2,
  "Medical Laboratory Technician": 2,
  "Office Manager": 2,
  "Paralegals & Legal Assistants": 2,
  "Personal Trainer (Gym)": 2,
  "Photographer": 2,
  "Plumbers & Pipefitters": 2,
  "Private Tutor": 2,
  "Proofreaders": 2,
  "Production Supervisor": 2,
  "Real Estate Agents": 2,
  "Real Estate Appraiser": 2,
  "Recruitment Specialist": 2,
  "Sales Representatives": 2,
  "SEO/SEM Specialist": 2,
  "Social Media Manager": 2,
  "Store Manager": 2,
  "Tax Preparers": 2,
  "Technical Writers": 2,
  "Translators": 2,
  "Training Specialist": 2,
  "Travel Agents": 2,
  "Video Producer/Editor": 2,
  "Visual Merchandiser": 2,
  "Warehouse Manager": 2,

  /* ══════════════════════════════════════
   * Tier 3 — Bachelor's degree
   * ══════════════════════════════════════ */
  // Emerging Tier 3
  "AI Product Manager": 3,
  "AI Prompt Engineer": 3,
  "Cloud Solutions Architect": 3,
  "Cybersecurity Analyst": 3,
  "Digital Transformation Consultant": 3,
  "Machine Learning Engineer": 3,
  // Traditional Tier 3
  "Accountants & Auditors": 3,
  "Actuaries": 3,
  "Architect": 3,
  "Bank Branch Manager": 3,
  "Budget Analysts": 3,
  "Business Development Manager": 3,
  "Civil/Mechanical Engineers": 3,
  "Cloud Engineer": 3,
  "Computer Programmers": 3,
  "Credit Analyst": 3,
  "Data Scientist": 3,
  "Database Administrator": 3,
  "Environmental Specialist": 3,
  "ERP/SAP Consultant": 3,
  "Financial Analysts": 3,
  "Financial Examiners": 3,
  "Food Safety Inspector": 3,
  "General Manager": 3,
  "Government Relations Officer": 3,
  "Health & Safety Officer": 3,
  "Hospital Administrator": 3,
  "Hotel Manager": 3,
  "HR Specialists": 3,
  "Imam/Religious Leader": 3,
  "Industrial Engineer": 3,
  "Internal Auditor": 3,
  "Investment Banker": 3,
  "Logistics Manager": 3,
  "Maintenance Engineer": 3,
  "Market Research Analysts": 3,
  "Marketing Specialists": 3,
  "Network Engineer": 3,
  "Operations Manager": 3,
  "Process Engineer": 3,
  "Project Manager (Construction)": 3,
  "Public Relations Specialist": 3,
  "Purchasing Manager": 3,
  "Quality Manager": 3,
  "Quantity Surveyor": 3,
  "Regulatory Affairs Specialist": 3,
  "Risk Manager": 3,
  "Social Workers": 3,
  "Software Developer": 3,
  "Supply Chain Manager": 3,
  "Surveyor (Land)": 3,
  "Systems Analyst": 3,
  "Teachers (Preschool/Primary)": 3,
  "Training & Development Manager": 3,
  "UX/UI Designer": 3,
  "Web Developers": 3,
  "Writers & Authors": 3,

  /* ══════════════════════════════════════
   * Tier 4 — Specialized degree + license
   * ══════════════════════════════════════ */
  // Emerging Tier 4
  "AI Ethics & Governance Specialist": 4,
  "AI-Assisted Healthcare Specialist": 4,
  // Traditional Tier 4
  "Chemical Engineer": 4,
  "Clinical Research Associate": 4,
  "Corporate Lawyer": 4,
  "Drilling Engineer": 4,
  "Lawyers": 4,
  "Legal Advisor (Sharia)": 4,
  "Pharmacists": 4,
  "Pilot (Commercial)": 4,
  "Radiologist/Radiologic Technologist": 4,
  "Registered Nurses": 4,
  "School Principal": 4,

  /* ══════════════════════════════════════
   * Tier 5 — Advanced degree / medical
   * ══════════════════════════════════════ */
  "Dentists": 5,
  "Petroleum Engineer": 5,
  "Surgeons & Physicians": 5,
  "University Professor": 5,
};

/** Default tier for occupations not explicitly listed. */
export const DEFAULT_TIER: JobTier = 2;

/**
 * Get the tier for a given occupation name_en.
 */
export function getTier(name_en: string): JobTier {
  return JOB_TIERS[name_en] ?? DEFAULT_TIER;
}

/**
 * HARD FILTER — can a worker transition from currentTier to targetTier?
 * Rule: max +1 tier up. Going down is always OK.
 */
export function isTierFeasible(
  currentTier: JobTier,
  targetTier: JobTier,
): boolean {
  return targetTier <= currentTier + 1;
}
