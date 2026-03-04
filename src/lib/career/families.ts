/**
 * Skill Families — clusters of transferable skills that make transitions
 * between occupations realistic.
 *
 * Each occupation belongs to 1-3 families.
 * Shared families → higher skills overlap score → better recommendation.
 *
 * Names MUST match master.json name_en EXACTLY.
 */

export type SkillFamily =
  | "admin_office"
  | "finance_accounting"
  | "sales_marketing"
  | "tech_it"
  | "healthcare"
  | "engineering"
  | "hospitality_service"
  | "legal_compliance"
  | "creative_media"
  | "logistics_ops"
  | "education_training"
  | "management"
  | "trades_manual"
  | "security"
  | "data_analytics";

export const SKILL_FAMILIES: Record<string, SkillFamily[]> = {
  /* ── Admin / Office cluster ── */
  "Administrative Assistants": ["admin_office", "management"],
  "Data Entry Keyers": ["admin_office", "data_analytics"],
  "Legal Secretaries": ["admin_office", "legal_compliance"],
  "Receptionists": ["admin_office", "hospitality_service"],
  "Payroll Clerks": ["admin_office", "finance_accounting"],
  "Call Center Agent": ["admin_office", "sales_marketing"],
  "Medical Coder": ["admin_office", "healthcare"],
  "Proofreaders": ["admin_office", "creative_media"],
  "Document Controller": ["admin_office", "logistics_ops"],
  "Executive Secretary": ["admin_office", "management"],
  "Office Manager": ["admin_office", "management"],
  "Postal Service Clerks": ["admin_office", "logistics_ops"],

  /* ── Finance cluster ── */
  "Accountants & Auditors": ["finance_accounting", "legal_compliance"],
  "Tax Preparers": ["finance_accounting"],
  "Financial Analysts": ["finance_accounting", "data_analytics"],
  "Financial Examiners": ["finance_accounting", "legal_compliance"],
  "Insurance Underwriters": ["finance_accounting", "data_analytics"],
  "Bank Branch Manager": ["finance_accounting", "management", "sales_marketing"],
  "Bank Tellers": ["finance_accounting", "hospitality_service"],
  "Budget Analysts": ["finance_accounting", "data_analytics"],
  "Credit Analyst": ["finance_accounting", "data_analytics"],
  "Internal Auditor": ["finance_accounting", "legal_compliance"],
  "Investment Banker": ["finance_accounting", "management"],
  "Actuaries": ["finance_accounting", "data_analytics"],
  "Insurance Agent": ["finance_accounting", "sales_marketing"],
  "Risk Manager": ["finance_accounting", "management"],

  /* ── Tech cluster ── */
  "Software Developer": ["tech_it", "data_analytics"],
  "Network Engineer": ["tech_it", "security"],
  "AI Prompt Engineer": ["tech_it", "creative_media", "data_analytics"],
  "Machine Learning Engineer": ["tech_it", "data_analytics"],
  "Cloud Solutions Architect": ["tech_it"],
  "Cloud Engineer": ["tech_it"],
  "Cybersecurity Analyst": ["tech_it", "security"],
  "RPA Developer": ["tech_it", "admin_office"],
  "Data Annotation & AI Training Specialist": ["tech_it", "admin_office", "data_analytics"],
  "AI Product Manager": ["tech_it", "management"],
  "Digital Transformation Consultant": ["tech_it", "management"],
  "Database Administrator": ["tech_it", "data_analytics"],
  "Systems Analyst": ["tech_it", "data_analytics"],
  "UX/UI Designer": ["tech_it", "creative_media"],
  "Web Developers": ["tech_it", "creative_media"],
  "Computer Programmers": ["tech_it", "data_analytics"],
  "Data Scientist": ["tech_it", "data_analytics"],
  "ERP/SAP Consultant": ["tech_it", "management"],
  "IT Support Specialist": ["tech_it", "admin_office"],
  "SEO/SEM Specialist": ["tech_it", "sales_marketing"],

  /* ── Healthcare cluster ── */
  "Registered Nurses": ["healthcare"],
  "Pharmacists": ["healthcare"],
  "Dentists": ["healthcare"],
  "Surgeons & Physicians": ["healthcare"],
  "AI-Assisted Healthcare Specialist": ["healthcare", "tech_it"],
  "Clinical Research Associate": ["healthcare", "data_analytics"],
  "Medical Laboratory Technician": ["healthcare", "data_analytics"],
  "Radiologist/Radiologic Technologist": ["healthcare", "tech_it"],
  "Hospital Administrator": ["healthcare", "management"],
  "Social Workers": ["healthcare", "education_training"],

  /* ── Engineering cluster ── */
  "Civil/Mechanical Engineers": ["engineering"],
  "Project Manager (Construction)": ["engineering", "management"],
  "Petroleum Engineer": ["engineering"],
  "Renewable Energy Technician": ["engineering", "trades_manual"],
  "Autonomous Vehicle Technician": ["engineering", "tech_it"],
  "Quality Manager": ["engineering", "logistics_ops"],
  "Architect": ["engineering", "creative_media"],
  "Environmental Specialist": ["engineering", "data_analytics"],
  "Industrial Engineer": ["engineering", "logistics_ops"],
  "Chemical Engineer": ["engineering", "data_analytics"],
  "Drilling Engineer": ["engineering", "trades_manual"],
  "Maintenance Engineer": ["engineering", "trades_manual"],
  "Process Engineer": ["engineering", "logistics_ops"],
  "Quantity Surveyor": ["engineering", "finance_accounting"],
  "Surveyor (Land)": ["engineering"],

  /* ── Hospitality cluster ── */
  "Hotel Manager": ["hospitality_service", "management"],
  "Barista/Cafe Worker": ["hospitality_service"],
  "Waiter/Waitress": ["hospitality_service"],
  "Event Planner": ["hospitality_service", "management"],
  "Travel Agents": ["hospitality_service", "sales_marketing"],
  "Flight Attendant": ["hospitality_service", "security"],
  "Cleaner/Janitor": ["hospitality_service"],
  "Tour Guide": ["hospitality_service", "education_training"],

  /* ── Sales / Marketing cluster ── */
  "Marketing Specialists": ["sales_marketing", "creative_media"],
  "Social Media Manager": ["sales_marketing", "creative_media"],
  "Retail Salespersons": ["sales_marketing", "hospitality_service"],
  "Real Estate Agents": ["sales_marketing"],
  "Real Estate Appraiser": ["sales_marketing", "finance_accounting"],
  "Telemarketers": ["sales_marketing"],
  "Public Relations Specialist": ["sales_marketing", "creative_media"],
  "Sales Representatives": ["sales_marketing"],
  "Visual Merchandiser": ["sales_marketing", "creative_media"],
  "Cashiers": ["sales_marketing", "hospitality_service"],
  "Market Research Analysts": ["sales_marketing", "data_analytics"],
  "Recruitment Specialist": ["sales_marketing", "management"],

  /* ── Management cluster ── */
  "HR Specialists": ["management", "admin_office"],
  "Operations Manager": ["management", "logistics_ops"],
  "Supply Chain Manager": ["management", "logistics_ops"],
  "Business Development Manager": ["management", "sales_marketing"],
  "Training & Development Manager": ["management", "education_training"],
  "Logistics Manager": ["management", "logistics_ops"],
  "General Manager": ["management"],
  "Store Manager": ["management", "sales_marketing"],
  "Purchasing Manager": ["management", "logistics_ops"],
  "Warehouse Manager": ["management", "logistics_ops"],
  "Production Supervisor": ["management", "trades_manual"],
  "Regulatory Affairs Specialist": ["management", "legal_compliance"],
  "Government Relations Officer": ["management", "legal_compliance"],

  /* ── Trades cluster ── */
  "Electricians": ["trades_manual", "engineering"],
  "Electrical Technician": ["trades_manual", "engineering"],
  "HVAC Technician": ["trades_manual", "engineering"],
  "Construction Workers": ["trades_manual"],
  "Landscaping Workers": ["trades_manual"],
  "Plumbers & Pipefitters": ["trades_manual"],
  "CNC Machine Operator": ["trades_manual", "engineering"],
  "Crane Operator": ["trades_manual"],
  "Maintenance Technicians": ["trades_manual", "engineering"],
  "Heavy Truck Drivers": ["trades_manual", "logistics_ops"],
  "Delivery Driver": ["logistics_ops", "trades_manual"],

  /* ── Creative cluster ── */
  "Graphic Designers": ["creative_media", "tech_it"],
  "Technical Writers": ["creative_media", "admin_office"],
  "Photographer": ["creative_media"],
  "Translators": ["creative_media", "admin_office"],
  "Content Writer/Copywriter": ["creative_media", "sales_marketing"],
  "Video Producer/Editor": ["creative_media", "tech_it"],
  "Writers & Authors": ["creative_media"],

  /* ── Legal cluster ── */
  "Legal Advisor (Sharia)": ["legal_compliance"],
  "AI Ethics & Governance Specialist": ["legal_compliance", "tech_it"],
  "Corporate Lawyer": ["legal_compliance", "management"],
  "Lawyers": ["legal_compliance"],
  "Paralegals & Legal Assistants": ["legal_compliance", "admin_office"],
  "Claims Adjusters": ["legal_compliance", "finance_accounting"],

  /* ── Logistics cluster ── */
  "Logistics Clerks": ["logistics_ops", "admin_office"],
  "Freight Forwarder": ["logistics_ops", "sales_marketing"],
  "Customs Broker": ["logistics_ops", "legal_compliance"],
  "Food Safety Inspector": ["logistics_ops", "healthcare"],

  /* ── Security cluster ── */
  "Security Guard": ["security"],
  "Health & Safety Officer": ["security", "management"],
  "Pilot (Commercial)": ["security", "engineering"],

  /* ── Education cluster ── */
  "University Professor": ["education_training", "data_analytics"],
  "Driving Instructor": ["education_training"],
  "Teachers (Preschool/Primary)": ["education_training"],
  "Training Specialist": ["education_training", "management"],
  "School Principal": ["education_training", "management"],
  "Private Tutor": ["education_training"],
  "Personal Trainer (Gym)": ["education_training", "hospitality_service"],
  "Fitness Trainers": ["education_training", "hospitality_service"],
  "Imam/Religious Leader": ["education_training"],
};

/** Default skill family for unmapped occupations. */
export const DEFAULT_FAMILIES: SkillFamily[] = ["admin_office"];

/**
 * Get skill families for a given occupation name_en.
 */
export function getFamilies(name_en: string): SkillFamily[] {
  return SKILL_FAMILIES[name_en] ?? DEFAULT_FAMILIES;
}

/**
 * Count shared skill families between two occupation names.
 */
export function sharedFamilyCount(nameA: string, nameB: string): number {
  const a = getFamilies(nameA);
  const b = getFamilies(nameB);
  return a.filter((f) => b.includes(f)).length;
}
