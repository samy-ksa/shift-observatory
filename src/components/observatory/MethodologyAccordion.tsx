"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import { useLang } from "@/lib/i18n/context";

interface AccordionItem {
  title: string;
  content: string;
}

function getItems(panels: {
  data: string;
  scoring: string;
  limitations: string;
  about: string;
  changelog: string;
}): AccordionItem[] {
  return [
    {
      title: panels.data,
      content: `LABOR MARKET
\u2022 GASTAT Register-based Labor Market Statistics (GOSI) Q3 2025
  13 administrative regions, 20 ISIC Rev.4 sectors
  Source: General Authority for Statistics via GLMM

\u2022 GASTAT Labor Force Survey Q3 2025
  Total employment including non-GOSI workers (military, domestic, informal)

AI EXPOSURE INDICES
\u2022 Frey, C.B. & Osborne, M.A. (2017). "The Future of Employment: How Susceptible Are Jobs to Computerisation?" Oxford University.
  702 occupations scored on automation probability (0\u201399%)

\u2022 Eloundou, T. et al. (2023). "GPTs are GPTs: An Early Look at the Labor Market Impact Potential of Large Language Models." OpenAI/UPenn.
  Exposure score (0\u20131) measuring % of tasks affected by LLMs.

\u2022 Felten, E., Raj, M. & Seamans, R. (2021\u20132023). "AI Occupational Exposure Index (AIOE)." Updated annually.

\u2022 Brynjolfsson, E. et al. "Suitability for Machine Learning (SML)." Stanford Digital Economy Lab.

INDUSTRY REPORTS
\u2022 McKinsey Global Institute (2024). "A New Future of Work."
\u2022 World Economic Forum (2025). "Future of Jobs Report 2025."
\u2022 PwC Middle East (2024). AI contribution to KSA GDP: $135.2B by 2030.
\u2022 Oliver Wyman / SDAIA (2024). GenAI impact: $24B by 2030.

LAYOFFS DATA
\u2022 Layoffs.fyi via TechCrunch monthly compilations (2024\u20132025)
\u2022 Challenger, Gray & Christmas (2025). AI-cited layoffs tracker (US).`,
    },
    {
      title: panels.scoring,
      content: `SECTOR SCORES (0\u2013100)
Base: McKinsey "% of hours technically automatable by 2030" per sector
Adjusted for:
  \u2022 GenAI exposure (white-collar cognitive tasks vs blue-collar manual)
  \u2022 KSA-specific context (construction boom = protected short-term)
  \u2022 V2030 growth trajectory (growing sectors penalized less)

OCCUPATION SCORES (0\u2013100)
Composite formula:
  Score = (Eloundou \u00D7 35%) + (Frey-Osborne \u00D7 35%) + (Felten \u00D7 15%) + (Category \u00D7 15%)

Where:
  \u2022 Eloundou (0\u20131) normalized to 0\u2013100
  \u2022 Frey-Osborne already 0\u2013100%
  \u2022 Felten AIOE mapped: Very High=90, High=70, Moderate=50, Low=30, Very Low=15
  \u2022 Category mapped: Substitution=90, Partial Substitution=65, Augmentation=35

EXPAT RISK OVERLAY (Nitaqat)
When "Expat" toggle is active, +15\u201325 points added based on:
  \u2022 Current Saudization rate for the profession
  \u2022 2028 target Saudization rate
  \u2022 Whether profession is closed to expats

REGIONAL SCORES
Weighted average of dominant sectors in each region.`,
    },
    {
      title: panels.limitations,
      content: `DATA GAPS
\u2022 GOSI covers 12.42M workers vs LFS 18.54M total. Gap of ~6M includes military, domestic workers, and informal sector \u2014 not captured here.
\u2022 Saudization rates available for only ~12 professions. Many show "n.d."
\u2022 Salary data by occupation not available in structured form.
\u2022 Employer headcounts: several are LinkedIn estimates, not official reports.

METHODOLOGICAL LIMITATIONS
\u2022 AI risk scores measure EXPOSURE, not predicted job LOSS. A score of 70 means 70% of tasks in that occupation could be affected by AI \u2014 not that 70% of workers will be laid off.
\u2022 Augmentation \u2260 Substitution. Many high-exposure jobs (lawyers, programmers, financial analysts) will be TRANSFORMED, not eliminated.
\u2022 Scores are based on Western academic studies. KSA labor market structure (high expat share, Nitaqat, giga-project construction boom) creates unique dynamics not fully captured.
\u2022 V2030 targets have significant overlap. Our "2.3M net" applies a 30% deduction for double-counting.
\u2022 Layoffs.fyi has geographic bias toward US/Europe tech sector.

TEMPORAL LIMITATIONS
\u2022 Academic indices (Frey-Osborne 2017, Felten 2021) pre-date the GenAI revolution. Eloundou 2023 captures LLM impact but not multimodal AI or autonomous agents.
\u2022 The pace of AI capability improvement may make these scores conservative within 2\u20133 years.`,
    },
    {
      title: panels.about,
      content: `SHIFT Observatory tracks the collision between artificial intelligence and employment in Saudi Arabia \u2014 the world's most ambitious economic transformation meeting the most disruptive technology of our era.

This is not a prediction engine. It's a compass.

We believe informed workers make better career decisions. Whether you're a Saudi professional planning your next move, an expat assessing your position, or a policy maker designing workforce programs \u2014 the data should be accessible, transparent, and honest.

Built with data. Not fear.`,
    },
    {
      title: panels.changelog,
      content: `V1.0 (February 2026)
\u2022 Initial release
\u2022 20 ISIC sectors with GASTAT GOSI Q3 2025 data
\u2022 49 occupations scored across 3 AI exposure indices
\u2022 13 administrative regions
\u2022 24 months of global tech layoffs data
\u2022 10 KSA/Gulf AI automation case studies
\u2022 12 Vision 2030 sector employment targets
\u2022 WEF Future of Jobs 2025 growth/decline rankings

PLANNED FOR V1.1
\u2022 Arabic language support
\u2022 ISCO-08 occupation breakdown
\u2022 Salary data by occupation/nationality
\u2022 Gulf comparative benchmarks (UAE, Qatar, Bahrain)
\u2022 Giga-projects detailed workforce data`,
    },
  ];
}

function AccordionPanel({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border-b border-white/5 transition-colors ${
        isOpen ? "border-l-[3px] border-l-accent-primary" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg-card-hover transition-colors text-left"
      >
        <span className="text-sm font-semibold text-text-primary">
          {item.title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted text-sm"
        >
          &#9654;
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <pre className="text-sm text-text-secondary leading-[1.7] font-mono whitespace-pre-wrap">
                {item.content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MethodologyAccordion() {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = getItems(t.methodology.panels);

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title={t.methodology.title}
          subtitle={t.methodology.subtitle}
          id="about"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-bg-card rounded-2xl card-glow overflow-hidden"
        >
          {items.map((item, i) => (
            <AccordionPanel
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
