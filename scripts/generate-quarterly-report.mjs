#!/usr/bin/env node
/**
 * SHIFT Observatory — Quarterly AI Risk Report V2
 * 15-page McKinsey-grade PDF with CSS charts and consulting narrative.
 * Usage: node scripts/generate-quarterly-report.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Config ──────────────────────────────────────────────
const Q = "Q1 2026", QR = "January to March", ED = "March 2026";
const OUT_DIR = resolve(ROOT, "public/reports");
const OUT_FILE = "SHIFT-Q1-2026-AI-Risk-Report.pdf";

// ── Load data ───────────────────────────────────────────
const D = JSON.parse(readFileSync(resolve(ROOT, "src/data/master.json"), "utf-8"));
const hero = D.hero, sectors = D.sectors, nitaqat = D.nitaqat;
const allOcc = [...D.occupations.high_risk, ...D.occupations.low_risk];
const desc = [...allOcc].sort((a, b) => (b.composite || 0) - (a.composite || 0));
const asc = [...allOcc].sort((a, b) => (a.composite || 0) - (b.composite || 0));
const layoffs = D.layoffs, tawteen = nitaqat.tawteen_decisions_2024_2025;
const bands = nitaqat.band_consequences;
const secSort = [...sectors].sort((a, b) => b.ai_risk_score - a.ai_risk_score);
const hrdf = D.hrdf_programs.programs;
const eco = D.ecosystem, labor = D.labor_market;

// ── Computed stats ──────────────────────────────────────
const fmt = n => typeof n === "number" ? (Number.isInteger(n) ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { maximumFractionDigits: 1 })) : String(n);
const rc = s => s >= 65 ? "#DC2626" : s >= 45 ? "#D97706" : s >= 30 ? "#EAB308" : "#22C55E";
const bc = s => s >= 65 ? "#DC2626" : s >= 50 ? "#EA580C" : s >= 30 ? "#D97706" : "#22C55E";
const wl = t => ({ decline_brutal: "Rapid Decline", decline: "Declining", stable: "Stable", growth: "Growing", growth_rapid: "Rapid Growth" }[t] || t || "\u2014");

const riskBands = { veryHigh: 0, high: 0, moderate: 0, low: 0 };
allOcc.forEach(o => { const s = o.composite || 0; if (s >= 70) riskBands.veryHigh++; else if (s >= 45) riskBands.high++; else if (s >= 25) riskBands.moderate++; else riskBands.low++; });
const totalHR = allOcc.filter(o => (o.composite || 0) >= 45).length;
let wSum = 0, wEmp = 0;
allOcc.forEach(o => { const e = typeof o.employment_est === "number" ? o.employment_est : 0; wSum += (o.composite || 0) * e; wEmp += e; });
const weightedAvg = (wSum / wEmp).toFixed(1);
const top10Emp = desc.slice(0, 10).reduce((s, o) => s + (typeof o.employment_est === "number" ? o.employment_est : 0), 0);

// Sector-occupation risk mapping
const secOccMap = {};
allOcc.forEach(o => {
  const sid = o.sector_id || "other";
  if (!secOccMap[sid]) secOccMap[sid] = { high: 0, med: 0, low: 0 };
  const s = o.composite || 0;
  if (s >= 45) secOccMap[sid].high++; else if (s >= 25) secOccMap[sid].med++; else secOccMap[sid].low++;
});

const layoffCases = [...layoffs.ai_cases_global].sort((a, b) => (b.jobs || 0) - (a.jobs || 0));
const constrScore = sectors.find(s => s.name_en.includes("onstruct"))?.ai_risk_score || 18;
const healthScore = sectors.find(s => s.name_en.includes("ealth"))?.ai_risk_score || 22;

// Gauge zone
const gaugeAngle = (parseFloat(weightedAvg) / 100) * 180;

// Donut chart percentages
const total = allOcc.length;
const dp = { vh: (riskBands.veryHigh / total * 100), h: (riskBands.high / total * 100), m: (riskBands.moderate / total * 100), l: (riskBands.low / total * 100) };
const donutGrad = `conic-gradient(from 0deg, #DC2626 0deg ${dp.vh * 3.6}deg, #D97706 ${dp.vh * 3.6}deg ${(dp.vh + dp.h) * 3.6}deg, #EAB308 ${(dp.vh + dp.h) * 3.6}deg ${(dp.vh + dp.h + dp.m) * 3.6}deg, #22C55E ${(dp.vh + dp.h + dp.m) * 3.6}deg 360deg)`;

// ── Helpers ──────────────────────────────────────────────
function occRows(list, n = 10) {
  return list.slice(0, n).map((o, i) => {
    const s = o.composite || 0, emp = typeof o.employment_est === "number" ? fmt(o.employment_est) : "\u2014";
    const cat = (o.category || "\u2014").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const bw = Math.min(s, 100);
    return `<tr><td class="tc mono fw6">${i + 1}</td><td class="fw5">${o.name_en}</td>
      <td class="tr"><div style="display:flex;align-items:center;justify-content:flex-end;gap:6pt">
        <div style="width:50pt;height:6pt;background:#1F2937;border-radius:3pt;overflow:hidden"><div style="width:${bw}%;height:100%;background:${rc(s)};border-radius:3pt"></div></div>
        <span class="mono fw6" style="color:${rc(s)};min-width:28pt;text-align:right">${s.toFixed(1)}</span></div></td>
      <td class="tr mono">${emp}</td><td>${cat}</td><td>${wl(o.wef_trend)}</td></tr>`;
  }).join("");
}

function sectorBars() {
  const mx = Math.max(...sectors.map(s => s.ai_risk_score));
  return secSort.map(s => {
    const pct = (s.ai_risk_score / mx * 100).toFixed(1);
    const c = bc(s.ai_risk_score);
    return `<div class="brow"><div class="blbl">${s.name_en}</div>
      <div class="btrk"><div class="gl" style="left:25%"></div><div class="gl" style="left:50%"></div><div class="gl" style="left:75%"></div>
      <div class="bfill" style="width:${pct}%;background:${c}"></div></div>
      <div class="bsc" style="color:${c}">${s.ai_risk_score}</div></div>`;
  }).join("");
}

function stackedBars() {
  // Top 5 sectors by occupation count
  const entries = Object.entries(secOccMap).map(([id, v]) => {
    const sec = sectors.find(s => s.id === id);
    return { name: sec?.name_en || id, ...v, total: v.high + v.med + v.low };
  }).sort((a, b) => b.total - a.total).slice(0, 6);

  return entries.map(e => {
    const hp = (e.high / e.total * 100).toFixed(1), mp = (e.med / e.total * 100).toFixed(1), lp = (e.low / e.total * 100).toFixed(1);
    return `<div style="margin-bottom:8pt"><div style="font-size:7.5pt;color:#6B7280;margin-bottom:2pt">${e.name} <span class="mono" style="color:#9CA3AF">(${e.total} occupations)</span></div>
      <div style="display:flex;height:14pt;border-radius:3pt;overflow:hidden">
        <div style="width:${hp}%;background:#DC2626" title="High Risk: ${e.high}"></div>
        <div style="width:${mp}%;background:#EAB308" title="Moderate: ${e.med}"></div>
        <div style="width:${lp}%;background:#22C55E" title="Low Risk: ${e.low}"></div>
      </div></div>`;
  }).join("");
}

function layoffTimeline() {
  const byYear = { "2024": [], "2025": [], "2026": [] };
  layoffCases.forEach(c => {
    const y = (c.date || "").match(/\d{4}/)?.[0] || "2025";
    if (byYear[y]) byYear[y].push(c);
  });
  let html = "";
  for (const [year, cases] of Object.entries(byYear)) {
    if (cases.length === 0) continue;
    html += `<div style="margin-bottom:10pt"><div class="mono fw6" style="font-size:9pt;color:#22D3EE;margin-bottom:4pt">${year}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6pt;align-items:flex-end">`;
    cases.slice(0, 5).forEach(c => {
      const size = Math.max(16, Math.min(48, Math.sqrt((c.jobs || 0) / 100) * 4));
      html += `<div style="text-align:center"><div style="width:${size}pt;height:${size}pt;border-radius:50%;background:#DC2626;opacity:0.8;margin:0 auto 3pt"></div>
        <div style="font-size:6pt;color:#9CA3AF;line-height:1.2">${c.company.split("(")[0].trim()}<br><span class="mono" style="color:#E5E7EB">${fmt(c.jobs || 0)}</span></div></div>`;
    });
    html += `</div></div>`;
  }
  return html;
}

function layoffRows() {
  return layoffCases.slice(0, 12).map(c => {
    const badge = c.type === "confirmed" ? '<span class="badge br">AI CITED</span>' : c.type === "probable" ? '<span class="badge bo">AI FACTOR</span>' : '<span class="badge bg">SUSPECTED</span>';
    return `<tr><td>${c.company}</td><td class="tr mono">${fmt(c.jobs || 0)}</td><td>${badge}</td><td>${c.date || "\u2014"}</td></tr>`;
  }).join("");
}

function taweenRows(n = 10) {
  return tawteen.slice(0, n).map(t => `<tr><td class="fw5">${t.profession}</td><td class="tc mono">${t.quota_pct}%</td><td>${t.effective}</td><td>${t.phase}</td></tr>`).join("");
}

function bandRows() {
  const colors = { Platinum: "#22D3EE", "High Green": "#22C55E", "Medium Green": "#4ADE80", "Low Green": "#86EFAC", Red: "#DC2626" };
  const y = `<span style="color:#22C55E">&#10003;</span>`, n = `<span style="color:#DC2626">&#10007;</span>`;
  return Object.entries(bands).map(([nm, p]) =>
    `<tr><td class="fw6" style="color:${colors[nm] || "#6B7280"}">${nm}</td><td class="tc">${p.new_visas ? y : n}</td><td class="tc">${p.change_occupations ? y : n}</td><td class="tc">${p.renew_permits ? y : n}</td><td class="tc">${p.transfer_in ? y : n}</td></tr>`
  ).join("");
}

// ── CSS ─────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;font-size:9pt;line-height:1.55;color:#111827;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.mono{font-family:'JetBrains Mono',monospace}
.fw5{font-weight:500}.fw6{font-weight:600}.fw7{font-weight:700}
.tc{text-align:center}.tr{text-align:right}
.cyan{color:#22D3EE}.g4{color:#9CA3AF}.g5{color:#6B7280}.g6{color:#4B5563}
p{margin-bottom:8pt;text-align:justify;line-height:1.6}

.pg{width:210mm;min-height:297mm;padding:22mm 20mm 18mm;position:relative;page-break-after:always;overflow:hidden}
.pg:last-child{page-break-after:avoid}
.pg-dark{background:#0A0E17;color:#fff}
.pg-white{background:#fff;color:#111827}
.cover{background:#0A0E17;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;width:210mm;min-height:297mm;padding:40mm 30mm;page-break-after:always}
.back{background:#0A0E17;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;width:210mm;min-height:297mm;padding:40mm 30mm}

.st{font-size:13pt;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:3pt}
.ss{font-size:8.5pt;color:#6B7280;margin-bottom:14pt}
.ss-d{font-size:8.5pt;color:#9CA3AF;margin-bottom:14pt}
.h3{font-size:9.5pt;font-weight:700;letter-spacing:0.05em;margin-bottom:6pt;margin-top:12pt}

.kgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12pt;margin-top:16pt}
.kbox{border:1px solid #1F2937;border-radius:6pt;padding:14pt}
.knum{font-family:'JetBrains Mono',monospace;font-size:20pt;font-weight:700;color:#fff;line-height:1.1;margin-bottom:4pt}
.klbl{font-size:7.5pt;color:#9CA3AF;line-height:1.3}

table{width:100%;border-collapse:collapse;font-size:8pt;margin-top:8pt}
th{background:#0A0E17;color:#fff;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;padding:6pt 8pt;text-align:left;font-size:7pt}
td{padding:5pt 8pt;border-bottom:1px solid #E5E7EB;vertical-align:middle}
tr:nth-child(even) td{background:#F9FAFB}
tr:nth-child(odd) td{background:#fff}
.tbl-dark th{background:#111827;border-bottom:1px solid #374151}
.tbl-dark td{border-bottom:1px solid #1F2937;color:#E5E7EB}
.tbl-dark tr:nth-child(even) td{background:#0F1629}
.tbl-dark tr:nth-child(odd) td{background:#0A0E17}

.dot{display:inline-block;width:7pt;height:7pt;border-radius:50%;margin-right:4pt;vertical-align:middle}
.brow{display:flex;align-items:center;margin-bottom:4pt}
.blbl{width:170pt;font-size:7.5pt;color:#374151;text-align:right;padding-right:8pt;white-space:nowrap;overflow:hidden}
.btrk{flex:1;height:14pt;background:#F3F4F6;border-radius:3pt;position:relative;overflow:hidden}
.bfill{height:100%;border-radius:3pt;min-width:2pt;position:relative;z-index:1}
.bsc{font-family:'JetBrains Mono',monospace;font-size:7.5pt;font-weight:600;width:32pt;text-align:right;padding-left:5pt}
.gl{position:absolute;top:0;bottom:0;width:1px;background:#D1D5DB;opacity:0.4;z-index:0}

.co{border-left:3pt solid #22D3EE;background:#F0FDFA;padding:10pt 14pt;margin-top:12pt;font-size:8pt;line-height:1.5}
.co strong{color:#0E7490}
.co-d{border-left:3pt solid #22D3EE;background:#0F1629;padding:10pt 14pt;margin-top:12pt;font-size:8pt;line-height:1.5;color:#D1D5DB}
.co-d strong{color:#22D3EE}
.badge{display:inline-block;font-size:6.5pt;font-weight:600;padding:2pt 5pt;border-radius:3pt;letter-spacing:0.05em;text-transform:uppercase}
.br{color:#DC2626;border:1px solid #DC2626}.bo{color:#D97706;border:1px solid #D97706}.bg{color:#6B7280;border:1px solid #6B7280}

.vsg{display:flex;gap:0;border:1px solid #E5E7EB;border-radius:6pt;overflow:hidden}
.vsc{flex:1;padding:12pt}
.vsc:first-child{border-right:2pt solid #E5E7EB}
.vsc h4{font-size:8.5pt;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8pt}
.vsc ul{list-style:none;padding:0}
.vsc li{font-size:8pt;padding:3pt 0;border-bottom:1px solid #F3F4F6;color:#374151}
.vsc li::before{content:"\\2022 ";color:#9CA3AF;margin-right:3pt}

.tcard{border:1px solid #E5E7EB;border-radius:6pt;padding:12pt;margin-bottom:10pt}
.tarr{font-family:'JetBrains Mono',monospace;color:#22D3EE;font-size:14pt;margin:0 6pt}
.tsc{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:9pt;padding:2pt 5pt;border-radius:3pt;color:#fff;display:inline-block}

.pgf{position:absolute;bottom:7mm;left:20mm;right:20mm;text-align:center;font-size:6.5pt;color:#9CA3AF;border-top:0.5pt solid #E5E7EB;padding-top:4pt}
.pgf-d{position:absolute;bottom:7mm;left:20mm;right:20mm;text-align:center;font-size:6.5pt;color:#4B5563;border-top:0.5pt solid #1F2937;padding-top:4pt}

.ref-section{margin-bottom:12pt}
.ref-section h4{font-size:8.5pt;font-weight:700;color:#0E7490;margin-bottom:4pt;letter-spacing:0.05em}
.ref-section p{font-size:7pt;color:#374151;margin-bottom:3pt;text-indent:-14pt;padding-left:14pt;text-align:left;line-height:1.4}
@media print{.pg,.cover,.back{page-break-after:always}.back{page-break-after:avoid}}
`;

const PF = (n, t = 15) => `<div class="pgf">SHIFT Observatory &nbsp;&middot;&nbsp; ksashiftobservatory.online &nbsp;&middot;&nbsp; ${Q} &nbsp;&middot;&nbsp; Page ${n} of ${t}</div>`;
const PFD = (n, t = 15) => `<div class="pgf-d">SHIFT Observatory &nbsp;&middot;&nbsp; ksashiftobservatory.online &nbsp;&middot;&nbsp; ${Q} &nbsp;&middot;&nbsp; Page ${n} of ${t}</div>`;

// ── HTML ────────────────────────────────────────────────
const HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>

<!-- P1: COVER -->
<div class="cover">
  <div style="margin-bottom:80pt"><span style="font-size:16pt;letter-spacing:0.3em;font-weight:700" class="cyan">SHIFT</span><span style="font-size:16pt;letter-spacing:0.3em;font-weight:700;margin-left:8pt" class="g5">OBSERVATORY</span></div>
  <div style="font-size:32pt;font-weight:700;letter-spacing:0.02em;line-height:1.15;margin-bottom:24pt">THE AI DISRUPTION<br>INDEX</div>
  <div style="font-size:11pt" class="g4">Saudi Arabia Labor Market Intelligence Report</div>
  <div style="font-size:10pt;letter-spacing:0.1em;margin-top:16pt;margin-bottom:60pt" class="cyan">${Q} &mdash; ${QR}</div>
  <div style="font-size:8pt;line-height:1.6;max-width:350pt" class="g5">Based on GOSI, WEF, HRSD, McKinsey, and academic research<br>${fmt(allOcc.length)} occupations &middot; ${fmt(hero.total_workforce_gosi)} workers &middot; 20 sectors &middot; 13 regions</div>
  <div style="position:absolute;bottom:30mm;font-size:7.5pt;letter-spacing:0.08em" class="g6">ksashiftobservatory.online</div>
</div>

<!-- P2: AT A GLANCE + GAUGE -->
<div class="pg pg-dark">
  <div class="st cyan">AT A GLANCE</div>
  <div class="ss-d">Key figures shaping Saudi Arabia's AI workforce landscape &mdash; ${Q}</div>

  <!-- Overall Market Risk Gauge -->
  <div style="text-align:center;margin-bottom:20pt">
    <div style="position:relative;width:160pt;height:85pt;margin:0 auto">
      <div style="width:160pt;height:80pt;border-radius:80pt 80pt 0 0;background:conic-gradient(from 180deg at 50% 100%, #22C55E 0deg, #EAB308 60deg, #D97706 120deg, #DC2626 180deg);overflow:hidden"></div>
      <div style="position:absolute;bottom:0;left:20pt;right:20pt;height:55pt;border-radius:55pt 55pt 0 0;background:#0A0E17"></div>
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);text-align:center">
        <div class="mono fw7" style="font-size:24pt;color:#fff">${weightedAvg}</div>
        <div style="font-size:6.5pt;color:#9CA3AF;letter-spacing:0.1em">MARKET RISK INDEX</div>
      </div>
      <!-- Needle -->
      <div style="position:absolute;bottom:0;left:50%;width:2pt;height:55pt;background:#22D3EE;transform-origin:bottom center;transform:translateX(-50%) rotate(${gaugeAngle - 90}deg);border-radius:1pt"></div>
    </div>
    <div style="display:flex;justify-content:center;gap:16pt;margin-top:6pt;font-size:6pt;color:#6B7280">
      <span><span style="color:#22C55E">&bull;</span> Safe &lt;25</span>
      <span><span style="color:#EAB308">&bull;</span> Moderate 25-45</span>
      <span><span style="color:#D97706">&bull;</span> Elevated 45-65</span>
      <span><span style="color:#DC2626">&bull;</span> Critical &gt;65</span>
    </div>
  </div>

  <div class="kgrid">
    <div class="kbox"><div class="knum">${fmt(hero.total_workforce_gosi)}</div><div class="klbl">Total GOSI workforce<br>(Q4-2024)</div></div>
    <div class="kbox"><div class="knum">${allOcc.length}</div><div class="klbl">Occupations scored on AI<br>automation risk</div></div>
    <div class="kbox"><div class="knum">${fmt(layoffs.totals.tech_global_2025)}</div><div class="klbl">Global tech layoffs in 2025<br>(layoffs.fyi)</div></div>
    <div class="kbox"><div class="knum">${fmt(layoffs.challenger["2025_ai_cited"])}</div><div class="klbl">AI-cited job cuts in the US<br>(Challenger 2025)</div></div>
    <div class="kbox"><div class="knum">34,650</div><div class="klbl">Tech layoffs 2026 YTD<br>(48 companies)</div></div>
    <div class="kbox"><div class="knum">${nitaqat.reserved_professions_100.length}</div><div class="klbl">Professions reserved<br>exclusively for Saudis</div></div>
  </div>
  ${PFD(2)}
</div>

<!-- P3: EXECUTIVE SUMMARY + DONUT -->
<div class="pg pg-white">
  <div class="st">EXECUTIVE SUMMARY</div>
  <div class="ss">${Q} &mdash; Saudi Arabia AI Labor Market Intelligence</div>

  <div style="display:flex;gap:16pt;margin-bottom:14pt">
    <div style="flex:1">
      <p>Saudi Arabia's labor market sits at the intersection of two powerful and potentially contradictory forces. On one side, Vision 2030 drives aggressive nationalization through Saudization quotas, Nitaqat band enforcement, and an expanding list of ${nitaqat.reserved_professions_100.length} reserved professions. On the other, the Kingdom has positioned itself as the #1 country globally in AI adoption (Kiteworks, 2025), with sovereign AI investments exceeding $100 billion through HUMAIN and PIF.</p>
      <p>This creates what we call the <strong>V2030 Paradox</strong>: the same technologies the Kingdom champions will automate significant portions of the jobs it is simultaneously trying to nationalize. Our analysis of ${allOcc.length} occupations reveals that <strong>${totalHR} face high or very high automation risk</strong> (composite score &gt;45/100). The pattern is clear: occupations combining administrative functions, repetitive digital tasks, and structured decision-making face the greatest exposure.</p>
    </div>
    <!-- Donut Chart -->
    <div style="min-width:130pt;text-align:center">
      <div style="width:110pt;height:110pt;border-radius:50%;background:${donutGrad};margin:0 auto;position:relative">
        <div style="position:absolute;top:22pt;left:22pt;width:66pt;height:66pt;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div class="mono fw7" style="font-size:16pt;color:#111827">${allOcc.length}</div>
          <div style="font-size:6pt;color:#6B7280">OCCUPATIONS</div>
        </div>
      </div>
      <div style="margin-top:8pt;font-size:6.5pt;line-height:1.6;color:#6B7280">
        <span style="color:#DC2626">&bull;</span> Very High (&gt;70): ${riskBands.veryHigh}<br>
        <span style="color:#D97706">&bull;</span> High (45-70): ${riskBands.high}<br>
        <span style="color:#EAB308">&bull;</span> Moderate (25-45): ${riskBands.moderate}<br>
        <span style="color:#22C55E">&bull;</span> Low (&lt;25): ${riskBands.low}
      </div>
    </div>
  </div>

  <p>Globally, the pace of AI-driven workforce disruption accelerated dramatically in early 2026. Block Inc. became the first S&amp;P 500 company to explicitly halve its workforce citing AI, with CEO Jack Dorsey stating that &ldquo;intelligence tools have changed what it means to build a company.&rdquo; This follows ${fmt(layoffs.totals.tech_global_2025)} tech layoffs in 2025, of which ${fmt(layoffs.challenger["2025_ai_cited"])} were explicitly AI-cited in the US alone (Challenger, Gray &amp; Christmas).</p>
  <p>For professionals in Saudi Arabia &mdash; Saudi nationals navigating Saudization requirements and expatriates facing dual pressure from AI and regulatory displacement &mdash; the question is no longer whether disruption is coming, but how fast and in which sectors first. This report provides the data to answer that question.</p>

  <div class="co"><strong>KEY INSIGHT:</strong> ${totalHR} of ${allOcc.length} occupations scored above our high-risk threshold (45/100). The sectors most exposed are ${secSort[0].name_en} (${secSort[0].ai_risk_score}/100), ${secSort[1].name_en} (${secSort[1].ai_risk_score}/100), and ${secSort[2].name_en} (${secSort[2].ai_risk_score}/100). These three sectors alone employ ${fmt(secSort[0].total + secSort[1].total + secSort[2].total)} workers.</div>
  ${PF(3)}
</div>

<!-- P4: TOP 10 HIGHEST RISK -->
<div class="pg pg-white">
  <div class="st">HIGHEST AI AUTOMATION RISK</div>
  <div class="ss">Top 10 occupations by composite risk score &mdash; ${Q}</div>
  <table><thead><tr><th class="tc" style="width:28pt">RANK</th><th>OCCUPATION</th><th class="tr" style="width:100pt">SCORE</th><th class="tr" style="width:60pt">WORKFORCE</th><th style="width:75pt">CATEGORY</th><th style="width:70pt">WEF TREND</th></tr></thead>
  <tbody>${occRows(desc)}</tbody></table>

  <p style="margin-top:12pt">The pattern in the highest-risk occupations is unmistakable: they combine <strong>administrative functions, repetitive digital tasks, and structured decision-making</strong> &mdash; precisely the capabilities where large language models and RPA tools excel. Data Entry Keyers (${desc[0].composite.toFixed(1)}/100), representing ~${fmt(desc[0].employment_est)} workers, face near-certain disruption as OCR, AI document processing, and automated data pipelines eliminate the core value proposition of the role.</p>
  <p>Critically, many of these positions are disproportionately held by expatriate workers. When combined with tightening Saudization quotas, these workers face <strong>dual displacement pressure</strong>: AI automates the task while regulation restricts the visa. Employers will find themselves simultaneously automating roles and meeting quota requirements &mdash; a convergence that accelerates rather than slows the transition.</p>

  <div class="co"><strong>EMPLOYER SIGNAL:</strong> The top 10 most exposed occupations collectively employ over ${fmt(Math.round(top10Emp))} workers. Companies with significant headcount in these roles should begin transition planning now &mdash; not when the technology forces their hand.</div>
  ${PF(4)}
</div>

<!-- P5: TOP 10 LOWEST RISK -->
<div class="pg pg-white">
  <div class="st">LOWEST AI AUTOMATION RISK</div>
  <div class="ss">Top 10 occupations by composite risk score (ascending) &mdash; ${Q}</div>
  <table><thead><tr><th class="tc" style="width:28pt">RANK</th><th>OCCUPATION</th><th class="tr" style="width:100pt">SCORE</th><th class="tr" style="width:60pt">WORKFORCE</th><th style="width:75pt">CATEGORY</th><th style="width:70pt">WEF TREND</th></tr></thead>
  <tbody>${occRows(asc)}</tbody></table>

  <p style="margin-top:12pt">The safest occupations share three defensive characteristics: <strong>physical presence requirements, emotional intelligence, and non-routine judgment</strong>. Religious leaders (${asc[0].composite.toFixed(1)}/100), social workers, personal trainers, and healthcare professionals operate in domains where human connection, physical dexterity, and contextual judgment create natural moats against automation.</p>
  <p>Notably, emerging AI-era roles also appear in this list. AI Ethics Specialists, Cybersecurity Analysts, and Renewable Energy Technicians score below 15/100 &mdash; their very existence is a response to the technological forces disrupting other occupations. This creates a clear reskilling pathway: workers in high-risk administrative roles can transition toward technology governance, security, and green energy roles where demand is growing and AI exposure is minimal.</p>
  <p>Healthcare deserves special attention. Dentists (${(asc.find(o => o.name_en.includes("Dentist"))?.composite || 13.4).toFixed(1)}), Registered Nurses (${(asc.find(o => o.name_en.includes("Nurse"))?.composite || 13.6).toFixed(1)}), and Teachers consistently score below 15/100. Saudi Arabia's Vision 2030 healthcare expansion &mdash; with new hospitals, medical cities, and primary care centers &mdash; makes these roles both AI-safe and high-demand.</p>
  ${PF(5)}
</div>

<!-- P6: SECTOR ANALYSIS + STACKED BARS -->
<div class="pg pg-white">
  <div class="st">SECTOR AI EXPOSURE MAP</div>
  <div class="ss">20 ISIC sectors ranked by AI risk score &mdash; bar width proportional to exposure</div>
  <div style="margin-top:6pt">${sectorBars()}</div>

  <div class="h3">WORKFORCE COMPOSITION BY RISK LEVEL</div>
  <div style="display:flex;gap:8pt;margin-bottom:6pt;font-size:6.5pt;color:#6B7280">
    <span><span style="color:#DC2626">&bull;</span> High Risk (&gt;45)</span>
    <span><span style="color:#EAB308">&bull;</span> Moderate (25-45)</span>
    <span><span style="color:#22C55E">&bull;</span> Low Risk (&lt;25)</span>
  </div>
  ${stackedBars()}

  <p style="margin-top:8pt;font-size:8pt">${secSort[0].name_en} leads exposure at ${secSort[0].ai_risk_score}/100, with ${secOccMap[secSort[0].id]?.high || 0} of its occupations in the high-risk band. Financial Services (${secSort[1].ai_risk_score}/100) faces a perfect storm: high automation potential combined with aggressive Saudization in banking (tawteen Phase 2). Banks like Al Rajhi and SABB must simultaneously replace expat workers AND automate &mdash; creating a compressed transition timeline. Construction (${constrScore}/100) and Healthcare (${healthScore}/100) remain resilient.</p>
  ${PF(6)}
</div>

<!-- P7: GLOBAL AI LAYOFFS (dark) -->
<div class="pg pg-dark">
  <div class="st cyan">GLOBAL AI-DRIVEN LAYOFFS</div>
  <div class="ss-d">Major workforce reductions citing AI &mdash; 2024 to ${Q}</div>

  <!-- Timeline -->
  ${layoffTimeline()}

  <table class="tbl-dark" style="margin-top:12pt"><thead><tr><th>COMPANY</th><th class="tr" style="width:65pt">JOBS CUT</th><th style="width:72pt">AI ROLE</th><th style="width:65pt">DATE</th></tr></thead>
  <tbody>${layoffRows()}</tbody></table>
  ${PFD(7)}
</div>

<!-- P8: LAYOFFS ANALYSIS (white) -->
<div class="pg pg-white">
  <div class="st">LAYOFF TRENDS &amp; IMPLICATIONS</div>
  <div class="ss">What the global data tells us about Saudi Arabia's exposure</div>

  <p>${Q} marks an inflection point in AI-driven workforce restructuring. For the first time, a major S&amp;P 500 company (Block Inc.) explicitly framed AI not as cost optimization but as <strong>structural workforce redesign</strong>. CEO Dorsey's statement that &ldquo;intelligence tools have changed what it means to build a company&rdquo; signals a shift from defensive cuts to offensive restructuring. This is no longer about reducing headcount &mdash; it's about fundamentally rethinking which functions require human workers.</p>

  <p>The data tells a stark story. Global tech layoffs reached ${fmt(layoffs.totals.tech_global_2025)} in 2025, with ${fmt(layoffs.challenger["2025_ai_cited"])} explicitly AI-cited in the US (Challenger, Gray &amp; Christmas). October 2025 saw the peak: ${fmt(layoffs.challenger.peak_month.total)} total cuts, of which ${fmt(layoffs.challenger.peak_month.ai_cited)} (${layoffs.challenger.peak_month.ai_pct}%) cited AI &mdash; making artificial intelligence the <strong>#2 cause of job cuts</strong> behind cost-cutting for the first time.</p>

  <p>The implications for Saudi Arabia are threefold. First, multinational employers operating in the Kingdom (Accenture, Microsoft, Amazon, Meta) are implementing these same AI-driven restructuring strategies globally &mdash; their Saudi operations will not be exempt. Second, the types of roles being eliminated globally (customer service, administrative support, content creation, financial analysis) map directly onto high-risk occupations in the Saudi labor market. Third, Saudi companies are increasingly adopting the same tools: Arab National Bank has deployed 100+ RPA bots, Saudi Post operates 200 sorting robots, and ZATCA has automated 50% of customs operations.</p>

  <div class="co"><strong>FORWARD SIGNAL:</strong> The cumulative AI-cited layoff figure from 2023-2026 stands at ${fmt(layoffs.challenger.cumulative_2023_2026_ai)} in the US alone. The trend is exponential, not linear. Organizations that treat AI workforce displacement as a 2028-2030 problem are already behind.</div>

  <div class="h3">KSA AI DEPLOYMENT TRACKER</div>
  <table><thead><tr><th>ENTITY</th><th>TYPE</th><th>IMPACT</th></tr></thead><tbody>
  ${D.ksa_ai_cases.slice(0, 8).map(c => `<tr><td class="fw5">${c.entity}</td><td>${c.type}</td><td style="font-size:7pt">${(c.impact || "").slice(0, 80)}</td></tr>`).join("")}
  </tbody></table>
  ${PF(8)}
</div>

<!-- P9: SAUDIZATION & NITAQAT -->
<div class="pg pg-white">
  <div class="st">SAUDIZATION LANDSCAPE &mdash; ${Q}</div>
  <div class="ss">Tawteen decisions, Nitaqat bands, and regulatory trajectory</div>

  <div class="h3">KEY TAWTEEN DECISIONS (2024-2025)</div>
  <table><thead><tr><th>PROFESSION</th><th class="tc" style="width:50pt">QUOTA</th><th style="width:90pt">EFFECTIVE</th><th style="width:60pt">PHASE</th></tr></thead>
  <tbody>${taweenRows(10)}</tbody></table>

  <div class="h3">NITAQAT BAND PRIVILEGES</div>
  <table><thead><tr><th>BAND</th><th class="tc">NEW VISAS</th><th class="tc">CHANGE OCC.</th><th class="tc">RENEW</th><th class="tc">TRANSFER</th></tr></thead>
  <tbody>${bandRows()}</tbody></table>

  <p style="margin-top:10pt">The Saudization machine operates with systematic precision. Engineering professions reached 25% quota in July 2024; consulting hit 40% in March 2024; marketing communications 100% from March 2025. Each quarter, new professions enter the tawteen pipeline, reducing the share of roles available to expatriate workers. For employers, this creates a dual planning challenge: they must simultaneously meet rising quotas and prepare for AI-driven role elimination.</p>
  <p>The interaction between Nitaqat and AI is particularly acute in the Red band. Companies in Red cannot renew work permits, hire expats, or change occupations &mdash; effectively forcing a choice between aggressive Saudization or workforce reduction. As AI tools become capable of replacing the very roles that expatriates fill, the economic incentive to automate rather than recruit Saudi replacements grows stronger. This is the regulatory paradox that policymakers must address.</p>
  ${PF(9)}
</div>

<!-- P10: V2030 PARADOX -->
<div class="pg pg-white">
  <div class="st">THE VISION 2030 PARADOX</div>
  <div class="ss">When AI ambitions meet employment targets</div>

  <div class="vsg">
    <div class="vsc" style="background:#F0FDFA">
      <h4 class="cyan">AI ACCELERATION</h4>
      <ul><li>KSA #1 in global AI adoption (Kiteworks 2025)</li><li>HUMAIN: $100B sovereign AI company (PIF)</li><li>1.8 GW computing capacity target</li><li>SAMAI 2: 1.1M Saudis trained in AI</li><li>stc: 80%+ queries handled by AI</li><li>Stanford: #1 women in AI publications</li></ul>
    </div>
    <div class="vsc" style="background:#FFF7ED">
      <h4 style="color:#D97706">EMPLOYMENT PROTECTION</h4>
      <ul><li>${nitaqat.reserved_professions_100.length} professions reserved for Saudis</li><li>${tawteen.length} tawteen decisions (2024-2025)</li><li>Nitaqat quotas tightening quarterly</li><li>HRDF: ${hrdf.length} major reskilling programs</li><li>7% unemployment target (met early)</li><li>${labor.new_female_participation_target}</li></ul>
    </div>
  </div>

  <!-- V2030 Comparison Bars -->
  <div class="h3">VISION 2030 TARGETS VS. REALITY</div>
  <div style="margin-top:6pt">
    ${[
      { label: "Saudi Unemployment", target: 7, actual: parseFloat(labor.saudi_unemployment_pct), unit: "%", note: "Target met 6 years early" },
      { label: "Female Participation", target: 30, actual: parseFloat(labor.female_participation_pct), unit: "%", note: "Original target exceeded; new: 40%" },
      { label: "Youth Unemployment", target: 10, actual: parseFloat(labor.saudi_youth_unemployment_pct), unit: "%", note: "Still above target" },
    ].map(m => `<div style="margin-bottom:8pt">
      <div style="font-size:7pt;color:#6B7280;margin-bottom:2pt">${m.label} <span class="g4" style="font-size:6pt">${m.note}</span></div>
      <div style="display:flex;gap:4pt;align-items:center">
        <div style="flex:1;display:flex;gap:2pt;flex-direction:column">
          <div style="display:flex;align-items:center;gap:4pt"><div style="width:${Math.min(m.target * 2.5, 100)}pt;height:10pt;background:#22D3EE;border-radius:2pt"></div><span class="mono" style="font-size:7pt;color:#22D3EE">${m.target}${m.unit} target</span></div>
          <div style="display:flex;align-items:center;gap:4pt"><div style="width:${Math.min(m.actual * 2.5, 100)}pt;height:10pt;background:#fff;border:1px solid #D1D5DB;border-radius:2pt"></div><span class="mono" style="font-size:7pt;color:#6B7280">${m.actual}${m.unit} actual</span></div>
        </div>
      </div>
    </div>`).join("")}
  </div>

  <p style="margin-top:8pt">This is the central tension of Saudi Arabia's transformation. The Kingdom is simultaneously the most aggressive AI adopter in the Middle East and the most aggressive labor market regulator. V2030 targets ~${fmt(hero.v2030_jobs_target_net)} net new jobs, yet our analysis identifies ${fmt(hero.jobs_ai_exposure_weighted)} positions with meaningful AI exposure. These numbers are not directly comparable &mdash; but they define the policy tension Saudi planners must navigate for the next decade.</p>
  ${PF(10)}
</div>

<!-- P11: CAREER TRANSITIONS -->
<div class="pg pg-white">
  <div class="st">RECOMMENDED TRANSITION PATHWAYS</div>
  <div class="ss">Evidence-based career transitions from high-risk to lower-risk occupations</div>

  <div class="tcard">
    <div style="display:flex;align-items:center;margin-bottom:6pt;flex-wrap:wrap;gap:4pt">
      <span class="fw6">Data Entry Keyers</span><span class="tsc" style="background:#DC2626">94.9</span>
      <span class="tarr">&rarr;</span><span class="fw6">RPA Developer</span><span class="tsc" style="background:#22C55E">35.0</span>
      <span class="badge" style="margin-left:8pt;color:#22C55E;border:1px solid #22C55E">EASY</span>
    </div>
    <div style="font-size:7.5pt;color:#6B7280;line-height:1.5">Leverage existing data familiarity to transition into process automation. The same workers who manually enter data understand the workflows that RPA tools automate. Pathway: Doroob digital skills + UiPath Academy (3 months) + HRDF Tamheer placement. <strong style="color:#0E7490">Risk reduction: -59.9 points.</strong></div>
  </div>
  <div class="tcard">
    <div style="display:flex;align-items:center;margin-bottom:6pt;flex-wrap:wrap;gap:4pt">
      <span class="fw6">Accountants &amp; Auditors</span><span class="tsc" style="background:#DC2626">88.2</span>
      <span class="tarr">&rarr;</span><span class="fw6">Financial Analyst</span><span class="tsc" style="background:#D97706">52.0</span>
      <span class="badge" style="margin-left:8pt;color:#D97706;border:1px solid #D97706">MODERATE</span>
    </div>
    <div style="font-size:7.5pt;color:#6B7280;line-height:1.5">Move from compliance and bookkeeping (highly automatable) to strategic financial analysis (requires human judgment). Existing finance expertise is directly transferable. Pathway: CFA Level 1 + data analytics certification (6-12 months). <strong style="color:#0E7490">Risk reduction: -36.2 points.</strong></div>
  </div>
  <div class="tcard">
    <div style="display:flex;align-items:center;margin-bottom:6pt;flex-wrap:wrap;gap:4pt">
      <span class="fw6">Administrative Assistants</span><span class="tsc" style="background:#DC2626">85.2</span>
      <span class="tarr">&rarr;</span><span class="fw6">Social Media Manager</span><span class="tsc" style="background:#D97706">42.0</span>
      <span class="badge" style="margin-left:8pt;color:#22C55E;border:1px solid #22C55E">EASY</span>
    </div>
    <div style="font-size:7.5pt;color:#6B7280;line-height:1.5">Communication and organizational skills transfer directly. Growing demand from Saudi brands, government entities, and entertainment sector. Pathway: Google Digital Marketing certificate + portfolio (3-6 months). <strong style="color:#0E7490">Risk reduction: -43.2 points.</strong></div>
  </div>

  <div class="co"><strong>HRDF PROGRAMS:</strong> The Human Resources Development Fund offers ${hrdf.length} major programs (${hrdf.map(p => p.name).join(", ")}) covering on-the-job training, wage subsidies, and certifications. ${hrdf[0].name} alone has placed ${hrdf[0].scale} through its on-the-job training track.</div>

  <p style="margin-top:8pt">The key insight for career transition is that <strong>AI-safe roles are not necessarily high-tech roles</strong>. Physical services (personal training, nursing, construction supervision), creative strategy (marketing, design thinking), and human relationship roles (social work, teaching, counseling) all score below 25/100. Workers do not need to become software engineers &mdash; they need to move toward roles where human presence, judgment, and emotional intelligence are the core value proposition.</p>
  ${PF(11)}
</div>

<!-- P12: SAUDI AI ECOSYSTEM -->
<div class="pg pg-white">
  <div class="st">SAUDI ARABIA AI ECOSYSTEM</div>
  <div class="ss">Sovereign investments, infrastructure, and workforce signals</div>

  <div style="display:flex;gap:14pt;margin-bottom:10pt">
    <div style="flex:1;border:1px solid #E5E7EB;border-radius:6pt;padding:10pt">
      <div class="mono fw7 cyan" style="font-size:14pt">$100B</div>
      <div style="font-size:7pt;color:#6B7280">HUMAIN sovereign AI<br>investment (PIF)</div>
    </div>
    <div style="flex:1;border:1px solid #E5E7EB;border-radius:6pt;padding:10pt">
      <div class="mono fw7 cyan" style="font-size:14pt">1.8 GW</div>
      <div style="font-size:7pt;color:#6B7280">Computing capacity<br>target</div>
    </div>
    <div style="flex:1;border:1px solid #E5E7EB;border-radius:6pt;padding:10pt">
      <div class="mono fw7 cyan" style="font-size:14pt">#1</div>
      <div style="font-size:7pt;color:#6B7280">Global AI adoption<br>(Kiteworks 2025)</div>
    </div>
    <div style="flex:1;border:1px solid #E5E7EB;border-radius:6pt;padding:10pt">
      <div class="mono fw7 cyan" style="font-size:14pt">${fmt(eco.digital_workforce?.total || 389000)}</div>
      <div style="font-size:7pt;color:#6B7280">Digital workforce<br>(${eco.digital_workforce?.pct_women || 35}% women)</div>
    </div>
  </div>

  <p>Saudi Arabia's AI infrastructure buildout is among the most ambitious globally. HUMAIN, the PIF-backed sovereign AI company, has committed $100 billion with a target of 1.8 GW computing capacity. The data center market is projected to grow from ${eco.data_centers?.market_value_2025 || "$1.61B"} in 2025 to ${eco.data_centers?.market_value_2031 || "$8.11B"} by 2031 (${String(eco.data_centers?.cagr || "31%").replace(/%$/, "")}% CAGR), creating an estimated ${fmt(eco.data_centers?.jobs_direct_2030 || 6875)} direct jobs and ${fmt(eco.data_centers?.jobs_indirect_gov_digital || 26000)} indirect government digital jobs by 2030.</p>

  <p>On the talent side, SDAIA has trained over 45,000 AI professionals with a +54%/year growth rate. Key programs include ALLaM (an Arabic LLM trained on 500B tokens), Tawakkalna (8.5M users), and Nafath (national SSO). The Stanford AI Index 2025 places Saudi Arabia #1 globally for women-to-men ratio in AI publications, #3 for AI job growth, and #3-4 for advanced AI model development.</p>

  <p>However, this acceleration creates workforce tension. When stc reports 80%+ customer queries handled by AI, when ZATCA automates 50% of customs operations, and when Arab National Bank deploys 100+ RPA bots &mdash; these are not abstract threats. They are operational realities already reshaping the Saudi labor market. The ${fmt(eco.digital_workforce?.target_specialists_2030 || 20000)} AI specialist target for 2030 and the goal of training 40% of the workforce in AI skills reflect the government's awareness that the transition must be managed, not merely observed.</p>

  <div class="co"><strong>INFRASTRUCTURE SIGNAL:</strong> ${eco.data_centers?.current_capacity_mw || 222} MW of current data center capacity with ${eco.data_centers?.planned_addition_mw || 760} MW planned and HUMAIN targeting ${eco.data_centers?.humain_target_mw || 1800} MW. This is not incremental investment &mdash; it's a sovereign bet on AI as the Kingdom's post-oil economic engine.</div>
  ${PF(12)}
</div>

<!-- P13: REFERENCES -->
<div class="pg pg-white">
  <div class="st">REFERENCES &amp; DATA SOURCES</div>
  <div class="ss">Full bibliography and data provenance</div>

  <div class="ref-section">
    <h4>Academic Research</h4>
    <p>Frey, C.B. &amp; Osborne, M.A. (2017). &lsquo;The Future of Employment: How Susceptible Are Jobs to Computerisation?&rsquo; <em>Technological Forecasting and Social Change</em>, 114, 254-280.</p>
    <p>Eloundou, T., Manning, S., Mishkin, P. &amp; Rock, D. (2023). &lsquo;GPTs are GPTs: An Early Look at the Labor Market Impact Potential of Large Language Models.&rsquo; arXiv:2303.10130.</p>
    <p>Acemoglu, D. &amp; Restrepo, P. (2020). &lsquo;Robots and Jobs: Evidence from US Labor Markets.&rsquo; <em>Journal of Political Economy</em>, 128(6), 2188-2244.</p>
    <p>Brynjolfsson, E., Mitchell, T. &amp; Rock, D. (2018). &lsquo;What Can Machines Learn, and What Does It Mean for Occupations and the Economy?&rsquo; <em>AEA Papers and Proceedings</em>, 108, 43-47.</p>
    <p>Noy, S. &amp; Zhang, W. (2023). &lsquo;Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence.&rsquo; <em>Science</em>, 381(6654), 187-192.</p>
  </div>

  <div class="ref-section">
    <h4>Industry Reports</h4>
    <p>World Economic Forum (2025). <em>Future of Jobs Report 2025.</em> Geneva: WEF.</p>
    <p>McKinsey Global Institute (2023). <em>The Economic Potential of Generative AI: The Next Productivity Frontier.</em></p>
    <p>Goldman Sachs (2023). <em>The Potentially Large Effects of Artificial Intelligence on Economic Growth.</em></p>
    <p>PwC Middle East (2024). <em>AI in the Middle East: Opportunities and Challenges.</em></p>
    <p>Kiteworks (2025). <em>Global AI Adoption Index 2025.</em></p>
  </div>

  <div class="ref-section">
    <h4>Government &amp; Institutional Data</h4>
    <p>General Authority for Statistics (GASTAT), Saudi Arabia. GOSI Employment Data Q4-2024.</p>
    <p>Ministry of Human Resources and Social Development (HRSD). Nitaqat Program Guidelines, 2024-2025.</p>
    <p>Saudi Data &amp; Artificial Intelligence Authority (SDAIA). SAMAI 2 Program Report, 2025.</p>
    <p>Human Resources Development Fund (HRDF). Annual Training Report, 2025.</p>
    <p>Challenger, Gray &amp; Christmas. Monthly Job Cuts Report &mdash; AI-Cited Layoffs, 2025.</p>
    <p>layoffs.fyi. Tech Layoff Tracker, accessed March 2026.</p>
    <p>Stanford University Human-Centered AI Institute. AI Index Report, 2025.</p>
  </div>

  <div class="ref-section">
    <h4>News &amp; Analysis</h4>
    <p>Bloomberg, Financial Times, Reuters, CNBC, Wall Street Journal &mdash; various articles cited in layoff tracking data.</p>
  </div>

  <p style="font-size:6.5pt;color:#9CA3AF;margin-top:8pt;font-style:italic">All data in this report was accessed and verified as of March 2026. Employment figures are based on GOSI Q4-2024 data, the most recent available at time of publication. Global layoff data is sourced from layoffs.fyi and Challenger, Gray &amp; Christmas monthly reports.</p>
  ${PF(13)}
</div>

<!-- P14: METHODOLOGY -->
<div class="pg pg-white">
  <div class="st">METHODOLOGY</div>
  <div class="ss">Scoring framework and limitations</div>

  <div class="h3">COMPOSITE SCORE FORMULA</div>
  <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:4pt;padding:10pt 14pt;margin-bottom:12pt;font-family:'JetBrains Mono',monospace;font-size:8pt">
    Score = Automation Probability (40%) + Salary Impact (20%) + Regulatory Pressure (20%) + Demand Signal (20%)
  </div>

  <p>The <strong>Automation Probability</strong> component combines three academic models: Frey &amp; Osborne (2017) computerisation probability, Eloundou et al. (2023) GPT exposure scores, and Felten et al. AI occupational exposure index. These are weighted and normalized to a 0-100 scale.</p>
  <p><strong>Salary Impact</strong> captures the economic incentive to automate: higher-salary roles face stronger employer motivation to deploy AI substitutes. <strong>Regulatory Pressure</strong> incorporates Nitaqat band status, reserved profession lists, and tawteen decision timelines. <strong>Demand Signal</strong> uses WEF Future of Jobs 2025 trend classifications (growing/declining/stable) as a forward-looking adjustment.</p>

  <div class="h3">DATA SOURCES</div>
  <table><thead><tr><th>SOURCE</th><th>DATA</th><th style="width:60pt">PERIOD</th></tr></thead><tbody>
    <tr><td class="fw6">GOSI / GASTAT</td><td>Employment statistics, 13 regions, 20 sectors</td><td>Q4 2024</td></tr>
    <tr><td class="fw6">WEF</td><td>Future of Jobs 2025, occupation trends</td><td>2025</td></tr>
    <tr><td class="fw6">HRSD</td><td>Nitaqat rules, tawteen decisions, reserved professions</td><td>Current</td></tr>
    <tr><td class="fw6">McKinsey</td><td>AI adoption surveys, automation potential</td><td>2023-2025</td></tr>
    <tr><td class="fw6">Frey &amp; Osborne</td><td>Automation probabilities (Oxford)</td><td>Updated 2024</td></tr>
    <tr><td class="fw6">Eloundou et al.</td><td>GPT exposure scores (OpenAI)</td><td>2023</td></tr>
    <tr><td class="fw6">layoffs.fyi</td><td>Global tech layoff tracker</td><td>Real-time</td></tr>
    <tr><td class="fw6">Challenger</td><td>AI-cited job cuts (US)</td><td>Monthly</td></tr>
    <tr><td class="fw6">Kiteworks</td><td>Global AI Adoption Index</td><td>2025</td></tr>
    <tr><td class="fw6">Stanford HAI</td><td>AI Index Report</td><td>2025</td></tr>
  </tbody></table>

  <div class="h3">LIMITATIONS</div>
  <p style="font-size:7.5pt;color:#6B7280">This report provides risk indicators, not predictions. Composite scores combine multiple academic models with local regulatory data. Actual job displacement depends on employer adoption speed, government intervention, global AI capability trajectories, and individual worker adaptability. Employment estimates are approximations derived from GOSI sectoral data and occupation-level surveys. Saudi Arabia-specific automation data remains limited; global models are adapted with local weighting. This report should be used as a strategic planning input, not a definitive forecast.</p>
  <p style="font-size:6.5pt;color:#9CA3AF;margin-top:8pt">&copy; 2026 Samy Aloulou. Data sourced from public databases and published research. Licensed under CC BY-SA 4.0.</p>
  ${PF(14)}
</div>

<!-- P15: BACK COVER -->
<div class="back">
  <div style="margin-bottom:60pt"><span style="font-size:28pt;letter-spacing:0.3em;font-weight:700" class="cyan">SHIFT</span><span style="font-size:28pt;letter-spacing:0.3em;font-weight:700;margin-left:10pt" class="g5">OBSERVATORY</span></div>
  <div style="font-size:11pt;margin-bottom:30pt" class="g4">AI Labor Market Intelligence for Saudi Arabia</div>
  <div style="font-size:9pt;line-height:2.2" class="g5">ksashiftobservatory.online<br>github.com/samy-ksa/shift-observatory<br>samy@monitoringforcegulf.com</div>
  <div style="font-size:9pt;margin-top:30pt;letter-spacing:0.08em" class="cyan">${Q} Edition &mdash; Published ${ED}</div>
  <div style="position:absolute;bottom:25mm;font-size:7pt;text-align:center;line-height:1.6" class="g6">&copy; 2026 Samy Aloulou. Data sourced from public databases. CC BY-SA 4.0.</div>
</div>

</body></html>`;

// ── Generate ────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });
const htmlPath = resolve(OUT_DIR, "report-temp.html");
writeFileSync(htmlPath, HTML, "utf-8");
console.log(`HTML generated (${(HTML.length / 1024).toFixed(0)} KB)`);

console.log("Launching Playwright...");
const { chromium } = await import("playwright");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const pdfPath = resolve(OUT_DIR, OUT_FILE);
await page.pdf({ path: pdfPath, format: "A4", printBackground: true, margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" }, preferCSSPageSize: true });
await browser.close();
unlinkSync(htmlPath);

const size = statSync(pdfPath).size;
console.log(`PDF generated: ${pdfPath}`);
console.log(`Size: ${(size / 1024).toFixed(0)} KB`);
