"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import InfoTooltip from "@/components/shared/InfoTooltip";
import { useLang, formatNumber } from "@/lib/i18n/context";
import data from "@/data/master.json";

const monthly2024 = data.layoffs.monthly["2024"].map((m) => ({
  name: m.month + " '24",
  total: m.total,
  year: 2024,
}));

const monthly2025 = data.layoffs.monthly["2025"].map((m) => ({
  name: m.month + " '25",
  total: m.total,
  year: 2025,
}));

const monthly2026 = (data.layoffs.monthly as Record<string, Array<{ month: string; total: number; top3: string }>>)["2026"]?.map((m) => ({
  name: m.month + " '26",
  total: m.total,
  year: 2026,
})) ?? [];

const chartData = [...monthly2024, ...monthly2025, ...monthly2026];

const challenger = data.layoffs.challenger;

// International AI layoff cases
interface CaseItem {
  entity: string;
  jobs: number | null;
  reason: string;
  date: string;
  status: "confirmed" | "probable";
  country: string;
  flag: string;
  ai_role: "direct" | "contributing" | "suspected";
}

/** Build the Gulf cases list localized per language. Called inside the
 *  component so it picks up the active lang from useLang(). */
function buildGulfCases(lang: "en" | "fr" | "ar"): CaseItem[] {
  return data.ksa_ai_cases.map((c) => {
    const localizedImpact =
      lang === "fr"
        ? (c as { impact_fr?: string }).impact_fr || c.impact
        : lang === "ar"
          ? (c as { impact_ar?: string }).impact_ar || c.impact
          : c.impact;
    return {
      entity: lang === "ar" ? c.entity_ar : lang === "fr" ? c.entity_fr : c.entity,
      jobs: typeof c.jobs_impact === "number" ? c.jobs_impact : null,
      reason: localizedImpact,
      date: "",
      status: "confirmed" as const,
      country: c.country,
      flag: c.country === "KSA" ? "SA" : "AE",
      ai_role: "direct" as const,
    };
  });
}

const internationalCases: CaseItem[] = [
  // ===== 2026 H1 (most recent first) =====
  { entity: "Meta", jobs: 8000, reason: "10% workforce cut, Trust & Safety AI moderation replaced humans", date: "May 2026", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Microsoft", jobs: 12000, reason: "AI capex pivot, buyouts + cuts as payroll converts to GPU spend", date: "Apr 2026", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Oracle", jobs: 30000, reason: "Largest layoff in 49-yr history, Cerner/OCI/ERP cut to fund $50B AI infra (Stargate)", date: "Mar 2026", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Atlassian", jobs: 1600, reason: "Q1 2026 restructuring, AI-first product strategy", date: "Mar 2026", status: "confirmed", country: "Australia", flag: "AU", ai_role: "direct" },
  { entity: "Broadcom", jobs: 1200, reason: "Post-acquisition consolidation, AI workflow automation", date: "Mar 2026", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Salesforce", jobs: 4000, reason: "Customer support cut, Benioff: 'I need less heads' — Agentforce AI", date: "Q1 2026", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Amazon (Corp)", jobs: 16000, reason: "Corporate roles cut, AI-driven workflow consolidation", date: "Jan 2026", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  // ===== 2024-2025 (existing) =====
  { entity: "Google (Ads)", jobs: 1000, reason: "AI-powered ad products replacing account management", date: "Jan 2024", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Chegg", jobs: 468, reason: "ChatGPT destroying homework help demand", date: "Oct 2025", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Klarna", jobs: 700, reason: "AI assistant replaced 700 FTE equivalent", date: "Feb 2024", status: "confirmed", country: "Sweden", flag: "SE", ai_role: "direct" },
  { entity: "BT Group", jobs: 10000, reason: "10K of 55K cuts AI/automation by 2030", date: "May 2023", status: "confirmed", country: "UK", flag: "GB", ai_role: "direct" },
  { entity: "IBM", jobs: 7800, reason: "Hiring freeze on AI-replaceable back-office", date: "May 2023", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Stack Overflow", jobs: 150, reason: "Developers switching to AI assistants", date: "Oct 2023", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Duolingo", jobs: null, reason: "10% contractors replaced by GPT-4 translation", date: "Jan 2024", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Paycom", jobs: 500, reason: "Back-office automation, 8% workforce", date: "Oct 2025", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Deepwatch", jobs: 70, reason: "AI platform NEXA replaced security analysts", date: "Nov 2025", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Indeed/Glassdoor", jobs: 1300, reason: "AI-powered job matching replacing manual R&D", date: "Jul 2025", status: "probable", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Just Eat Takeaway", jobs: 450, reason: "Customer service and sales admin automated", date: "Sep 2025", status: "probable", country: "Netherlands", flag: "NL", ai_role: "contributing" },
  { entity: "SAP", jobs: 8000, reason: "Restructuring to focus on AI, largest layoff wave", date: "Jan 2024", status: "probable", country: "Germany", flag: "DE", ai_role: "contributing" },
  { entity: "UiPath", jobs: 420, reason: "AI automation vendor restructuring own workforce", date: "Jun 2024", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Dropbox", jobs: 500, reason: "AI-first strategy replacing core product teams", date: "Apr 2024", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Cisco", jobs: 5500, reason: "Shifting resources to AI and cybersecurity", date: "Aug 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Intel", jobs: 15000, reason: "AI strategy pivot, foundry restructuring", date: "Aug 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Dell Technologies", jobs: 12500, reason: "AI-driven efficiency and sales restructuring", date: "Feb 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Tesla", jobs: 14000, reason: "Automation and AI integration across operations", date: "Apr 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Microsoft", jobs: 1900, reason: "Gaming division restructuring post-Activision", date: "Jan 2024", status: "confirmed", country: "US", flag: "US", ai_role: "suspected" },
  { entity: "Amazon (Alexa)", jobs: 660, reason: "AI pivot, Alexa division restructured for LLMs", date: "Nov 2023", status: "confirmed", country: "US", flag: "US", ai_role: "direct" },
  { entity: "Spotify", jobs: 1500, reason: "Efficiency drive, AI content tools reducing headcount", date: "Dec 2023", status: "confirmed", country: "Sweden", flag: "SE", ai_role: "contributing" },
  { entity: "Unity", jobs: 1800, reason: "AI tooling reducing need for manual content teams", date: "Jan 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Snap", jobs: 540, reason: "Restructuring amid AI-driven ad competition", date: "Feb 2024", status: "confirmed", country: "US", flag: "US", ai_role: "suspected" },
  { entity: "eBay", jobs: 1000, reason: "AI-powered seller tools reducing support staff", date: "Jan 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Xerox", jobs: 3000, reason: "AI and automation transforming print operations", date: "Jan 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "DocuSign", jobs: 400, reason: "AI contract analysis reducing manual review teams", date: "Feb 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Bumble", jobs: 350, reason: "AI matching algorithms reducing curation teams", date: "Feb 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
  { entity: "Workday", jobs: 1750, reason: "AI-driven HR tech reducing own HR operations", date: "Feb 2025", status: "confirmed", country: "US", flag: "US", ai_role: "suspected" },
  { entity: "Freshworks", jobs: 660, reason: "AI customer service tools consolidating teams", date: "Nov 2024", status: "confirmed", country: "US", flag: "US", ai_role: "contributing" },
];

/* Gulf case description AR mapping */
const GULF_CASE_AR: Record<string, string> = {
  "AI-powered financial planning replacing advisors": "التخطيط المالي بالذكاء الاصطناعي يحل محل المستشارين",
  "AI routing & fleet optimization": "تحسين المسارات والأسطول بالذكاء الاصطناعي",
  "AI-driven checkout & inventory": "الدفع الذاتي وإدارة المخزون بالذكاء الاصطناعي",
  "GPT-4 Arabic content replacing writers": "المحتوى العربي بـ GPT-4 يحل محل الكتّاب",
  "SAP S/4HANA automation of back-office": "أتمتة المكاتب الخلفية عبر SAP S/4HANA",
  "AI underwriting replacing manual review": "الاكتتاب بالذكاء الاصطناعي يحل محل المراجعة اليدوية",
  "AI camera analytics replacing guards": "تحليلات الكاميرا الذكية تحل محل الحراس",
  "Digital banking replacing branch staff": "الخدمات المصرفية الرقمية تحل محل موظفي الفروع",
  "Robotic process automation in admin": "أتمتة العمليات الروبوتية في الإدارة",
  "AI diagnostics reducing lab staff": "التشخيص بالذكاء الاصطناعي يقلل طاقم المختبر",
};

/* International case description AR mapping */
const INTL_CASE_AR: Record<string, string> = {
  // 2026 H1
  "10% workforce cut, Trust & Safety AI moderation replaced humans": "تخفيض 10% من القوى العاملة، الإشراف بالذكاء الاصطناعي يحل محل البشر",
  "AI capex pivot, buyouts + cuts as payroll converts to GPU spend": "تحول استثمارات الذكاء الاصطناعي، استبدال الرواتب بإنفاق GPU",
  "Largest layoff in 49-yr history, Cerner/OCI/ERP cut to fund $50B AI infra (Stargate)": "أكبر تسريح في تاريخ أوراكل الممتد 49 عاماً، تخفيض Cerner/OCI/ERP لتمويل بنية الذكاء الاصطناعي بقيمة $50B",
  "Q1 2026 restructuring, AI-first product strategy": "إعادة هيكلة Q1 2026، استراتيجية المنتج المعتمدة على الذكاء الاصطناعي أولاً",
  "Post-acquisition consolidation, AI workflow automation": "دمج ما بعد الاستحواذ، أتمتة سير العمل بالذكاء الاصطناعي",
  "Customer support cut, Benioff: 'I need less heads' — Agentforce AI": "تخفيض دعم العملاء، Benioff: «أحتاج عدد أقل من الموظفين» — Agentforce AI",
  "Corporate roles cut, AI-driven workflow consolidation": "تخفيض الأدوار المؤسسية، دمج سير العمل بالذكاء الاصطناعي",
  // Existing 2024-2025
  "AI-powered ad products replacing account management": "منتجات الإعلانات بالذكاء الاصطناعي تحل محل إدارة الحسابات",
  "ChatGPT destroying homework help demand": "ChatGPT يقضي على الطلب على مساعدة الواجبات",
  "AI assistant replaced 700 FTE equivalent": "مساعد ذكاء اصطناعي حل محل 700 موظف بدوام كامل",
  "10K of 55K cuts AI/automation by 2030": "10K من أصل 55K وظيفة خُفضت بسبب الذكاء الاصطناعي والأتمتة بحلول 2030",
  "Hiring freeze on AI-replaceable back-office": "تجميد توظيف الوظائف المكتبية القابلة للاستبدال بالذكاء الاصطناعي",
  "Developers switching to AI assistants": "المطورون يتحولون إلى مساعدي الذكاء الاصطناعي",
  "10% contractors replaced by GPT-4 translation": "10% من المتعاقدين استُبدلوا بترجمة GPT-4",
  "Back-office automation, 8% workforce": "أتمتة المكاتب الخلفية، 8% من القوى العاملة",
  "AI platform NEXA replaced security analysts": "منصة NEXA الذكية حلت محل محللي الأمن",
  "AI-powered job matching replacing manual R&D": "مطابقة الوظائف بالذكاء الاصطناعي تحل محل البحث اليدوي",
  "Customer service and sales admin automated": "أتمتة خدمة العملاء وإدارة المبيعات",
  "Restructuring to focus on AI, largest layoff wave": "إعادة هيكلة للتركيز على الذكاء الاصطناعي، أكبر موجة تسريح",
  "AI automation vendor restructuring own workforce": "شركة أتمتة ذكية تعيد هيكلة قوتها العاملة",
  "AI-first strategy replacing core product teams": "استراتيجية الذكاء الاصطناعي أولاً تستبدل فرق المنتج",
  "Shifting resources to AI and cybersecurity": "تحويل الموارد إلى الذكاء الاصطناعي والأمن السيبراني",
  "AI strategy pivot, foundry restructuring": "تحول استراتيجي نحو الذكاء الاصطناعي وإعادة هيكلة المصانع",
  "AI-driven efficiency and sales restructuring": "كفاءة وإعادة هيكلة المبيعات بالذكاء الاصطناعي",
  "Automation and AI integration across operations": "الأتمتة ودمج الذكاء الاصطناعي عبر العمليات",
  "Gaming division restructuring post-Activision": "إعادة هيكلة قسم الألعاب بعد Activision",
  "AI pivot, Alexa division restructured for LLMs": "تحول نحو الذكاء الاصطناعي، إعادة هيكلة Alexa للنماذج اللغوية",
  "Efficiency drive, AI content tools reducing headcount": "حملة كفاءة، أدوات محتوى ذكية تقلل عدد الموظفين",
  "AI tooling reducing need for manual content teams": "أدوات الذكاء الاصطناعي تقلل الحاجة لفرق المحتوى",
  "Restructuring amid AI-driven ad competition": "إعادة هيكلة وسط منافسة إعلانية بالذكاء الاصطناعي",
  "AI-powered seller tools reducing support staff": "أدوات بائعين ذكية تقلل فريق الدعم",
  "AI and automation transforming print operations": "الذكاء الاصطناعي والأتمتة يحولان عمليات الطباعة",
  "AI contract analysis reducing manual review teams": "تحليل العقود بالذكاء الاصطناعي يقلل فرق المراجعة",
  "AI matching algorithms reducing curation teams": "خوارزميات المطابقة الذكية تقلل فرق التنسيق",
  "AI-driven HR tech reducing own HR operations": "تقنية الموارد البشرية الذكية تقلل عمليات الشركة",
  "AI customer service tools consolidating teams": "أدوات خدمة عملاء ذكية تدمج الفرق",
};

const INTL_CASE_FR: Record<string, string> = {
  "10% workforce cut, Trust & Safety AI moderation replaced humans": "Réduction de 10% des effectifs ; la modération IA de Trust & Safety remplace des humains",
  "AI capex pivot, buyouts + cuts as payroll converts to GPU spend": "Réorientation des investissements vers l’IA ; rachats et suppressions de postes au profit des dépenses GPU",
  "Largest layoff in 49-yr history, Cerner/OCI/ERP cut to fund $50B AI infra (Stargate)": "Plus grand licenciement en 49 ans ; Cerner/OCI/ERP réduits pour financer $50B d’infrastructure IA (Stargate)",
  "Q1 2026 restructuring, AI-first product strategy": "Restructuration Q1 2026 ; stratégie produit centrée sur l’IA",
  "Post-acquisition consolidation, AI workflow automation": "Regroupement après acquisition et automatisation des flux par l’IA",
  "Customer support cut, Benioff: 'I need less heads' — Agentforce AI": "Réduction du support client ; Benioff : « J’ai besoin de moins de personnel » — Agentforce AI",
  "Corporate roles cut, AI-driven workflow consolidation": "Suppression de postes administratifs ; regroupement des flux de travail grâce à l’IA",
  "AI-powered ad products replacing account management": "Les produits publicitaires IA remplacent la gestion des comptes",
  "ChatGPT destroying homework help demand": "ChatGPT réduit la demande d’aide aux devoirs",
  "AI assistant replaced 700 FTE equivalent": "Un assistant IA a remplacé l’équivalent de 700 emplois à temps plein",
  "10K of 55K cuts AI/automation by 2030": "10K des 55K suppressions dues à l’IA ou à l’automatisation d’ici 2030",
  "Hiring freeze on AI-replaceable back-office": "Gel du recrutement pour les postes administratifs remplaçables par l’IA",
  "Developers switching to AI assistants": "Les développeurs passent aux assistants IA",
  "10% contractors replaced by GPT-4 translation": "10% des contractuels remplacés par la traduction GPT-4",
  "Back-office automation, 8% workforce": "Automatisation administrative ; 8% des effectifs",
  "AI platform NEXA replaced security analysts": "La plateforme IA NEXA remplace des analystes de sécurité",
  "AI-powered job matching replacing manual R&D": "La mise en relation IA remplace la R&D manuelle",
  "Customer service and sales admin automated": "Automatisation du service client et de l’administration des ventes",
  "Restructuring to focus on AI, largest layoff wave": "Restructuration axée sur l’IA ; plus grande vague de licenciements",
  "AI automation vendor restructuring own workforce": "Un fournisseur d’automatisation IA restructure ses propres effectifs",
  "AI-first strategy replacing core product teams": "La stratégie centrée sur l’IA remplace des équipes produit",
  "Shifting resources to AI and cybersecurity": "Ressources transférées vers l’IA et la cybersécurité",
  "AI strategy pivot, foundry restructuring": "Réorientation vers l’IA et restructuration des fonderies",
  "AI-driven efficiency and sales restructuring": "Efficacité par l’IA et restructuration des ventes",
  "Automation and AI integration across operations": "Automatisation et intégration de l’IA dans les opérations",
  "Gaming division restructuring post-Activision": "Restructuration de la division jeux après Activision",
  "AI pivot, Alexa division restructured for LLMs": "Réorientation IA ; division Alexa restructurée pour les modèles linguistiques",
  "Efficiency drive, AI content tools reducing headcount": "Recherche d’efficacité ; les outils de contenu IA réduisent les effectifs",
  "AI tooling reducing need for manual content teams": "Les outils IA réduisent le besoin d’équipes de contenu manuel",
  "Restructuring amid AI-driven ad competition": "Restructuration face à la concurrence publicitaire portée par l’IA",
  "AI-powered seller tools reducing support staff": "Les outils IA pour vendeurs réduisent le personnel de support",
  "AI and automation transforming print operations": "L’IA et l’automatisation transforment les opérations d’impression",
  "AI contract analysis reducing manual review teams": "L’analyse IA des contrats réduit les équipes de vérification manuelle",
  "AI matching algorithms reducing curation teams": "Les algorithmes IA de mise en relation réduisent les équipes de sélection",
  "AI-driven HR tech reducing own HR operations": "La technologie RH fondée sur l’IA réduit les opérations RH internes",
  "AI customer service tools consolidating teams": "Les outils IA de service client regroupent les équipes",
};

const MONTHS_AR: Record<string, string> = { Jan: "يناير", Feb: "فبراير", Mar: "مارس", Apr: "أبريل", May: "مايو", Jun: "يونيو", Jul: "يوليو", Aug: "أغسطس", Sep: "سبتمبر", Oct: "أكتوبر", Nov: "نوفمبر", Dec: "ديسمبر" };
const MONTHS_FR: Record<string, string> = { Jan: "janv.", Feb: "févr.", Mar: "mars", Apr: "avr.", May: "mai", Jun: "juin", Jul: "juil.", Aug: "août", Sep: "sept.", Oct: "oct.", Nov: "nov.", Dec: "déc." };
function localizeDate(date: string, lang: "ar" | "fr") { return date.replace(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/g, (m) => (lang === "ar" ? MONTHS_AR : MONTHS_FR)[m]); }

type CaseTab = "gulf" | "international" | "all";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AiRoleBadge({ role, t }: { role: "direct" | "contributing" | "suspected"; t: any }) {
  const config = {
    direct: { label: t.layoffs.confirmed, className: "bg-red-500/20 text-red-400 border border-red-800/30" },
    contributing: { label: t.layoffs.probable, className: "bg-amber-500/20 text-amber-400 border border-amber-800/30" },
    suspected: { label: t.layoffs.suspected, className: "bg-gray-500/20 text-gray-400 border border-gray-800/30" },
  };
  const c = config[role];
  return <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${c.className}`}>{c.label}</span>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label, lang, jobsLabel }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-text-primary mb-1">{label}</p>
      <p className="text-sm font-mono text-text-secondary">
        {payload[0].value.toLocaleString(lang === "ar" ? "ar-SA" : "en-US")} {jobsLabel}
      </p>
    </div>
  );
};

export default function LayoffsSection() {
  const { t, lang } = useLang();
  const [caseTab, setCaseTab] = useState<CaseTab>("gulf");
  const [showAllIntl, setShowAllIntl] = useState(false);

  // Localize KSA AI cases descriptions on every render (cheap — 10 items).
  const gulfCases = buildGulfCases(lang);

  // Apply the 12-item limit for international cases when not expanded
  const filteredCases = (() => {
    if (caseTab === "gulf") return gulfCases;
    if (caseTab === "international") {
      return showAllIntl ? internationalCases : internationalCases.slice(0, 12);
    }
    // "all" tab: gulf cases always shown in full, international limited
    const intlSlice = showAllIntl ? internationalCases : internationalCases.slice(0, 12);
    return [...gulfCases, ...intlSlice];
  })();

  const tabLabels: Record<CaseTab, string> = {
    gulf: t.layoffs.tabs.gulf,
    international: t.layoffs.tabs.international,
    all: t.layoffs.tabs.all,
  };

  const tabCounts: Record<CaseTab, number> = {
    gulf: gulfCases.length,
    international: internationalCases.length,
    all: gulfCases.length + internationalCases.length,
  };

  // Determine if the show all / show less toggle should appear
  const showToggle = (caseTab === "international" || caseTab === "all") && internationalCases.length > 12;
  const totalIntl = internationalCases.length;

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          title={t.layoffs.title}
          subtitle={t.layoffs.subtitle}
          id="layoffs"
        />

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10"
        >
          {[
            {
              label: t.layoffs.kpiLabels.techLayoffs2025,
              value: "122.6K",
              color: "text-text-primary",
              tooltip:
                lang === "ar" ? "إجمالي التسريحات في قطاع التقنية عالمياً خلال 2025. المصدر: Layoffs.fyi." : lang === "fr" ? "Total des licenciements mondiaux dans la tech en 2025. Source : Layoffs.fyi." : "Total tech sector layoffs globally in 2025. Source: Layoffs.fyi.",
            },
            {
              label: t.layoffs.kpiLabels.techLayoffs2026Ytd,
              value: "139K",
              color: "text-text-primary",
              tooltip:
                lang === "ar" ? "إجمالي تسريحات التقنية عالمياً منذ بداية 2026 (حتى 4 نوفمبر). المصدر: Layoffs.fyi." : lang === "fr" ? "Total des licenciements mondiaux dans la tech depuis le début de 2026 (au 4 novembre). Source : Layoffs.fyi." : "Total tech sector layoffs globally in 2026 year-to-date as of 4 Nov. Source: Layoffs.fyi.",
            },
            {
              label: t.layoffs.kpiLabels.oracleMega,
              value: "30K",
              color: "text-risk-very-high",
              tooltip:
                lang === "ar" ? "تسريحات Oracle في 31 مارس 2026 — إلغاء 30,000 وظيفة، وهو الأكبر في تاريخ Oracle الممتد 49 عاماً. تضررت فرق Cerner/OCI/ERP أكثر من غيرها لتمويل بنية Stargate للذكاء الاصطناعي بقيمة $50B. المصدر: CNBC, Time, TechTimes." : lang === "fr" ? "Licenciements d’Oracle le 31 mars 2026 — 30,000 postes supprimés, un record dans ses 49 ans d’histoire. Les équipes Cerner/OCI/ERP sont les plus touchées pour financer l’infrastructure IA Stargate de $50B. Source : CNBC, Time, TechTimes." : "Oracle's March 31, 2026 layoff — 30,000 jobs cut, the largest in Oracle's 49-year history. Cerner/OCI/ERP teams hit hardest to fund the $50B Stargate AI infrastructure buildout. Source: CNBC, Time, TechTimes.",
            },
            {
              label: t.layoffs.kpiLabels.aiCited,
              value: formatNumber(challenger["2026_ytd_ai_cited"], lang),
              color: "text-risk-high",
              tooltip:
                lang === "ar" ? "عدد التسريحات في الولايات المتحدة منذ بداية 2026 التي ذُكر فيها الذكاء الاصطناعي سبباً صريحاً، بعد 54,836 في عام 2025 كله. المصدر: Challenger, Gray & Christmas (تقرير أبريل 2026)." : lang === "fr" ? "Nombre de licenciements aux États-Unis depuis le début de 2026 attribués explicitement à l’IA, contre 54,836 sur toute l’année 2025. Source : Challenger, Gray & Christmas (rapport d’avril 2026)." : "Number of US layoffs in 2026 YTD where AI was explicitly cited as cause. Up from 54,836 in all of 2025. Source: Challenger, Gray & Christmas (April 2026 report).",
            },
            {
              label: t.layoffs.kpiLabels.aiPct2026,
              value: challenger["2026_ytd_ai_pct"] + "%",
              color: "text-risk-high",
              tooltip:
                lang === "ar" ? "نسبة التسريحات الأمريكية منذ بداية 2026 التي ذُكر فيها الذكاء الاصطناعي سبباً صريحاً، مقارنةً بـ 4.6% في 2025. أصبح الذكاء الاصطناعي السبب المعلن #1 للتسريحات في مارس وأبريل 2026. المصدر: Challenger, Gray & Christmas." : lang === "fr" ? "Part des licenciements américains depuis le début de 2026 citant explicitement l’IA, contre 4.6% en 2025. L’IA est la raison déclarée n° 1 des suppressions en mars et avril 2026. Source : Challenger, Gray & Christmas." : "Share of all US layoffs in 2026 YTD that explicitly cited AI as cause — up from 4.6% in 2025. AI is now the #1 stated reason for cuts in March and April 2026. Source: Challenger, Gray & Christmas.",
            },
            {
              label: t.layoffs.kpiLabels.peakAi,
              value: challenger.peak_month.ai_pct + "%",
              color: "text-risk-very-high",
              tooltip:
                lang === "ar" ? "في أبريل 2026، ذُكر الذكاء الاصطناعي سبباً صريحاً في 26% من جميع التسريحات الأمريكية، وهي أعلى نسبة شهرية مسجلة. تصدر الأسباب لشهرين متتاليين (مارس–أبريل 2026). المصدر: Challenger, Gray & Christmas." : lang === "fr" ? "En avril 2026, 26% des licenciements américains citaient explicitement l’IA, part mensuelle record. L’IA a dominé les raisons pendant 2 mois consécutifs (mars–avr. 2026). Source : Challenger, Gray & Christmas." : "In April 2026, 26% of all US layoffs explicitly mentioned AI as cause — highest monthly share ever. AI led all reasons for 2 consecutive months (Mar–Apr 2026). Source: Challenger, Gray & Christmas.",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-bg-card rounded-xl p-4 card-glow"
            >
              <p className="text-xs text-text-muted mb-1">
                {stat.label}
                <InfoTooltip text={stat.tooltip} />
              </p>
              <p className={`text-2xl font-mono font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-bg-card rounded-2xl p-4 md:p-6 card-glow"
        >
          <div className="h-[350px] md:h-[400px]" role="img" aria-label={lang === "ar" ? "مخطط أعمدة للتسريحات الشهرية في قطاع التقنية من 2024 إلى 2026" : lang === "fr" ? "Histogramme des licenciements mensuels dans la tech de 2024 à 2026" : "Bar chart showing monthly tech layoffs from 2024 to 2026"}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  axisLine={{ stroke: "#374151" }}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? (v / 1000).toFixed(0) + "K" : v
                  }
                />
                <Tooltip content={<CustomTooltip lang={lang} jobsLabel={t.layoffs.jobsLabel} />} />
                <ReferenceLine
                  x="Mar '26"
                  stroke="#DC2626"
                  strokeDasharray="3 3"
                  label={{
                    value: t.layoffs.oracleMarker,
                    position: "top",
                    fill: "#DC2626",
                    fontSize: 10,
                    offset: 8,
                  }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => {
                    const fill =
                      entry.year === 2026
                        ? "#DC2626" // red-600 — current year, strongest signal
                        : entry.year === 2025
                          ? "#F59E0B" // amber-500 — prior year
                          : "#6B7280"; // gray-500 — older
                    return <Cell key={i} fill={fill} fillOpacity={0.85} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#6B7280]" /> 2024
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#F59E0B]" /> 2025
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#DC2626]" /> 2026
            </span>
          </div>
        </motion.div>

        {/* AI Cases Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-text-primary mb-6">
            {t.layoffs.title}
          </h3>

          {/* Tab bar */}
          <div className="flex gap-1 bg-bg-secondary rounded-lg p-1 w-fit mb-6">
            {(["gulf", "international", "all"] as CaseTab[]).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  caseTab === tab
                    ? "bg-white/10 text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
                onClick={() => setCaseTab(tab)}
              >
                {tabLabels[tab]}
                <span className={`${lang === "ar" ? "mr-2" : "ml-2"} text-xs text-text-muted/50`}>
                  ({tabCounts[tab]})
                </span>
              </button>
            ))}
          </div>

          {/* Cases grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((c, i) => (
              <motion.div
                key={c.entity + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="bg-bg-card rounded-lg p-4 border border-white/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{c.flag}</span>
                    <span className="font-semibold text-text-primary text-sm">
                      {c.entity}
                    </span>
                  </div>
                  <AiRoleBadge role={c.ai_role} t={t} />
                </div>
                {c.jobs && (
                  <p className="text-risk-high font-mono text-lg font-bold mb-2">
                    -{formatNumber(c.jobs, lang)} {lang === "ar" ? "وظيفة" : lang === "fr" ? "emplois" : "jobs"}
                  </p>
                )}
                <p className="text-sm text-text-secondary mb-2">
                  {lang === "ar"
                    ? (GULF_CASE_AR[c.reason] || INTL_CASE_AR[c.reason] || c.reason)
                    : lang === "fr" ? (INTL_CASE_FR[c.reason] || c.reason) : c.reason}
                </p>
                {c.date && (
                  <p className="text-xs text-text-muted">{lang === "ar" ? localizeDate(c.date, "ar") : lang === "fr" ? localizeDate(c.date, "fr") : c.date}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Show all / Show less toggle */}
          {showToggle && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAllIntl((prev) => !prev)}
                className="px-6 py-3 min-h-11 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
              >
                {showAllIntl
                  ? t.layoffs.showLess
                  : `${t.layoffs.showAll} (${totalIntl})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
