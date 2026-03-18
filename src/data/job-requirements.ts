export type OccupationCategory =
  | "healthcare"
  | "engineering"
  | "finance"
  | "it"
  | "construction"
  | "sales_marketing"
  | "education"
  | "legal"
  | "hospitality"
  | "admin"
  | "logistics"
  | "security";

export interface CertInfo {
  name: string;
  body: string;
  timeline: string;
}

export interface CategoryRequirements {
  degree: { en: string; ar: string };
  certifications: CertInfo[];
  topSkills: string[];
  competitiveEdge: string[];
  gccAdvantage: { en: string; ar: string };
}

export const JOB_REQUIREMENTS: Record<OccupationCategory, CategoryRequirements> = {
  healthcare: {
    degree: {
      en: "Bachelor\u2019s degree in a recognized health specialization + mandatory internship year. Specialists require a recognized specialty degree or fellowship.",
      ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0641\u064A \u062A\u062E\u0635\u0635 \u0635\u062D\u064A \u0645\u0639\u062A\u0645\u062F + \u0633\u0646\u0629 \u0627\u0645\u062A\u064A\u0627\u0632 \u0625\u0644\u0632\u0627\u0645\u064A\u0629. \u0627\u0644\u062A\u062E\u0635\u0635\u0627\u062A \u062A\u062A\u0637\u0644\u0628 \u0634\u0647\u0627\u062F\u0629 \u062A\u062E\u0635\u0635 \u0623\u0648 \u0632\u0645\u0627\u0644\u0629 \u0645\u0639\u062A\u0631\u0641 \u0628\u0647\u0627.",
    },
    certifications: [
      { name: "SCFHS Registration", body: "Saudi Commission for Health Specialties", timeline: "PSV via DataFlow: 6-8 weeks + SCFHS registration: 2-3 months" },
      { name: "Prometric Exam", body: "SCFHS", timeline: "Schedule within 2-4 weeks" },
      { name: "CPR/BLS Certification", body: "AHA or equivalent", timeline: "Valid certification required" },
      { name: "Good Standing Certificate", body: "Home country medical council", timeline: "Must be recent (< 6 months)" },
    ],
    topSkills: ["AI-assisted diagnostics", "Telemedicine & remote monitoring", "Critical care & emergency medicine", "Health informatics & EHR systems", "Quality assurance & patient safety protocols"],
    competitiveEdge: ["Board certification from North America/UK/Europe", "Secondary cert in healthcare administration or PMP", "Arabic fluency (improves patient outcomes)", "Experience with DataFlow & regional health authorities", "Digital health / AI radiology experience"],
    gccAdvantage: {
      en: "GCC experience is extraordinarily valuable. Regional practitioners understand Gulf-specific epidemiological profiles (diabetes, cardiovascular, genetic disorders), DataFlow verification, and regional regulatory compliance \u2014 significantly accelerating onboarding.",
      ar: "\u0627\u0644\u062E\u0628\u0631\u0629 \u0641\u064A \u062F\u0648\u0644 \u0627\u0644\u062E\u0644\u064A\u062C \u0630\u0627\u062A \u0642\u064A\u0645\u0629 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629. \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0648\u0646 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0648\u0646 \u064A\u0641\u0647\u0645\u0648\u0646 \u0627\u0644\u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0648\u0628\u0627\u0626\u064A\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u062E\u0644\u064A\u062C \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0639\u0628\u0631 DataFlow \u0648\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A.",
    },
  },
  engineering: {
    degree: {
      en: "Bachelor\u2019s degree in a specific engineering specialization, attested by home country\u2019s Ministry of Education and authenticated by Saudi Embassy.",
      ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0641\u064A \u062A\u062E\u0635\u0635 \u0647\u0646\u062F\u0633\u064A \u0645\u062D\u062F\u062F\u060C \u0645\u0635\u062F\u0642 \u0645\u0646 \u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645 \u0641\u064A \u0628\u0644\u062F \u0627\u0644\u0645\u0646\u0634\u0623 \u0648\u0645\u0639\u062A\u0645\u062F \u0645\u0646 \u0627\u0644\u0633\u0641\u0627\u0631\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.",
    },
    certifications: [
      { name: "Saudi Council of Engineers (SCE)", body: "SCE", timeline: "Digital portal: < 2 weeks routine, up to 30 days for complex cases" },
      { name: "PMP or PRINCE2", body: "PMI / Axelos", timeline: "Self-paced, exam booking 2-4 weeks" },
    ],
    topSkills: ["BIM (Building Information Modeling)", "Renewable energy systems (solar, wind, hydrogen)", "Smart infrastructure & IoT", "Advanced project management (billion-dollar capex)", "LEED / sustainable design & green building"],
    competitiveEdge: ["Mega-project delivery experience (NEOM-scale)", "Digital twin creation & automation", "Saudi Building Code knowledge", "Managing culturally diverse multidisciplinary teams", "Arabic language bonus"],
    gccAdvantage: {
      en: "GCC experience is arguably more critical in engineering than any other domain. Managing extreme arid climates, thermal stress, region-compliant materials, and multi-national labor camps is unique to the Gulf.",
      ar: "\u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u0641\u064A \u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0631\u0628\u0645\u0627 \u062A\u0643\u0648\u0646 \u0627\u0644\u0623\u0647\u0645. \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u0627\u062E \u0627\u0644\u0635\u062D\u0631\u0627\u0648\u064A \u0648\u0627\u0644\u0625\u062C\u0647\u0627\u062F \u0627\u0644\u062D\u0631\u0627\u0631\u064A \u0648\u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621 \u0627\u0644\u0645\u062A\u0648\u0627\u0641\u0642\u0629 \u0625\u0642\u0644\u064A\u0645\u064A\u0627\u064B \u0641\u0631\u064A\u062F\u0629 \u0641\u064A \u0627\u0644\u062E\u0644\u064A\u062C.",
    },
  },
  finance: {
    degree: {
      en: "Bachelor\u2019s in Accounting, or Bachelor\u2019s from Administrative Sciences with minimum 15 credit hours in accounting coursework.",
      ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0645\u062D\u0627\u0633\u0628\u0629\u060C \u0623\u0648 \u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0639\u0644\u0648\u0645 \u0625\u062F\u0627\u0631\u064A\u0629 \u0645\u0639 15 \u0633\u0627\u0639\u0629 \u0645\u0639\u062A\u0645\u062F\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0641\u064A \u0645\u0642\u0631\u0631\u0627\u062A \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u0629.",
    },
    certifications: [
      { name: "SOCPA Fellowship", body: "Saudi Organization for Certified Public Accountants", timeline: "Registration: 1 day to 1 month" },
      { name: "CPA / ACCA / CMA (international)", body: "AICPA / ACCA / IMA", timeline: "Recognized alongside SOCPA" },
    ],
    topSkills: ["ZATCA VAT/e-invoicing compliance (Phase 2)", "IFRS implementation", "Business Intelligence (Power BI, Tableau, SQL)", "Cloud accounting (Qoyod, Xero)", "Fintech integration & digital payments"],
    competitiveEdge: ["SOCPA + CPA/ACCA dual qualification", "Islamic Finance & Fiqh Al-Mu'amalat knowledge", "ZATCA e-invoicing hands-on experience", "Transfer pricing expertise", "Bilingual Arabic/English (non-negotiable for senior roles)"],
    gccAdvantage: {
      en: "Professionals who managed VAT implementations, corporate tax transitions, or regulatory audits in UAE/Bahrain possess highly transferable compliance skills.",
      ar: "\u0627\u0644\u0645\u062D\u062A\u0631\u0641\u0648\u0646 \u0627\u0644\u0630\u064A\u0646 \u0623\u062F\u0627\u0631\u0648\u0627 \u062A\u0637\u0628\u064A\u0642 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0623\u0648 \u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0641\u064A \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A/\u0627\u0644\u0628\u062D\u0631\u064A\u0646 \u064A\u0645\u062A\u0644\u0643\u0648\u0646 \u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0645\u062A\u062B\u0627\u0644 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0646\u0642\u0644.",
    },
  },
  it: {
    degree: {
      en: "Bachelor\u2019s in Computer Science, IT, or related field heavily preferred. Skills-based hiring pathways exist for heavily certified individuals.",
      ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0639\u0644\u0648\u0645 \u062D\u0627\u0633\u0628 \u0623\u0648 \u062A\u0642\u0646\u064A\u0629 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0645\u0641\u0636\u0644 \u0628\u0634\u062F\u0629. \u0645\u0633\u0627\u0631\u0627\u062A \u062A\u0648\u0638\u064A\u0641 \u0642\u0627\u0626\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A \u0645\u062A\u0627\u062D\u0629 \u0644\u0623\u0635\u062D\u0627\u0628 \u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629.",
    },
    certifications: [
      { name: "Professional Accreditation (Qiwa)", body: "HRSD", timeline: "1-3 workdays via Qiwa portal" },
      { name: "Role-specific certs (CISSP, AWS, CEH)", body: "ISC2 / AWS / EC-Council", timeline: "Self-paced" },
    ],
    topSkills: ["Cloud architecture (AWS, Azure, GCP)", "Cybersecurity (threat detection, IAM, penetration testing)", "AI/ML (TensorFlow, NLP, predictive models)", "Data science & visualization (Power BI, Tableau, SQL)", "DevOps & automation"],
    competitiveEdge: ["PDPL (Saudi data protection law) knowledge", "NCA cybersecurity frameworks expertise", "CCSP or CISSP certification", "Arabic-localized platform experience", "Aramco/SABIC contractor experience"],
    gccAdvantage: {
      en: "GCC experience signals familiarity with regional e-government ecosystems, Arabic-localized platforms, regional banking APIs, and Gulf-specific technology procurement processes.",
      ar: "\u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u062A\u0634\u064A\u0631 \u0625\u0644\u0649 \u0627\u0644\u0625\u0644\u0645\u0627\u0645 \u0628\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u062D\u0643\u0648\u0645\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629 \u0648\u0627\u0644\u0645\u0646\u0635\u0627\u062A \u0627\u0644\u0645\u0639\u0631\u0628\u0629 \u0648\u0648\u0627\u062C\u0647\u0627\u062A \u0627\u0644\u0628\u0646\u0648\u0643 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629.",
    },
  },
  construction: {
    degree: {
      en: "Formal vocational diploma or recognized technical trade certificate + minimum 2 years verifiable field experience.",
      ar: "\u062F\u0628\u0644\u0648\u0645 \u0645\u0647\u0646\u064A \u0631\u0633\u0645\u064A \u0623\u0648 \u0634\u0647\u0627\u062F\u0629 \u062D\u0631\u0641\u064A\u0629 \u062A\u0642\u0646\u064A\u0629 \u0645\u0639\u062A\u0631\u0641 \u0628\u0647\u0627 + \u0633\u0646\u062A\u0627\u0646 \u062E\u0628\u0631\u0629 \u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0645\u0648\u062B\u0642\u0629 \u0643\u062D\u062F \u0623\u062F\u0646\u0649.",
    },
    certifications: [
      { name: "Skill Verification Program (SVP)", body: "HRSD via Qiwa", timeline: "Pre-arrival testing at authorized centers (India, Pakistan, Egypt)" },
      { name: "NEBOSH/IOSH/OSHA (supervisors)", body: "International", timeline: "Self-paced, highly valued" },
    ],
    topSkills: ["Advanced electrical wiring (commercial/industrial)", "Industrial plumbing & pipefitting", "Commercial HVAC maintenance", "Precision structural welding (Arc, MIG, TIG)", "Workplace safety compliance"],
    competitiveEdge: ["OSHA/NEBOSH safety certification", "Digital blueprint reading & BIM basics", "Automated construction machinery operation", "Multilingual (English + Arabic + Hindi/Urdu) for supervisors", "Foreman/site supervision experience"],
    gccAdvantage: {
      en: "GCC experience is a fundamental prerequisite for supervisory roles. The Gulf construction environment involves hyper-accelerated schedules, extreme thermal stress protocols, and complex multinational supply chains.",
      ar: "\u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u0634\u0631\u0637 \u0623\u0633\u0627\u0633\u064A \u0644\u0644\u0623\u062F\u0648\u0627\u0631 \u0627\u0644\u0625\u0634\u0631\u0627\u0641\u064A\u0629. \u0628\u064A\u0626\u0629 \u0627\u0644\u0628\u0646\u0627\u0621 \u0641\u064A \u0627\u0644\u062E\u0644\u064A\u062C \u062A\u062A\u0636\u0645\u0646 \u062C\u062F\u0627\u0648\u0644 \u0645\u062A\u0633\u0627\u0631\u0639\u0629 \u0648\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644\u0627\u062A \u0625\u062C\u0647\u0627\u062F \u062D\u0631\u0627\u0631\u064A \u0648\u0633\u0644\u0627\u0633\u0644 \u0625\u0645\u062F\u0627\u062F \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u062C\u0646\u0633\u064A\u0627\u062A.",
    },
  },
  sales_marketing: {
    degree: {
      en: "Bachelor\u2019s in Business, Marketing, Communications, or Digital Media.",
      ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0625\u062F\u0627\u0631\u0629 \u0623\u0639\u0645\u0627\u0644 \u0623\u0648 \u062A\u0633\u0648\u064A\u0642 \u0623\u0648 \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0623\u0648 \u0625\u0639\u0644\u0627\u0645 \u0631\u0642\u0645\u064A.",
    },
    certifications: [
      { name: "Freelance License (for independents)", body: "Ministry of Commerce", timeline: "1-3 workdays electronic" },
    ],
    topSkills: ["Omni-channel digital marketing (Snapchat, X, TikTok)", "Data-driven ROI analysis & A/B testing", "Localized Arabic copywriting", "B2B sales & government procurement negotiation", "AI & marketing automation (Salesforce, HubSpot)"],
    competitiveEdge: ["MBA + Google/Meta/HubSpot certifications", "Intrinsic understanding of Saudi cultural sensitivities", "Ramadan/Eid seasonal campaign experience", "CSP (Certified Sales Professional)", "Saudi consumer behavior expertise"],
    gccAdvantage: {
      en: "GCC experience demonstrates ability to localize global brand strategies for Gulf consumers. Navigating competitive retail and digital landscapes of Dubai/Doha provides a tested playbook.",
      ar: "\u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u062A\u062B\u0628\u062A \u0627\u0644\u0642\u062F\u0631\u0629 \u0639\u0644\u0649 \u062A\u0648\u0637\u064A\u0646 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u0644\u0644\u0645\u0633\u062A\u0647\u0644\u0643 \u0627\u0644\u062E\u0644\u064A\u062C\u064A.",
    },
  },
  education: {
    degree: {
      en: "Bachelor\u2019s in Education or the specific subject being taught. Master\u2019s frequently required by universities and elite schools.",
      ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u062A\u0631\u0628\u064A\u0629 \u0623\u0648 \u0641\u064A \u0627\u0644\u0645\u0627\u062F\u0629 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0627\u0644\u0645\u064F\u062F\u0631\u064E\u0633\u0629. \u0627\u0644\u0645\u0627\u062C\u0633\u062A\u064A\u0631 \u0645\u0637\u0644\u0648\u0628 \u063A\u0627\u0644\u0628\u0627\u064B \u0641\u064A \u0627\u0644\u062C\u0627\u0645\u0639\u0627\u062A \u0648\u0627\u0644\u0645\u062F\u0627\u0631\u0633 \u0627\u0644\u0646\u062E\u0628\u0648\u064A\u0629.",
    },
    certifications: [
      { name: "International Teaching License (PGCE/QTS)", body: "UK/international bodies", timeline: "Must be obtained pre-arrival" },
      { name: "TEFL/TESOL (for language instructors)", body: "Various", timeline: "Self-paced" },
      { name: "ETEC Registration", body: "Education & Training Evaluation Commission", timeline: "Qiyas registration immediate, visa process several weeks" },
    ],
    topSkills: ["STEM instruction (inquiry-based)", "Digital & tech literacy (coding, robotics, AI basics)", "Special Education (SEN/IEP)", "Advanced ESL & bilingual instruction", "Vocational & technical training"],
    competitiveEdge: ["UK PGCE or QTS certification (salary premium)", "Training of Trainers (TOT) certification", "Bilingual Arabic-English instruction capability", "TVTC-aligned technical training experience", "Clean criminal background check (mandatory)"],
    gccAdvantage: {
      en: "GCC teaching experience means familiarity with Gulf academic calendars, integration of Islamic cultural norms, and effective engagement with both expat and Saudi parents.",
      ar: "\u062E\u0628\u0631\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0633 \u0641\u064A \u0627\u0644\u062E\u0644\u064A\u062C \u062A\u0639\u0646\u064A \u0627\u0644\u0625\u0644\u0645\u0627\u0645 \u0628\u0627\u0644\u062A\u0642\u0648\u064A\u0645 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A \u0627\u0644\u062E\u0644\u064A\u062C\u064A \u0648\u062F\u0645\u062C \u0627\u0644\u0642\u064A\u0645 \u0627\u0644\u062B\u0642\u0627\u0641\u064A\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0641\u0639\u0627\u0644 \u0645\u0639 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631.",
    },
  },
  legal: {
    degree: {
      en: "Bachelor\u2019s in Sharia or Law. Foreign lawyers must hold equivalent jurisdictional credentials recognized by Saudi authorities.",
      ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0634\u0631\u064A\u0639\u0629 \u0623\u0648 \u0642\u0627\u0646\u0648\u0646. \u0627\u0644\u0645\u062D\u0627\u0645\u0648\u0646 \u0627\u0644\u0623\u062C\u0627\u0646\u0628 \u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u0645\u0644\u0648\u0627 \u0645\u0624\u0647\u0644\u0627\u062A \u0645\u0639\u0627\u062F\u0644\u0629 \u0645\u0639\u062A\u0631\u0641 \u0628\u0647\u0627 \u0645\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u062A \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629.",
    },
    certifications: [
      { name: "Saudi Bar Association License", body: "SBA / Ministry of Justice", timeline: "100 training hours + 1-3 years practical experience, electronic review via Najiz: 5 workdays" },
    ],
    topSkills: ["FDI & corporate law (JVs, M&A, MISA compliance)", "Regulatory compliance & due diligence", "ZATCA tax & Zakat law", "Sharia law integration in commercial contracts", "Maritime & logistics law"],
    competitiveEdge: ["Dual qualification (common law + Saudi/Sharia)", "Bilingual legal drafting (English + Arabic)", "AML / corporate governance / PDPL certifications", "DIFC/ADGM arbitration experience", "Islamic finance legal expertise"],
    gccAdvantage: {
      en: "GCC legal frameworks share foundational jurisprudential principles. Lawyers who structured entities in DIFC or managed ADGM arbitration possess directly applicable regional commercial awareness.",
      ar: "\u0627\u0644\u0623\u0637\u0631 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u062A\u062A\u0634\u0627\u0631\u0643 \u0645\u0628\u0627\u062F\u0626 \u0641\u0642\u0647\u064A\u0629 \u0623\u0633\u0627\u0633\u064A\u0629. \u0627\u0644\u0645\u062D\u0627\u0645\u0648\u0646 \u0627\u0644\u0630\u064A\u0646 \u0647\u064A\u0643\u0644\u0648\u0627 \u0643\u064A\u0627\u0646\u0627\u062A \u0641\u064A \u0645\u0631\u0643\u0632 \u062F\u0628\u064A \u0627\u0644\u0645\u0627\u0644\u064A \u064A\u0645\u062A\u0644\u0643\u0648\u0646 \u0648\u0639\u064A\u0627\u064B \u062A\u062C\u0627\u0631\u064A\u0627\u064B \u0625\u0642\u0644\u064A\u0645\u064A\u0627\u064B \u0642\u0627\u0628\u0644\u0627\u064B \u0644\u0644\u062A\u0637\u0628\u064A\u0642.",
    },
  },
  hospitality: {
    degree: {
      en: "Formal degree or advanced vocational diploma in Hospitality Management, Tourism, or Culinary Arts preferred for management roles.",
      ar: "\u0634\u0647\u0627\u062F\u0629 \u0623\u0648 \u062F\u0628\u0644\u0648\u0645 \u0645\u0647\u0646\u064A \u0645\u062A\u0642\u062F\u0645 \u0641\u064A \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0636\u064A\u0627\u0641\u0629 \u0623\u0648 \u0627\u0644\u0633\u064A\u0627\u062D\u0629 \u0623\u0648 \u0641\u0646\u0648\u0646 \u0627\u0644\u0637\u0647\u064A \u0645\u0641\u0636\u0644\u0629 \u0644\u0644\u0645\u0646\u0627\u0635\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629.",
    },
    certifications: [
      { name: "Ajeer Platform Registration", body: "HRSD", timeline: "Required for all hospitality workers" },
      { name: "Tourism Business License", body: "Ministry of Tourism", timeline: "5-10 business days" },
    ],
    topSkills: ["Luxury guest experience & VIP services", "Event & festival management (Riyadh Season, F1)", "Sustainable tourism practices", "Digital hospitality (AI-driven PMS, dynamic pricing)", "Multilingual communication"],
    competitiveEdge: ["Ultra-luxury 5-star or boutique hotel experience", "Michelin-star fine dining operations", "Heritage tourism curation", "European languages (French, German, Spanish) or Mandarin", "Eco-resort / sustainable tourism background"],
    gccAdvantage: {
      en: "Gulf hospitality experience is a massive differentiator. The Gulf market demands unparalleled luxury standards, unique cultural protocols, and the ability to operate massive isolated desert resorts.",
      ar: "\u062E\u0628\u0631\u0629 \u0627\u0644\u0636\u064A\u0627\u0641\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u0639\u0627\u0645\u0644 \u062A\u0645\u064A\u064A\u0632 \u0643\u0628\u064A\u0631. \u0633\u0648\u0642 \u0627\u0644\u062E\u0644\u064A\u062C \u064A\u062A\u0637\u0644\u0628 \u0645\u0639\u0627\u064A\u064A\u0631 \u0641\u062E\u0627\u0645\u0629 \u0644\u0627 \u0645\u062B\u064A\u0644 \u0644\u0647\u0627 \u0648\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644\u0627\u062A \u062B\u0642\u0627\u0641\u064A\u0629 \u0641\u0631\u064A\u062F\u0629 \u0648\u0625\u062F\u0627\u0631\u0629 \u0645\u0646\u062A\u062C\u0639\u0627\u062A \u0635\u062D\u0631\u0627\u0648\u064A\u0629 \u0645\u0639\u0632\u0648\u0644\u0629.",
    },
  },
  admin: {
    degree: {
      en: "Bachelor\u2019s in Human Resources, Business Administration, or Organizational Psychology.",
      ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0645\u0648\u0627\u0631\u062F \u0628\u0634\u0631\u064A\u0629 \u0623\u0648 \u0625\u062F\u0627\u0631\u0629 \u0623\u0639\u0645\u0627\u0644 \u0623\u0648 \u0639\u0644\u0645 \u0646\u0641\u0633 \u062A\u0646\u0638\u064A\u0645\u064A.",
    },
    certifications: [
      { name: "CIPD (Level 5 or 7) or SHRM-CP/SCP", body: "CIPD (UK) / SHRM (US)", timeline: "Self-paced, strongly recommended" },
    ],
    topSkills: ["Saudi Labor Law & Nitaqat compliance mastery", "HRIS & digital payroll (ATS, cloud platforms)", "Talent retention & upskilling program design", "Predictive HR analytics", "Change management"],
    competitiveEdge: ["CIPD Level 7 (favored by multinationals/government)", "Hands-on Qiwa portal mastery", "Deep Saudi labor law knowledge", "Muqeem platform experience", "Kafala system navigation expertise"],
    gccAdvantage: {
      en: "GCC HR experience is essential. The Gulf operates on unique sponsorship systems (Kafala), complex visa matrices, and strict nationalization quotas.",
      ar: "\u062E\u0628\u0631\u0629 \u0627\u0644\u0645\u0648\u0627\u0631\u062F \u0627\u0644\u0628\u0634\u0631\u064A\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u0636\u0631\u0648\u0631\u064A\u0629. \u0627\u0644\u062E\u0644\u064A\u062C \u064A\u0639\u0645\u0644 \u0628\u0646\u0638\u0627\u0645 \u0643\u0641\u0627\u0644\u0629 \u0641\u0631\u064A\u062F \u0648\u0645\u0635\u0641\u0648\u0641\u0627\u062A \u062A\u0623\u0634\u064A\u0631\u0627\u062A \u0645\u0639\u0642\u062F\u0629 \u0648\u062D\u0635\u0635 \u062A\u0648\u0637\u064A\u0646 \u0635\u0627\u0631\u0645\u0629.",
    },
  },
  logistics: {
    degree: {
      en: "High school diploma sufficient for commercial drivers. Bachelor\u2019s in Supply Chain Management, Logistics, or Industrial Engineering for analysts/managers.",
      ar: "\u0634\u0647\u0627\u062F\u0629 \u062B\u0627\u0646\u0648\u064A\u0629 \u0643\u0627\u0641\u064A\u0629 \u0644\u0644\u0633\u0627\u0626\u0642\u064A\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u064A\u0646. \u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0625\u062F\u0627\u0631\u0629 \u0633\u0644\u0633\u0644\u0629 \u0625\u0645\u062F\u0627\u062F \u0623\u0648 \u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0623\u0648 \u0647\u0646\u062F\u0633\u0629 \u0635\u0646\u0627\u0639\u064A\u0629 \u0644\u0644\u0645\u062D\u0644\u0644\u064A\u0646 \u0648\u0627\u0644\u0645\u062F\u064A\u0631\u064A\u0646.",
    },
    certifications: [
      { name: "TGA License", body: "Transport General Authority", timeline: "2-4 weeks for operational licenses" },
      { name: "APICS CPIM or CSCP (for managers)", body: "ASCM", timeline: "Self-paced" },
    ],
    topSkills: ["Supply chain analytics (Tableau, Power BI)", "ERP & WMS (SAP, Oracle)", "Vendor & procurement management", "Telematics & IoT fleet integration", "Risk management & resilient logistics networks"],
    competitiveEdge: ["Blockchain supply chain tracking experience", "Green logistics / route optimization for net-zero", "Cold chain management in extreme heat", "Cross-border GCC customs expertise", "Predictive analytics certification"],
    gccAdvantage: {
      en: "GCC logistics experience is paramount. The Gulf has unique cross-border customs protocols, massive port infrastructure networks, and temperature-sensitive cold chains in extreme heat.",
      ar: "\u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u0628\u0627\u0644\u063A\u0629 \u0627\u0644\u0623\u0647\u0645\u064A\u0629. \u0627\u0644\u062E\u0644\u064A\u062C \u064A\u062A\u0645\u064A\u0632 \u0628\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644\u0627\u062A \u062C\u0645\u0631\u0643\u064A\u0629 \u0639\u0627\u0628\u0631\u0629 \u0644\u0644\u062D\u062F\u0648\u062F \u0641\u0631\u064A\u062F\u0629 \u0648\u0634\u0628\u0643\u0627\u062A \u0628\u0646\u064A\u0629 \u062A\u062D\u062A\u064A\u0629 \u0636\u062E\u0645\u0629 \u0648\u0633\u0644\u0627\u0633\u0644 \u062A\u0628\u0631\u064A\u062F \u062D\u0633\u0627\u0633\u0629.",
    },
  },
  security: {
    degree: {
      en: "High school diploma for basic roles. Bachelor\u2019s or advanced diploma in Occupational Health & Safety for Safety Officers and HSE Managers.",
      ar: "\u0634\u0647\u0627\u062F\u0629 \u062B\u0627\u0646\u0648\u064A\u0629 \u0644\u0644\u0623\u062F\u0648\u0627\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629. \u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0623\u0648 \u062F\u0628\u0644\u0648\u0645 \u0645\u062A\u0642\u062F\u0645 \u0641\u064A \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u0627\u0644\u0635\u062D\u0629 \u0627\u0644\u0645\u0647\u0646\u064A\u0629 \u0644\u0645\u0633\u0624\u0648\u0644\u064A \u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u0645\u062F\u064A\u0631\u064A HSE.",
    },
    certifications: [
      { name: "NEBOSH / IOSH / OSHA", body: "International bodies", timeline: "Self-paced" },
      { name: "Civil Defense Permit", body: "General Directorate of Civil Defense", timeline: "Via Salamah platform, timeline varies by site inspection" },
    ],
    topSkills: ["Threat detection (physical + cyber-physical)", "Emergency response & evacuation", "Fire safety & Civil Defense compliance", "Surveillance tech (CCTV, biometrics, AI perimeter defense)", "Occupational Health & Safety (HSE)"],
    competitiveEdge: ["NEBOSH + core technical certification combo", "Military/intelligence/law enforcement background", "Digital security systems integration", "Multilingual camp management experience", "Note: frontline guarding is 100% reserved for Saudis"],
    gccAdvantage: {
      en: "GCC experience provides deep contextual awareness of Gulf civil defense standards, multinational labor camp safety protocols, and critical infrastructure protection.",
      ar: "\u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u062A\u0648\u0641\u0631 \u0648\u0639\u064A\u0627\u064B \u0639\u0645\u064A\u0642\u0627\u064B \u0628\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062F\u0641\u0627\u0639 \u0627\u0644\u0645\u062F\u0646\u064A \u0627\u0644\u062E\u0644\u064A\u062C\u064A\u0629 \u0648\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644\u0627\u062A \u0633\u0644\u0627\u0645\u0629 \u0645\u0639\u0633\u0643\u0631\u0627\u062A \u0627\u0644\u0639\u0645\u0644 \u0648\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0628\u0646\u064A\u0629 \u0627\u0644\u062A\u062D\u062A\u064A\u0629 \u0627\u0644\u062D\u064A\u0648\u064A\u0629.",
    },
  },
};

/** Map sector_id from master.json to occupation category */
export const SECTOR_CATEGORY_MAP: Record<string, OccupationCategory> = {
  healthcare: "healthcare",
  health_social: "healthcare",
  construction: "construction",
  manufacturing: "engineering",
  finance_insurance: "finance",
  it_communication: "it",
  information_comm: "it",
  wholesale_retail: "sales_marketing",
  retail: "sales_marketing",
  education: "education",
  accommodation_food: "hospitality",
  hospitality: "hospitality",
  admin_support: "admin",
  transport_storage: "logistics",
  logistics: "logistics",
  professional_scientific: "engineering",
  mining_quarrying: "engineering",
  real_estate: "finance",
  arts_entertainment: "hospitality",
  public_admin: "admin",
  agriculture: "construction",
  water_waste: "engineering",
  electricity_gas: "engineering",
  other_services: "admin",
  extraterritorial: "admin",
};

/** Get the category for a given sector_id */
export function getCategoryForSector(sectorId: string): OccupationCategory {
  return SECTOR_CATEGORY_MAP[sectorId] || "admin";
}
