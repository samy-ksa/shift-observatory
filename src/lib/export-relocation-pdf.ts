"use client";

import type { RelocationResult } from "@/data/relocation-data";
import { CITY_EXCHANGE_RATES } from "@/data/relocation-costs";
import type { CityId } from "@/data/relocation-costs";
import { getScoreTrend } from "@/data/score-history";
import { toSlug } from "@/lib/occupations";

/* ================================================================== */
/* Types                                                               */
/* ================================================================== */

export interface RelocationPDFParams {
  lang: "en" | "fr" | "ar" | string;
  result: RelocationResult;
  originName: string;
  saudiName: string;
  originCurrency: string;
  originCurrencySymbol: string;
  originTaxRate: number;
  originId: string;
  saudiId: string;
  originMercer: number;
  saudiMercer: number;
  adults: number;
  children: number;
  housing: string;
  schoolTierLabel: string;
  occupation?: {
    name: string;
    name_en: string;
    composite: number;
    sector_id: string;
    wef_trend: string;
    salary_median_sar: number;
    salary_entry_sar: number;
    salary_senior_sar: number;
    category: string;
    employment_est: number;
  };
}

/* ================================================================== */
/* Constants                                                           */
/* ================================================================== */

const PW = 210;
const PH = 297;
const MG = 20;
const CW = PW - MG * 2;
const CYAN: [number, number, number] = [34, 211, 238];
const DARK: [number, number, number] = [10, 14, 23];

/* ================================================================== */
/* Main export                                                         */
/* ================================================================== */

export async function generateRelocationReport(p: RelocationPDFParams) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const isFr = p.lang === "fr";
  const sym = p.originCurrencySymbol;
  const cur = p.originCurrency;
  const rate = CITY_EXCHANGE_RATES[p.originId as CityId] || 1;
  const taxPct = Math.round(p.originTaxRate);
  const minSal = p.result.saudi_total_sar;
  const recSal = Math.round(minSal * 1.2);
  const monthlySavings = p.result.saudi_savings_sar;
  const fiveYrSavings = Math.round(monthlySavings * 60 + p.result.eosb_5yr_sar);
  const today = new Date().toLocaleDateString(isFr ? "fr-FR" : "en-GB", { year: "numeric", month: "long", day: "numeric" });
  const monthStr = new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", { year: "numeric", month: "long" });
  const oN = p.originName;
  const sN = p.saudiName;

  // Occupation trend
  const occTrend = p.occupation ? getScoreTrend(toSlug(p.occupation.name_en), p.occupation.composite) : null;

  let pageNum = 0;
  const totalPages = p.occupation ? 11 : 10;

  /* ---- Helpers ---- */
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const sarToLocal = (sar: number) => `~${sym}${fmt(Math.round(sar / rate))}`;

  function addHeader() {
    doc.setDrawColor(...CYAN);
    doc.setLineWidth(0.5);
    doc.line(MG, 12, PW - MG, 12);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text("SHIFT OBSERVATORY", MG, 9);
    doc.text(`${oN}  >  ${sN}`, PW - MG, 9, { align: "right" });
  }

  function addFooter() {
    pageNum++;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text(`SHIFT Observatory \u2014 ksashiftobservatory.online \u2014 ${today}`, MG, PH - 10);
    doc.text(`${pageNum} / ${totalPages}`, PW - MG, PH - 10, { align: "right" });
  }

  function sectionTitle(title: string, yPos: number): number {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...CYAN);
    doc.text(title, MG, yPos);
    doc.setFillColor(...CYAN);
    doc.rect(MG, yPos + 2, 40, 0.8, "F");
    return yPos + 10;
  }

  function bodyText(text: string, yPos: number, maxW?: number): number {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text, maxW || CW);
    doc.text(lines, MG, yPos);
    return yPos + lines.length * 4.5;
  }

  function boldLine(text: string, yPos: number): number {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(text, MG, yPos);
    return yPos + 6;
  }

  function bulletPoint(text: string, yPos: number): number {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text("\u2022", MG + 2, yPos);
    const lines = doc.splitTextToSize(text, CW - 10);
    doc.text(lines, MG + 8, yPos);
    return yPos + lines.length * 4.5 + 1;
  }

  /* ================================================================ */
  /* PAGE 1 — COVER                                                    */
  /* ================================================================ */

  doc.setFillColor(...DARK);
  doc.rect(0, 0, PW, PH, "F");

  // Accent lines top-right
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.5);
  doc.line(PW - 60, 15, PW - MG, 15);
  doc.line(PW - 40, 20, PW - MG, 20);

  // SHIFT OBSERVATORY
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...CYAN);
  doc.text("SHIFT OBSERVATORY", MG, 55);
  doc.setFillColor(...CYAN);
  doc.rect(MG, 59, 50, 1, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  const titleLine1 = isFr ? "ANALYSE D'EXPATRIATION" : "RELOCATION ANALYSIS";
  const titleLine2 = isFr ? "PERSONNALIS\u00c9E" : "PERSONALIZED";
  doc.text(titleLine1, MG, 85);
  doc.text(titleLine2, MG, 98);

  // City pair
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...CYAN);
  doc.text(`${oN}  >  ${sN}`, MG, 120);

  // Profile details
  let cy = 150;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(140, 140, 140);
  doc.text(isFr ? "Pr\u00e9par\u00e9 pour le profil :" : "Prepared for:", MG, cy);
  cy += 10;

  if (p.occupation) {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(p.occupation.name, MG, cy);
    cy += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text(`${isFr ? "Score de risque IA" : "AI risk score"} : ${p.occupation.composite}/100`, MG, cy);
    cy += 10;
  }

  doc.setTextColor(140, 140, 140);
  doc.setFontSize(10);
  doc.text(`${isFr ? "Famille" : "Family"} : ${p.adults} ${isFr ? "adultes" : "adults"}, ${p.children} ${isFr ? "enfant(s)" : "child(ren)"}`, MG, cy);
  cy += 7;
  doc.text(`${isFr ? "Logement" : "Housing"} : ${p.housing === "compound" ? "Compound" : isFr ? "Appartement" : "Apartment"}`, MG, cy);
  cy += 7;
  doc.text(`${isFr ? "Scolarit\u00e9" : "Schooling"} : ${p.schoolTierLabel}`, MG, cy);

  // Bottom
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(monthStr, MG, 260);
  doc.setTextColor(...CYAN);
  doc.setFontSize(9);
  doc.text("www.ksashiftobservatory.online", MG, 268);
  pageNum++;

  /* ================================================================ */
  /* PAGE 2 — EXECUTIVE SUMMARY                                        */
  /* ================================================================ */

  doc.addPage();
  addHeader();
  let y = sectionTitle(isFr ? "R\u00c9SUM\u00c9 EX\u00c9CUTIF" : "EXECUTIVE SUMMARY", 25);
  y += 4;

  // KPI boxes (2x2)
  const boxW = CW / 2 - 4;
  const boxH = 24;
  const kpis = [
    { label: isFr ? "SALAIRE MINIMUM" : "MINIMUM SALARY", value: `SAR ${fmt(minSal)}/mo`, sub: sarToLocal(minSal), color: CYAN },
    { label: isFr ? "SALAIRE RECOMMAND\u00c9" : "RECOMMENDED SALARY", value: `SAR ${fmt(recSal)}/mo`, sub: isFr ? "Avec 20% de marge" : "With 20% margin", color: [34, 197, 94] as [number, number, number] },
    { label: isFr ? "\u00c9CONOMIES D'IMP\u00d4TS" : "TAX SAVINGS", value: `+${sym}${fmt(p.result.tax_savings_local)}/mo`, sub: `${sym}${fmt(p.result.tax_savings_local * 12)}/yr`, color: CYAN },
    { label: isFr ? "EOSB (5 ANS)" : "EOSB (5 YEARS)", value: `~SAR ${fmt(p.result.eosb_5yr_sar)}`, sub: sarToLocal(p.result.eosb_5yr_sar), color: [212, 168, 83] as [number, number, number] },
  ];

  kpis.forEach((kpi, i) => {
    const bx = MG + (i % 2) * (boxW + 8);
    const by = y + Math.floor(i / 2) * (boxH + 6);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(bx, by, boxW, boxH, 2, 2, "F");
    doc.setFillColor(...kpi.color);
    doc.rect(bx, by, 2, boxH, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(kpi.label, bx + 6, by + 7);
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(kpi.value, bx + 6, by + 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(kpi.sub, bx + 6, by + 21);
  });

  y += 2 * (boxH + 6) + 10;

  // Verdict box
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(MG, y, CW, 62, 3, 3, "F");
  doc.setFillColor(22, 163, 74);
  doc.rect(MG, y, 3, 62, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(22, 163, 74);
  doc.text("VERDICT", MG + 8, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  const verdictText = isFr
    ? `D\u00e9m\u00e9nager de ${oN} \u00e0 ${sN}${p.occupation ? ` en tant que ${p.occupation.name}` : ""} repr\u00e9sente une opportunit\u00e9 financi\u00e8rement avantageuse. Vos \u00e9conomies fiscales de ${sym}${fmt(p.result.tax_savings_local)}/mois (soit ${sym}${fmt(p.result.tax_savings_local * 12)}/an) compensent largement les surco\u00fbts li\u00e9s au logement et \u00e0 la scolarit\u00e9 internationale. Avec un salaire de SAR ${fmt(recSal)}/mois, vous maintenez votre niveau de vie tout en \u00e9pargnant environ SAR ${fmt(monthlySavings)}/mois. Sur 5 ans, votre patrimoine net pourrait augmenter de plus de SAR ${fmt(fiveYrSavings)} (${sarToLocal(fiveYrSavings)}) en combinant \u00e9pargne mensuelle et indemnit\u00e9 de fin de service.`
    : `Relocating from ${oN} to ${sN}${p.occupation ? ` as a ${p.occupation.name}` : ""} is a financially advantageous opportunity. Your tax savings of ${sym}${fmt(p.result.tax_savings_local)}/mo (${sym}${fmt(p.result.tax_savings_local * 12)}/yr) more than offset additional housing and schooling costs. With a salary of SAR ${fmt(recSal)}/mo, you maintain your standard of living while saving approximately SAR ${fmt(monthlySavings)}/mo. Over 5 years, your net wealth could grow by SAR ${fmt(fiveYrSavings)} (${sarToLocal(fiveYrSavings)}) combining monthly savings and end-of-service benefits.`;
  const verdictLines = doc.splitTextToSize(verdictText, CW - 16);
  doc.text(verdictLines, MG + 8, y + 16);

  y += 66;

  // Attention points
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(isFr ? "Points d'attention :" : "Key considerations:", MG, y);
  y += 6;
  const attentionPts = isFr ? [
    `Le logement en ${p.housing === "compound" ? "compound" : "appartement"} repr\u00e9sente votre plus gros poste de d\u00e9pense`,
    `La scolarit\u00e9 internationale couvre SAR ${fmt(p.result.school_cost_sar)}/mois`,
    "Les frais de d\u00e9pendants (400 SAR/mois/personne) s'ajoutent aux charges",
    "N\u00e9gociez en priorit\u00e9 le logement et la scolarit\u00e9 dans votre package",
  ] : [
    `${p.housing === "compound" ? "Compound" : "Apartment"} housing is your largest expense`,
    `International schooling costs SAR ${fmt(p.result.school_cost_sar)}/mo`,
    "Dependent fees (SAR 400/mo/person) add to your costs",
    "Prioritize negotiating housing and schooling in your package",
  ];
  attentionPts.forEach((pt) => { y = bulletPoint(pt, y); });

  addFooter();

  /* ================================================================ */
  /* PAGE 3 — INCOME COMPARISON                                        */
  /* ================================================================ */

  doc.addPage();
  addHeader();
  y = sectionTitle(isFr ? "COMPARAISON DES REVENUS" : "INCOME COMPARISON", 25);
  y += 4;

  // Table header
  const col1 = MG;
  const col2 = MG + 55;
  const col3 = MG + 105;
  const col4 = MG + 145;

  doc.setFillColor(240, 240, 240);
  doc.rect(MG, y - 4, CW, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("", col1, y);
  doc.text(`${oN} (${cur})`, col2, y);
  doc.text(`${sN} (SAR)`, col3, y);
  doc.text(sarToLocal(0).replace("~" + sym + "0", `${sN} (~${cur})`), col4, y);
  y += 8;

  // Table rows
  const incomeRows: [string, string, string, string][] = [
    [isFr ? "Salaire brut" : "Gross salary", `${sym}${fmt(p.result.gross_local)}`, `SAR ${fmt(p.result.gross_sar)}`, sarToLocal(p.result.gross_sar)],
    [isFr ? "Imp\u00f4ts et charges" : "Tax & deductions", `-${sym}${fmt(p.result.tax_local)} (${taxPct}%)`, `SAR 0 (0%)`, `${sym}0`],
  ];
  incomeRows.forEach(([label, v1, v2, v3], i) => {
    if (i % 2 === 1) { doc.setFillColor(248, 248, 248); doc.rect(MG, y - 4, CW, 7, "F"); }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(label, col1, y);
    doc.text(v1, col2, y);
    doc.text(v2, col3, y);
    doc.text(v3, col4, y);
    y += 7;
  });

  doc.setDrawColor(30, 30, 30);
  doc.line(MG, y - 2, MG + CW, y - 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(isFr ? "Salaire net" : "Net salary", col1, y + 3);
  doc.text(`${sym}${fmt(p.result.net_local)}`, col2, y + 3);
  doc.text(`SAR ${fmt(p.result.net_sar)}`, col3, y + 3);
  doc.text(sarToLocal(p.result.net_sar), col4, y + 3);
  y += 12;

  // Cyan banner
  doc.setFillColor(...CYAN);
  doc.roundedRect(MG, y, CW, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`${isFr ? "\u00c9conomies fiscales" : "Tax savings"}: ${sym}${fmt(p.result.tax_savings_local)}/mo = ${sym}${fmt(p.result.tax_savings_local * 12)}/yr = SAR ${fmt(p.result.tax_savings_sar * 12)}/yr`, MG + 6, y + 9);
  y += 22;

  // Analysis text
  y = boldLine(isFr ? "CE QUE CELA SIGNIFIE" : "WHAT THIS MEANS", y);
  y += 2;

  const incomeAnalysis = isFr
    ? `En France, sur un salaire brut de ${sym}${fmt(p.result.gross_local)}, vous perdez ${sym}${fmt(p.result.tax_local)} chaque mois en imp\u00f4ts sur le revenu et charges sociales (taux effectif de ${taxPct}%). En Arabie Saoudite, l'int\u00e9gralit\u00e9 de votre salaire vous revient \u2014 le taux d'imposition est de 0%.`
    : `In ${oN}, on a gross salary of ${sym}${fmt(p.result.gross_local)}, you lose ${sym}${fmt(p.result.tax_local)} each month to income tax and social charges (effective rate of ${taxPct}%). In Saudi Arabia, your entire salary is yours \u2014 the tax rate is 0%.`;
  y = bodyText(incomeAnalysis, y);
  y += 4;

  y = bodyText(isFr ? "Cette diff\u00e9rence repr\u00e9sente :" : "This difference represents:", y);
  y += 2;
  y = bulletPoint(`${sym}${fmt(p.result.tax_savings_local)} ${isFr ? "par mois d'\u00e9conomies fiscales" : "per month in tax savings"}`, y);
  y = bulletPoint(`${sym}${fmt(p.result.tax_savings_local * 12)} ${isFr ? "par an" : "per year"}`, y);
  y = bulletPoint(`${sym}${fmt(p.result.tax_savings_local * 60)} ${isFr ? "sur 5 ans" : "over 5 years"}`, y);
  y = bulletPoint(`${isFr ? "Soit" : "Equivalent to"} SAR ${fmt(p.result.tax_savings_sar * 60)} ${isFr ? "sur 5 ans" : "over 5 years"}`, y);
  y += 4;

  const fxNote = isFr
    ? `Le Riyal Saoudien (SAR) est arrim\u00e9 au Dollar am\u00e9ricain \u00e0 un taux fixe de 1 USD = 3.75 SAR, ce qui \u00e9limine le risque de change par rapport au dollar. Le taux ${cur}/SAR fluctue avec le march\u00e9 des changes.`
    : `The Saudi Riyal (SAR) is pegged to the US Dollar at a fixed rate of 1 USD = 3.75 SAR, eliminating exchange rate risk against the dollar. The ${cur}/SAR rate fluctuates with the forex market.`;
  y = bodyText(fxNote, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`${isFr ? "Taux de change utilis\u00e9" : "Exchange rate used"}: 1 ${cur} = ${rate.toFixed(4)} SAR (${monthStr})`, MG, y);

  addFooter();

  /* ================================================================ */
  /* PAGE 4 — MONTHLY COSTS                                            */
  /* ================================================================ */

  doc.addPage();
  addHeader();
  y = sectionTitle(isFr ? "D\u00c9TAIL DES CO\u00dbTS MENSUELS" : "MONTHLY COSTS BREAKDOWN", 25);
  y += 4;

  // Costs table
  doc.setFillColor(240, 240, 240);
  doc.rect(MG, y - 4, CW, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(isFr ? "CAT\u00c9GORIE" : "CATEGORY", col1, y);
  doc.text(`${oN} (${cur})`, col2, y);
  doc.text(`${sN} (SAR)`, col3, y);
  doc.text(`~${cur}`, col4, y);
  y += 8;

  const costLabels = isFr
    ? ["Loyer", "Alimentation", "Transport", "Charges", "Restaurants", "Scolarit\u00e9", "Frais d\u00e9pendants"]
    : ["Rent", "Food", "Transport", "Utilities", "Dining", "Schooling", "Dependent fees"];
  const costData: [number, number][] = [
    [p.result.origin_costs.rent, p.result.saudi_costs.rent],
    [p.result.origin_costs.food, p.result.saudi_costs.food],
    [p.result.origin_costs.transport, p.result.saudi_costs.transport],
    [p.result.origin_costs.utilities, p.result.saudi_costs.utilities],
    [p.result.origin_costs.dining, p.result.saudi_costs.dining],
    [0, p.result.saudi_costs.school],
    [0, p.result.saudi_costs.dep_fee],
  ];

  costLabels.forEach((label, i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(MG, y - 4, CW, 7, "F"); }
    const [vO, vS] = costData[i];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(label, col1, y);
    doc.text(vO > 0 ? `${sym}${fmt(vO)}` : "\u2014", col2, y);
    doc.text(`SAR ${fmt(vS)}`, col3, y);
    doc.text(vS > 0 ? sarToLocal(vS) : "\u2014", col4, y);
    y += 7;
  });

  doc.setDrawColor(30, 30, 30);
  doc.line(MG, y - 2, MG + CW, y - 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text("TOTAL", col1, y + 3);
  doc.text(`${sym}${fmt(p.result.origin_total_local)}`, col2, y + 3);
  doc.text(`SAR ${fmt(p.result.saudi_total_sar)}`, col3, y + 3);
  doc.text(sarToLocal(p.result.saudi_total_sar), col4, y + 3);
  y += 14;

  // Bar chart
  const maxBar = Math.max(p.result.origin_costs.rent * rate, p.result.saudi_costs.rent, p.result.origin_costs.food * rate, p.result.saudi_costs.food);
  const barScale = 60 / maxBar;
  const barCategories = isFr ? ["Loyer", "Alimentation", "Transport", "Charges", "Restaurants"] : ["Rent", "Food", "Transport", "Utilities", "Dining"];
  const barData: [number, number][] = [
    [p.result.origin_costs.rent * rate, p.result.saudi_costs.rent],
    [p.result.origin_costs.food * rate, p.result.saudi_costs.food],
    [p.result.origin_costs.transport * rate, p.result.saudi_costs.transport],
    [p.result.origin_costs.utilities * rate, p.result.saudi_costs.utilities],
    [p.result.origin_costs.dining * rate, p.result.saudi_costs.dining],
  ];

  barCategories.forEach((label, i) => {
    const [oSar, sSar] = barData[i];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(label, MG, y + 3);
    // Origin bar (amber)
    doc.setFillColor(212, 168, 83);
    doc.rect(MG + 38, y - 1, oSar * barScale, 4, "F");
    // Saudi bar (cyan)
    doc.setFillColor(...CYAN);
    doc.rect(MG + 38, y + 4, sSar * barScale, 4, "F");
    y += 12;
  });

  // Legend
  doc.setFillColor(212, 168, 83);
  doc.rect(MG + 38, y, 8, 3, "F");
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(oN, MG + 48, y + 3);
  doc.setFillColor(...CYAN);
  doc.rect(MG + 80, y, 8, 3, "F");
  doc.text(sN, MG + 90, y + 3);
  y += 8;

  // Analysis
  y = boldLine(isFr ? "ANALYSE DES \u00c9CARTS" : "COST GAP ANALYSIS", y);
  y += 2;
  const costAnalysis = isFr
    ? `Le logement est votre premier poste de d\u00e9pense \u00e0 ${sN}. Un ${p.housing === "compound" ? "compound (r\u00e9sidence ferm\u00e9e et s\u00e9curis\u00e9e)" : "appartement"} co\u00fbte en moyenne SAR ${fmt(p.result.saudi_costs.rent)}/mois. En revanche, l'alimentation et les charges sont significativement moins ch\u00e8res gr\u00e2ce aux subventions gouvernementales sur l'\u00e9nergie et l'eau. La scolarit\u00e9 internationale repr\u00e9sente SAR ${fmt(p.result.school_cost_sar)}/mois \u2014 un co\u00fbt structurel qui n'existe pas en France o\u00f9 l'\u00e9cole publique est gratuite.`
    : `Housing is your largest expense in ${sN}. A ${p.housing === "compound" ? "compound (gated community with amenities)" : "apartment"} costs an average of SAR ${fmt(p.result.saudi_costs.rent)}/mo. In contrast, food and utilities are significantly cheaper due to government subsidies on energy and water. International schooling at SAR ${fmt(p.result.school_cost_sar)}/mo is a structural cost that does not exist in ${oN} where public education is free.`;
  y = bodyText(costAnalysis, y);

  addFooter();

  /* ================================================================ */
  /* PAGE 5 — EXPAT PACKAGE & EOSB                                     */
  /* ================================================================ */

  doc.addPage();
  addHeader();
  y = sectionTitle(isFr ? "PACKAGE EXPATRI\u00c9 ET AVANTAGES" : "EXPAT PACKAGE & BENEFITS", 25);
  y += 4;

  y = boldLine(isFr ? "COMPOSITION TYPE D'UN PACKAGE EXPATRI\u00c9 EN ARABIE SAOUDITE" : "TYPICAL EXPAT PACKAGE COMPOSITION IN SAUDI ARABIA", y);
  y += 2;

  // Package table
  const pkgCol1 = MG;
  const pkgCol2 = MG + 65;
  const pkgCol3 = MG + 110;
  doc.setFillColor(240, 240, 240);
  doc.rect(MG, y - 4, CW, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(isFr ? "Composant" : "Component", pkgCol1, y);
  doc.text("Standard", pkgCol2, y);
  doc.text(isFr ? "N\u00e9gociable" : "Negotiable", pkgCol3, y);
  y += 8;

  const pkgRows = isFr ? [
    ["Salaire de base", "60-70% du total", "Oui"],
    ["Allocation logement", "25% de la base", "Oui \u2014 demandez plus"],
    ["Allocation transport", "10% de la base", "Oui \u2014 ou voiture"],
    ["Allocation scolarit\u00e9", "25-40K SAR/enfant", "Oui \u2014 poussez \u00e0 65K+"],
    ["Vols annuels", "\u00c9co, famille", "Business (senior)"],
    ["Assurance sant\u00e9", "Obligatoire", "Couverture VIP"],
    ["Cong\u00e9s annuels", "21 jours (loi)", "30 jours (standard expat)"],
  ] : [
    ["Base salary", "60-70% of total", "Yes"],
    ["Housing allowance", "25% of base", "Yes \u2014 ask for more"],
    ["Transport allowance", "10% of base", "Yes \u2014 or car"],
    ["Education allowance", "25-40K SAR/child", "Yes \u2014 push to 65K+"],
    ["Annual flights", "Economy, family", "Business (senior)"],
    ["Health insurance", "Mandatory", "VIP coverage"],
    ["Annual leave", "21 days (law)", "30 days (expat standard)"],
  ];

  pkgRows.forEach(([c1, c2, c3], i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(MG, y - 4, CW, 7, "F"); }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    doc.text(c1, pkgCol1, y);
    doc.text(c2, pkgCol2, y);
    doc.text(c3, pkgCol3, y);
    y += 7;
  });
  y += 6;

  // EOSB section
  y = boldLine(isFr ? "INDEMNIT\u00c9 DE FIN DE SERVICE (EOSB)" : "END OF SERVICE BENEFIT (EOSB)", y);
  y += 2;
  const eosbText = isFr
    ? "L'EOSB est l'\u00e9quivalent saoudien d'une indemnit\u00e9 de d\u00e9part. Elle s'accumule automatiquement et est vers\u00e9e en une fois, exon\u00e9r\u00e9e d'imp\u00f4ts, \u00e0 la fin du contrat. Calcul bas\u00e9 sur le salaire de base : 0.5 mois par ann\u00e9e (ann\u00e9es 1-5), puis 1 mois par ann\u00e9e (ann\u00e9es 6+)."
    : "The EOSB is the Saudi equivalent of a severance package. It accrues automatically and is paid as a lump sum, tax-free, at the end of your contract. Calculated on base salary: 0.5 months per year (years 1-5), then 1 month per year (years 6+).";
  y = bodyText(eosbText, y);
  y += 4;

  // EOSB projections
  const baseSal = minSal;
  const eosb3 = Math.round(baseSal * 0.5 * 3);
  const eosb5 = p.result.eosb_5yr_sar;
  const eosb7 = Math.round(baseSal * 0.5 * 5 + baseSal * 1 * 2);
  const eosb10 = Math.round(baseSal * 0.5 * 5 + baseSal * 1 * 5);

  doc.setFillColor(248, 248, 248);
  doc.roundedRect(MG, y, CW, 30, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(`${isFr ? "Apr\u00e8s 3 ans" : "After 3 years"}:  ~SAR ${fmt(eosb3)} (${sarToLocal(eosb3)})`, MG + 6, y + 7);
  doc.text(`${isFr ? "Apr\u00e8s 5 ans" : "After 5 years"}:  ~SAR ${fmt(eosb5)} (${sarToLocal(eosb5)})`, MG + 6, y + 14);
  doc.text(`${isFr ? "Apr\u00e8s 7 ans" : "After 7 years"}:  ~SAR ${fmt(eosb7)} (${sarToLocal(eosb7)})`, MG + 6, y + 21);
  doc.text(`${isFr ? "Apr\u00e8s 10 ans" : "After 10 years"}: ~SAR ${fmt(eosb10)} (${sarToLocal(eosb10)})`, MG + 6, y + 28);
  y += 36;

  // Government fees
  y = boldLine(isFr ? "FRAIS GOUVERNEMENTAUX" : "GOVERNMENT FEES", y);
  y += 2;
  const feeRows = isFr ? [
    ["Frais de d\u00e9pendants", "400 SAR/personne", "Mensuel"],
    ["Renouvellement Iqama", "650 SAR", "Annuel"],
    ["Taxe permis de travail", "800 SAR", "Mensuel (employeur)"],
    ["TVA sur la consommation", "15%", "Permanent"],
  ] : [
    ["Dependent fees", "SAR 400/person", "Monthly"],
    ["Iqama renewal", "SAR 650", "Annual"],
    ["Work permit levy", "SAR 800", "Monthly (employer)"],
    ["VAT on consumption", "15%", "Permanent"],
  ];
  feeRows.forEach(([label, amount, freq]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    doc.text(`\u2022  ${label}`, MG, y);
    doc.text(amount, MG + 70, y);
    doc.setTextColor(120, 120, 120);
    doc.text(freq, MG + 110, y);
    y += 6;
  });

  addFooter();

  /* ================================================================ */
  /* PAGE 6 — NEGOTIATION GUIDE                                        */
  /* ================================================================ */

  doc.addPage();
  addHeader();
  y = sectionTitle(isFr ? "GUIDE DE N\u00c9GOCIATION" : "NEGOTIATION GUIDE", 25);
  y += 4;

  y = boldLine(isFr ? "VOTRE CHECKLIST DE N\u00c9GOCIATION" : "YOUR NEGOTIATION CHECKLIST", y);
  y += 2;

  const negoItems = isFr ? [
    { title: "SALAIRE DE BASE", detail: `Minimum : SAR ${fmt(minSal)}/mois | Cible : SAR ${fmt(recSal)}+/mois. Votre levier : les \u00e9conomies d'imp\u00f4ts de ${sym}${fmt(p.result.tax_savings_local)}/mois d\u00e9montrent que vous acceptez un salaire inf\u00e9rieur en valeur absolue tout en gagnant plus en net.` },
    { title: "ALLOCATION LOGEMENT", detail: `Standard : 25% de la base = SAR ${fmt(Math.round(minSal * 0.25))}. R\u00e9alit\u00e9 : un ${p.housing === "compound" ? "compound" : "appartement"} co\u00fbte SAR ${fmt(p.result.saudi_costs.rent)} \u2014 n\u00e9gociez un bail direct ou une allocation major\u00e9e.` },
    { title: "SCOLARIT\u00c9", detail: `Votre besoin : SAR ${fmt(p.result.school_cost_sar * 12)}/an (${p.children} enfant(s), ${p.schoolTierLabel}). Standard : 25-40K SAR/enfant \u2014 vous avez un \u00e9cart \u00e0 couvrir.` },
    { title: "VOLS ANNUELS", detail: `${p.adults + p.children} billets \u00e9conomie vers ${oN} = ~SAR ${fmt((p.adults + p.children) * 3000)}/an. N\u00e9gociez le business class pour les missions > 5 ans.` },
    { title: "TRANSPORT", detail: `10% de la base = SAR ${fmt(Math.round(minSal * 0.1))}/mois, ou voiture de fonction. L'Arabie est un pays automobile-d\u00e9pendant.` },
    { title: "ASSURANCE SANT\u00c9", detail: "Obligatoire par la loi. L'employeur DOIT couvrir vous et vos d\u00e9pendants. V\u00e9rifiez la liste des h\u00f4pitaux couverts." },
    { title: "CONG\u00c9S", detail: "Minimum l\u00e9gal : 21 jours. Standard expatri\u00e9 : 30 jours. N\u00e9gociez 30 jours d\u00e8s le d\u00e9part." },
  ] : [
    { title: "BASE SALARY", detail: `Minimum: SAR ${fmt(minSal)}/mo | Target: SAR ${fmt(recSal)}+/mo. Your leverage: tax savings of ${sym}${fmt(p.result.tax_savings_local)}/mo show you can accept a lower absolute salary while earning more net.` },
    { title: "HOUSING ALLOWANCE", detail: `Standard: 25% of base = SAR ${fmt(Math.round(minSal * 0.25))}. Reality: a ${p.housing === "compound" ? "compound" : "apartment"} costs SAR ${fmt(p.result.saudi_costs.rent)} \u2014 negotiate a direct lease or increased allowance.` },
    { title: "EDUCATION", detail: `Your need: SAR ${fmt(p.result.school_cost_sar * 12)}/yr (${p.children} child(ren), ${p.schoolTierLabel}). Standard: 25-40K SAR/child \u2014 you have a gap to cover.` },
    { title: "ANNUAL FLIGHTS", detail: `${p.adults + p.children} economy tickets to ${oN} = ~SAR ${fmt((p.adults + p.children) * 3000)}/yr. Negotiate business class for assignments > 5 years.` },
    { title: "TRANSPORT", detail: `10% of base = SAR ${fmt(Math.round(minSal * 0.1))}/mo, or company car. Saudi Arabia is car-dependent.` },
    { title: "HEALTH INSURANCE", detail: "Mandatory by law. The employer MUST cover you and your dependents. Verify the list of covered hospitals." },
    { title: "LEAVE", detail: "Legal minimum: 21 days. Expat standard: 30 days. Negotiate 30 days from the start." },
  ];

  negoItems.forEach((item, i) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(`${i + 1}. ${item.title}`, MG, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    const lines = doc.splitTextToSize(item.detail, CW - 8);
    doc.text(lines, MG + 5, y);
    y += lines.length * 4 + 4;
  });

  // Strategy box
  y += 2;
  doc.setFillColor(255, 251, 235);
  const stratText = isFr
    ? `STRAT\u00c9GIE : Vos \u00e9conomies fiscales de ${sym}${fmt(p.result.tax_savings_local)}/mois signifient que m\u00eame avec un salaire brut inf\u00e9rieur de ${taxPct}% \u00e0 votre salaire actuel, vous gagnez plus en net. Utilisez cet argument pour n\u00e9gocier des avantages en nature (logement, \u00e9cole) plut\u00f4t qu'un salaire brut plus \u00e9lev\u00e9.`
    : `STRATEGY: Your tax savings of ${sym}${fmt(p.result.tax_savings_local)}/mo mean that even with a gross salary ${taxPct}% lower than your current one, you earn more net. Use this argument to negotiate benefits in kind (housing, school) rather than a higher gross salary.`;
  const stratLines = doc.splitTextToSize(stratText, CW - 12);
  doc.roundedRect(MG, y, CW, stratLines.length * 4 + 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text(stratLines, MG + 6, y + 7);

  addFooter();

  /* ================================================================ */
  /* PAGE 7 — AI RISK (if occupation selected)                         */
  /* ================================================================ */

  if (p.occupation) {
    doc.addPage();
    addHeader();
    y = sectionTitle(isFr ? "\u00c9VALUATION DU RISQUE IA" : "AI RISK ASSESSMENT", 25);
    y += 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(p.occupation.name, MG, y);
    y += 10;

    // Risk gauge
    const gW = CW;
    const gH = 10;
    for (let gx = 0; gx < gW; gx++) {
      const pct = gx / gW;
      const r = Math.round(pct < 0.5 ? 16 + pct * 2 * 233 : 249);
      const g = Math.round(pct < 0.5 ? 185 : 185 - (pct - 0.5) * 2 * 141);
      doc.setFillColor(r, g, pct < 0.25 ? 129 : 68);
      doc.rect(MG + gx, y, 1, gH, "F");
    }
    const markerX = MG + (p.occupation.composite / 100) * gW;
    doc.setFillColor(30, 30, 30);
    doc.circle(markerX, y + gH / 2, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(String(p.occupation.composite), markerX - 3, y + gH / 2 + 2.5);
    y += gH + 6;

    const riskLevel = p.occupation.composite < 30 ? "low" : p.occupation.composite < 50 ? "moderate" : p.occupation.composite < 70 ? "high" : "veryHigh";
    const riskLabelStr = p.occupation.composite < 30 ? (isFr ? "FAIBLE" : "LOW") : p.occupation.composite < 50 ? (isFr ? "MOD\u00c9R\u00c9" : "MODERATE") : p.occupation.composite < 70 ? (isFr ? "\u00c9LEV\u00c9" : "HIGH") : (isFr ? "TR\u00c8S \u00c9LEV\u00c9" : "VERY HIGH");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`Score : ${p.occupation.composite}/100 \u2014 ${riskLabelStr}`, MG, y);
    y += 7;

    if (occTrend) {
      const arrow = occTrend.direction === "up" ? "+" : occTrend.direction === "down" ? "-" : "=";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${isFr ? "Tendance" : "Trend"}: ${arrow} ${occTrend.delta > 0 ? "+" : ""}${occTrend.delta.toFixed(1)} vs Q4-2025`, MG, y);
      y += 10;
    }

    // Risk analysis text
    y = boldLine(isFr ? "CE QUE CELA SIGNIFIE" : "WHAT THIS MEANS", y);
    y += 2;
    let riskAnalysis = "";
    if (riskLevel === "low") {
      riskAnalysis = isFr
        ? `Votre m\u00e9tier b\u00e9n\u00e9ficie d'une forte protection contre l'automatisation. Les comp\u00e9tences requises \u2014 pr\u00e9sence physique, intelligence \u00e9motionnelle, jugement non routinier \u2014 constituent des barri\u00e8res naturelles que l'IA actuelle ne peut pas franchir. La demande pour ce profil en Arabie Saoudite reste solide gr\u00e2ce aux investissements massifs de la Vision 2030 dans les secteurs \u00e0 forte intensit\u00e9 humaine.`
        : `Your occupation benefits from strong protection against automation. Required competencies \u2014 physical presence, emotional intelligence, non-routine judgment \u2014 constitute natural barriers that current AI cannot overcome. Demand for this profile in Saudi Arabia remains strong thanks to massive Vision 2030 investments in human-intensive sectors.`;
    } else if (riskLevel === "moderate") {
      riskAnalysis = isFr
        ? `Votre m\u00e9tier est partiellement expos\u00e9 \u00e0 l'automatisation. Certaines t\u00e2ches routini\u00e8res (analyse de donn\u00e9es, r\u00e9daction de rapports, coordination administrative) peuvent \u00eatre acc\u00e9l\u00e9r\u00e9es ou remplac\u00e9es par des outils IA. Cependant, les composantes de jugement, cr\u00e9ativit\u00e9 et interaction humaine offrent une protection partielle. Nous recommandons de d\u00e9velopper des comp\u00e9tences compl\u00e9mentaires en gestion de projets IA et data analytics.`
        : `Your occupation is partially exposed to automation. Some routine tasks (data analysis, report writing, administrative coordination) may be accelerated or replaced by AI tools. However, judgment, creativity, and human interaction components provide partial protection. We recommend developing complementary skills in AI project management and data analytics.`;
    } else {
      riskAnalysis = isFr
        ? `Votre m\u00e9tier fait face \u00e0 un risque \u00e9lev\u00e9 d'automatisation. Les t\u00e2ches centrales \u2014 traitement de donn\u00e9es structur\u00e9es, analyse r\u00e9p\u00e9titive, v\u00e9rification de conformit\u00e9 \u2014 sont les premi\u00e8res cibles des LLM et outils RPA. Nous recommandons de d\u00e9velopper activement des comp\u00e9tences dans des domaines adjacents moins expos\u00e9s. En Arabie Saoudite, la transition vers des r\u00f4les de supervision IA et d'architecture de syst\u00e8mes pourrait r\u00e9duire votre exposition.`
        : `Your occupation faces elevated automation risk. Core tasks \u2014 structured data processing, repetitive analysis, compliance checking \u2014 are primary targets for LLMs and RPA tools. We recommend actively developing skills in adjacent, less-exposed domains. In Saudi Arabia, transitioning toward AI supervision and systems architecture roles could reduce your exposure.`;
    }
    y = bodyText(riskAnalysis, y);
    y += 6;

    // Market data
    y = boldLine(isFr ? "DONN\u00c9ES MARCH\u00c9" : "MARKET DATA", y);
    y += 2;
    y = bulletPoint(`${isFr ? "Salaire m\u00e9dian KSA" : "Median salary KSA"}: SAR ${fmt(p.occupation.salary_median_sar)}/mo`, y);
    y = bulletPoint(`${isFr ? "Fourchette" : "Range"}: SAR ${fmt(p.occupation.salary_entry_sar)} \u2014 ${fmt(p.occupation.salary_senior_sar)}/mo`, y);
    y = bulletPoint(`${isFr ? "Secteur principal" : "Primary sector"}: ${p.occupation.sector_id}`, y);
    y = bulletPoint(`${isFr ? "Tendance WEF" : "WEF Trend"}: ${p.occupation.wef_trend}`, y);
    if (p.occupation.employment_est > 0) {
      y = bulletPoint(`${isFr ? "Effectifs estim\u00e9s" : "Estimated workforce"}: ${fmt(p.occupation.employment_est)}`, y);
    }

    addFooter();
  }

  /* ================================================================ */
  /* PAGE 8 — MARKET CONTEXT                                           */
  /* ================================================================ */

  doc.addPage();
  addHeader();
  y = sectionTitle(isFr ? "CONTEXTE DU MARCH\u00c9 SAOUDIEN" : "SAUDI MARKET CONTEXT", 25);
  y += 4;

  y = boldLine("VISION 2030", y);
  y += 2;
  const v2030Text = isFr
    ? "L'Arabie Saoudite traverse une transformation \u00e9conomique sans pr\u00e9c\u00e9dent dans le cadre de la Vision 2030. Le Royaume diversifie son \u00e9conomie au-del\u00e0 des hydrocarbures, cr\u00e9ant une demande massive de talents internationaux dans la tech, la sant\u00e9, le tourisme, les \u00e9nergies renouvelables et la finance. En parall\u00e8le, le programme Nitaqat (Saudisation) impose des quotas de nationalisation qui varient par secteur."
    : "Saudi Arabia is undergoing an unprecedented economic transformation under Vision 2030. The Kingdom is diversifying beyond hydrocarbons, creating massive demand for international talent in tech, healthcare, tourism, renewable energy, and finance. Simultaneously, the Nitaqat (Saudization) program imposes nationalization quotas that vary by sector.";
  y = bodyText(v2030Text, y);
  y += 6;

  y = boldLine(isFr ? "INDICATEURS CL\u00c9S (T1 2026)" : "KEY INDICATORS (Q1 2026)", y);
  y += 2;
  const indicators = isFr ? [
    "4,45 millions de travailleurs expatri\u00e9s enregistr\u00e9s (GOSI)",
    "24% de main-d'\u0153uvre saoudienne dans le secteur priv\u00e9",
    "100 professions r\u00e9serv\u00e9es aux Saoudiens",
    "$135 milliards d'impact IA projet\u00e9 d'ici 2030",
    "2026 d\u00e9sign\u00e9e \"Ann\u00e9e de l'Intelligence Artificielle\" par le Cabinet",
  ] : [
    "4.45 million registered expat workers (GOSI)",
    "24% Saudi workforce in private sector",
    "100 occupations reserved for Saudi nationals",
    "$135 billion projected AI impact by 2030",
    "2026 designated \"Year of Artificial Intelligence\" by Cabinet",
  ];
  indicators.forEach((item) => { y = bulletPoint(item, y); });
  y += 6;

  y = boldLine(isFr ? "CLASSEMENT MERCER \u2014 CO\u00dbT DE LA VIE" : "MERCER RANKING \u2014 COST OF LIVING", y);
  y += 2;
  y = bodyText(`${sN}: #${p.saudiMercer} ${isFr ? "mondial" : "worldwide"} (2024)`, y);
  y = bodyText(`${oN}: #${p.originMercer} ${isFr ? "mondial" : "worldwide"}`, y);
  y += 2;
  const mercerAnalysis = isFr
    ? `${sN} est class\u00e9e comme une ville de co\u00fbt moyen \u00e0 l'\u00e9chelle mondiale, significativement plus abordable que ${oN} (#${p.originMercer}).`
    : `${sN} is classified as a medium-cost city globally, significantly more affordable than ${oN} (#${p.originMercer}).`;
  y = bodyText(mercerAnalysis, y);

  addFooter();

  /* ================================================================ */
  /* PAGE 9 — NEXT STEPS                                               */
  /* ================================================================ */

  doc.addPage();
  addHeader();
  y = sectionTitle(isFr ? "VOS PROCHAINES \u00c9TAPES" : "YOUR NEXT STEPS", 25);
  y += 4;

  y = boldLine(isFr ? "AVANT DE PARTIR" : "BEFORE YOU LEAVE", y);
  y += 2;
  const beforeSteps = isFr ? [
    `N\u00e9gociez votre package en utilisant le guide (page pr\u00e9c\u00e9dente)`,
    "V\u00e9rifiez les certifications requises pour votre m\u00e9tier en KSA",
    "Faites attester vos dipl\u00f4mes par votre minist\u00e8re de l'\u00e9ducation et l'ambassade saoudienne",
    "Obtenez un certificat de bonne conduite (casier judiciaire vierge)",
    "Pr\u00e9parez les documents pour vos d\u00e9pendants (actes de mariage, naissance \u2014 traduits et apostill\u00e9s)",
  ] : [
    "Negotiate your package using the guide (previous page)",
    "Verify certifications required for your occupation in KSA",
    "Have your diplomas attested by your education ministry and the Saudi embassy",
    "Obtain a police clearance certificate",
    "Prepare dependent documents (marriage, birth certificates \u2014 translated and apostilled)",
  ];
  beforeSteps.forEach((step, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`${i + 1}.`, MG, y);
    const lines = doc.splitTextToSize(step, CW - 10);
    doc.text(lines, MG + 8, y);
    y += lines.length * 4.5 + 3;
  });
  y += 6;

  y = boldLine(isFr ? "\u00c0 L'ARRIV\u00c9E" : "ON ARRIVAL", y);
  y += 2;
  const arrivalSteps = isFr ? [
    "Votre employeur g\u00e8re votre visa de travail et votre Iqama",
    "Ouvrez un compte bancaire saoudien (Al Rajhi, SNB, Riyad Bank)",
    "Inscrivez vos enfants dans les \u00e9coles internationales le plus t\u00f4t possible",
    "Obtenez votre permis de conduire saoudien (transfert possible depuis certains pays)",
    "Inscrivez-vous \u00e0 l'assurance GOSI via votre employeur",
  ] : [
    "Your employer handles your work visa and Iqama",
    "Open a Saudi bank account (Al Rajhi, SNB, Riyad Bank)",
    "Enroll children in international schools as early as possible",
    "Obtain your Saudi driving license (transfer possible from some countries)",
    "Register for GOSI insurance through your employer",
  ];
  arrivalSteps.forEach((step, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`${i + 1}.`, MG, y);
    const lines = doc.splitTextToSize(step, CW - 10);
    doc.text(lines, MG + 8, y);
    y += lines.length * 4.5 + 3;
  });
  y += 6;

  y = boldLine(isFr ? "RESSOURCES UTILES" : "USEFUL RESOURCES", y);
  y += 2;
  const resources = [
    ["SHIFT Observatory", "www.ksashiftobservatory.online"],
    ["Jadarat", "jadarat.sa"],
    ["Absher", "absher.sa"],
    ["Qiwa", "qiwa.sa"],
  ];
  resources.forEach(([name, url]) => {
    y = bulletPoint(`${name} \u2014 ${url}`, y);
  });

  addFooter();

  /* ================================================================ */
  /* PAGE 10 — METHODOLOGY & SOURCES                                   */
  /* ================================================================ */

  doc.addPage();
  addHeader();
  y = sectionTitle(isFr ? "M\u00c9THODOLOGIE ET SOURCES" : "METHODOLOGY & SOURCES", 25);
  y += 4;

  const methodText = isFr
    ? "SHIFT Observatory est une plateforme gratuite et open-source d'intelligence sur le march\u00e9 du travail en Arabie Saoudite. Elle analyse le risque d'automatisation par l'IA de 146 m\u00e9tiers et fournit des outils de comparaison de co\u00fbt de la vie pour les expatri\u00e9s."
    : "SHIFT Observatory is a free, open-source labor market intelligence platform for Saudi Arabia. It analyzes AI automation risk for 146 occupations and provides cost-of-living comparison tools for expatriates.";
  y = bodyText(methodText, y);
  y += 6;

  y = boldLine(isFr ? "SOURCES DE DONN\u00c9ES" : "DATA SOURCES", y);
  y += 2;
  const sources = isFr ? [
    "Co\u00fbt de la vie : Numbeo (2026), Mercer Cost of Living Survey (2024)",
    "Emploi : GOSI T4-2024, GASTAT",
    "R\u00e9glementation : HRSD, Nitaqat, SCFHS, SCE",
    "Risque IA : Frey & Osborne (2017), Eloundou et al. (2023)",
    "Projections : WEF Future of Jobs 2025, McKinsey",
    "Salaires : Michael Page, Hays, Robert Walters (Gulf surveys)",
  ] : [
    "Cost of living: Numbeo (2026), Mercer Cost of Living Survey (2024)",
    "Employment: GOSI Q4-2024, GASTAT",
    "Regulation: HRSD, Nitaqat, SCFHS, SCE",
    "AI Risk: Frey & Osborne (2017), Eloundou et al. (2023)",
    "Projections: WEF Future of Jobs 2025, McKinsey",
    "Salaries: Michael Page, Hays, Robert Walters (Gulf surveys)",
  ];
  sources.forEach((s) => { y = bulletPoint(s, y); });
  y += 6;

  y = boldLine(isFr ? "TAUX DE CHANGE" : "EXCHANGE RATES", y);
  y += 2;
  y = bodyText(`1 ${cur} = ${rate.toFixed(4)} SAR | 1 USD = 3.75 SAR (${isFr ? "fixe" : "fixed"})`, y);
  y = bodyText(`${isFr ? "Taux de" : "Rates as of"} ${monthStr}. ${isFr ? "Les taux sont indicatifs." : "Rates are indicative."}`, y);
  y += 6;

  y = boldLine(isFr ? "AVERTISSEMENT" : "DISCLAIMER", y);
  y += 2;
  const disclaimer = isFr
    ? "Ce rapport est fourni \u00e0 titre informatif uniquement. Les prix, salaires et r\u00e9glementations peuvent varier. Consultez un conseiller professionnel avant de prendre des d\u00e9cisions de relocation."
    : "This report is provided for informational purposes only. Prices, salaries, and regulations may vary. Consult a professional advisor before making relocation decisions.";
  y = bodyText(disclaimer, y);
  y += 12;

  // Final branding
  doc.setDrawColor(...CYAN);
  doc.line(MG, y, MG + 40, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("SHIFT Observatory", MG, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(isFr ? "Cr\u00e9\u00e9 par Samy Aloulou" : "Created by Samy Aloulou", MG, y);
  y += 5;
  doc.text("CEO \u2014 Monitoring Force Gulf", MG, y);
  y += 5;
  doc.text("samy@monitoringforcegulf.com", MG, y);
  y += 5;
  doc.text("www.ksashiftobservatory.online", MG, y);
  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`\u00a9 2026 SHIFT Observatory \u2014 ${isFr ? "Tous droits r\u00e9serv\u00e9s" : "All rights reserved"}`, MG, y);

  addFooter();

  /* ---- Save ---- */
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`SHIFT-Relocation-${oN.replace(/\s/g, "-")}-to-${sN.replace(/\s/g, "-")}-${dateStr}.pdf`);
}
