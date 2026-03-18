#!/usr/bin/env python3
"""
SHIFT Observatory — Quarterly AI Risk Report Generator
Generates a 12-page McKinsey-style PDF using WeasyPrint.
Usage: python3 scripts/generate-quarterly-report.py
"""

import json
import os
import sys
from pathlib import Path

# ── Config ──────────────────────────────────────────────
QUARTER = "Q1 2026"
QUARTER_RANGE = "January to March"
EDITION_DATE = "March 2026"
DATA_FILE = "src/data/master.json"
OUTPUT_DIR = "public/reports"
OUTPUT_FILE = f"SHIFT-Q1-2026-AI-Risk-Report.pdf"

# ── Load data ───────────────────────────────────────────
root = Path(__file__).resolve().parent.parent
data_path = root / DATA_FILE
output_path = root / OUTPUT_DIR / OUTPUT_FILE

with open(data_path) as f:
    data = json.load(f)

hero = data["hero"]
sectors = data["sectors"]
all_occupations = data["occupations"]["high_risk"] + data["occupations"]["low_risk"]
all_occupations_sorted = sorted(all_occupations, key=lambda x: x.get("composite", 0), reverse=True)
lowest_risk = sorted(all_occupations, key=lambda x: x.get("composite", 0))
layoffs = data["layoffs"]
nitaqat = data["nitaqat"]
tawteen = nitaqat["tawteen_decisions_2024_2025"]
bands = nitaqat["band_consequences"]
sectors_sorted = sorted(sectors, key=lambda x: x["ai_risk_score"], reverse=True)
hrdf = data["hrdf_programs"]["programs"]


def fmt_num(n):
    """Format number with commas."""
    if isinstance(n, (int, float)):
        if n == int(n):
            return f"{int(n):,}"
        return f"{n:,.1f}"
    return str(n)


def risk_color(score):
    if score >= 65:
        return "#DC2626"
    elif score >= 45:
        return "#D97706"
    elif score >= 30:
        return "#EAB308"
    else:
        return "#22C55E"


def risk_label(score):
    if score >= 65:
        return "Very High"
    elif score >= 45:
        return "High"
    elif score >= 30:
        return "Moderate"
    else:
        return "Low"


def wef_label(trend):
    labels = {
        "decline_brutal": "Rapid Decline",
        "decline": "Declining",
        "stable": "Stable",
        "growth": "Growing",
        "growth_rapid": "Rapid Growth",
    }
    return labels.get(trend, trend or "—")


def bar_color(score):
    if score >= 65:
        return "#DC2626"
    elif score >= 50:
        return "#EA580C"
    elif score >= 30:
        return "#D97706"
    else:
        return "#22C55E"


# ── CSS ─────────────────────────────────────────────────
CSS = """
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

@page {
    size: A4;
    margin: 25mm 20mm;
    @bottom-center {
        font-family: 'DM Sans', sans-serif;
        font-size: 7pt;
        color: #9CA3AF;
        content: "SHIFT Observatory  |  """ + QUARTER + """  |  Page " counter(page) " of 12";
    }
}

@page :first {
    @bottom-center { content: none; }
    margin: 0;
}

@page cover {
    margin: 0;
    @bottom-center { content: none; }
}

@page dark {
    background: #0A0E17;
    @bottom-center {
        color: #4B5563;
        content: "SHIFT Observatory  |  """ + QUARTER + """  |  Page " counter(page) " of 12";
    }
}

@page back {
    margin: 0;
    @bottom-center { content: none; }
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'DM Sans', sans-serif;
    font-size: 9.5pt;
    line-height: 1.5;
    color: #111827;
}

.mono { font-family: 'JetBrains Mono', monospace; }

/* ── Page containers ── */
.page {
    page-break-before: always;
    min-height: 100%;
    padding: 0;
}
.page:first-child { page-break-before: avoid; }

.page-dark {
    page: dark;
    background: #0A0E17;
    color: #FFFFFF;
    padding: 25mm 20mm;
}

.page-white {
    background: #FFFFFF;
    color: #111827;
}

.page-cover {
    page: cover;
    background: #0A0E17;
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 297mm;
    padding: 40mm 30mm;
    text-align: center;
}

.page-back {
    page: back;
    background: #0A0E17;
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 297mm;
    padding: 40mm 30mm;
    text-align: center;
}

/* ── Typography ── */
.section-title {
    font-size: 14pt;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 4pt;
}

.section-subtitle {
    font-size: 9pt;
    color: #6B7280;
    margin-bottom: 20pt;
}

.section-subtitle-dark {
    font-size: 9pt;
    color: #9CA3AF;
    margin-bottom: 20pt;
}

.cyan { color: #22D3EE; }
.gray-400 { color: #9CA3AF; }
.gray-500 { color: #6B7280; }
.gray-600 { color: #4B5563; }

/* ── KPI Grid ── */
.kpi-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16pt;
    margin-top: 24pt;
}
.kpi-box {
    flex: 1 1 30%;
    min-width: 140pt;
    border: 1px solid #1F2937;
    border-radius: 6pt;
    padding: 16pt;
}
.kpi-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 22pt;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.1;
    margin-bottom: 6pt;
}
.kpi-label {
    font-size: 8pt;
    color: #9CA3AF;
    line-height: 1.3;
}

/* ── Tables ── */
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin-top: 10pt;
}
table th {
    background: #0A0E17;
    color: #FFFFFF;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 8pt 10pt;
    text-align: left;
    font-size: 7.5pt;
}
table td {
    padding: 7pt 10pt;
    border-bottom: 1px solid #E5E7EB;
    vertical-align: middle;
}
table tr:nth-child(even) td { background: #F9FAFB; }
table tr:nth-child(odd) td { background: #FFFFFF; }
.text-right { text-align: right; }
.text-center { text-align: center; }

/* Dark table variant */
.table-dark th {
    background: #111827;
    border-bottom: 1px solid #374151;
}
.table-dark td {
    border-bottom: 1px solid #1F2937;
    color: #E5E7EB;
}
.table-dark tr:nth-child(even) td { background: #0F1629; }
.table-dark tr:nth-child(odd) td { background: #0A0E17; }

/* ── Score dot ── */
.score-dot {
    display: inline-block;
    width: 8pt;
    height: 8pt;
    border-radius: 50%;
    margin-right: 5pt;
    vertical-align: middle;
}

/* ── Bars ── */
.bar-container {
    margin-bottom: 8pt;
}
.bar-row {
    display: flex;
    align-items: center;
    margin-bottom: 5pt;
}
.bar-label {
    width: 200pt;
    font-size: 8pt;
    color: #374151;
    text-align: right;
    padding-right: 10pt;
    white-space: nowrap;
    overflow: hidden;
}
.bar-track {
    flex: 1;
    height: 16pt;
    background: #F3F4F6;
    border-radius: 3pt;
    position: relative;
}
.bar-fill {
    height: 100%;
    border-radius: 3pt;
    min-width: 2pt;
}
.bar-score {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8pt;
    font-weight: 600;
    width: 36pt;
    text-align: right;
    padding-left: 6pt;
}

/* ── Callout ── */
.callout {
    border-left: 3pt solid #22D3EE;
    background: #F0FDFA;
    padding: 12pt 16pt;
    margin-top: 16pt;
    font-size: 8.5pt;
    line-height: 1.5;
}
.callout-dark {
    border-left: 3pt solid #22D3EE;
    background: #0F1629;
    padding: 12pt 16pt;
    margin-top: 16pt;
    font-size: 8.5pt;
    line-height: 1.5;
    color: #D1D5DB;
}
.callout strong { color: #22D3EE; }

/* ── Badge ── */
.badge {
    display: inline-block;
    font-size: 7pt;
    font-weight: 600;
    padding: 2pt 6pt;
    border-radius: 3pt;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
.badge-red { color: #DC2626; border: 1px solid #DC2626; }
.badge-orange { color: #D97706; border: 1px solid #D97706; }
.badge-gray { color: #6B7280; border: 1px solid #6B7280; }

/* ── Two-column ── */
.two-col {
    display: flex;
    gap: 20pt;
}
.two-col > div { flex: 1; }

/* ── Transition card ── */
.transition-card {
    border: 1px solid #E5E7EB;
    border-radius: 6pt;
    padding: 14pt;
    margin-bottom: 12pt;
}
.transition-arrow {
    font-family: 'JetBrains Mono', monospace;
    color: #22D3EE;
    font-size: 14pt;
    margin: 0 8pt;
}
.transition-score {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 10pt;
    padding: 2pt 6pt;
    border-radius: 3pt;
    color: #fff;
}

/* ── VS block ── */
.vs-grid {
    display: flex;
    gap: 0;
    margin-top: 16pt;
}
.vs-col {
    flex: 1;
    padding: 14pt;
}
.vs-col:first-child { border-right: 2pt solid #374151; }
.vs-col h4 {
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 10pt;
}
.vs-col ul {
    list-style: none;
    padding: 0;
}
.vs-col li {
    font-size: 8.5pt;
    padding: 4pt 0;
    border-bottom: 1px solid #E5E7EB;
    color: #374151;
}
.vs-col li::before {
    content: "\\2022 ";
    margin-right: 4pt;
}

/* ── Methodology table ── */
.meth-table td:first-child {
    font-weight: 600;
    width: 140pt;
    white-space: nowrap;
}
"""

# ── HTML Generation ─────────────────────────────────────

# Helper: top 10 table rows
def occupation_rows(occ_list, count=10):
    rows = ""
    for i, o in enumerate(occ_list[:count], 1):
        score = o.get("composite", 0)
        emp = o.get("employment_est", "—")
        emp_str = fmt_num(emp) if isinstance(emp, (int, float)) else str(emp)
        cat = o.get("category", "—").replace("_", " ").title()
        wef = wef_label(o.get("wef_trend"))
        color = risk_color(score)
        rows += f"""<tr>
            <td class="text-center mono" style="font-weight:600">{i}</td>
            <td style="font-weight:500">{o['name_en']}</td>
            <td class="text-right mono"><span class="score-dot" style="background:{color}"></span>{score:.1f}</td>
            <td class="text-right mono">{emp_str}</td>
            <td>{cat}</td>
            <td>{wef}</td>
        </tr>"""
    return rows


# Layoff rows
layoff_cases = sorted(layoffs["ai_cases_global"], key=lambda x: x.get("jobs") or 0, reverse=True)

def layoff_rows():
    rows = ""
    for c in layoff_cases[:15]:
        t = c.get("type", "suspected")
        if t == "confirmed":
            badge = '<span class="badge badge-red">AI CITED</span>'
        elif t == "probable":
            badge = '<span class="badge badge-orange">AI FACTOR</span>'
        else:
            badge = '<span class="badge badge-gray">SUSPECTED</span>'
        rows += f"""<tr>
            <td>{c['company']}</td>
            <td class="text-right mono">{fmt_num(c.get('jobs',0))}</td>
            <td>{badge}</td>
            <td>{c.get('date','—')}</td>
        </tr>"""
    return rows


# Sector bar chart
def sector_bars():
    html = ""
    max_score = max(s["ai_risk_score"] for s in sectors)
    for s in sectors_sorted:
        score = s["ai_risk_score"]
        pct = (score / max_score) * 100
        color = bar_color(score)
        html += f"""<div class="bar-row">
            <div class="bar-label">{s['name_en']}</div>
            <div class="bar-track"><div class="bar-fill" style="width:{pct}%;background:{color}"></div></div>
            <div class="bar-score" style="color:{color}">{score}</div>
        </div>"""
    return html


# Tawteen table
def tawteen_rows(count=10):
    rows = ""
    for t in tawteen[:count]:
        rows += f"""<tr>
            <td style="font-weight:500">{t['profession']}</td>
            <td class="text-center mono">{t['quota_pct']}%</td>
            <td>{t['effective']}</td>
            <td>{t['phase']}</td>
        </tr>"""
    return rows


# Band table
def band_rows():
    rows = ""
    colors = {
        "Platinum": "#22D3EE",
        "High Green": "#22C55E",
        "Medium Green": "#4ADE80",
        "Low Green": "#86EFAC",
        "Red": "#DC2626",
    }
    for name, perms in bands.items():
        color = colors.get(name, "#6B7280")
        yes = "&#10003;"
        no = "&#10007;"
        rows += f"""<tr>
            <td style="font-weight:600;color:{color}">{name}</td>
            <td class="text-center">{'<span style="color:#22C55E">'+yes+'</span>' if perms.get('new_visas') else '<span style="color:#DC2626">'+no+'</span>'}</td>
            <td class="text-center">{'<span style="color:#22C55E">'+yes+'</span>' if perms.get('change_occupations') else '<span style="color:#DC2626">'+no+'</span>'}</td>
            <td class="text-center">{'<span style="color:#22C55E">'+yes+'</span>' if perms.get('renew_permits') else '<span style="color:#DC2626">'+no+'</span>'}</td>
            <td class="text-center">{'<span style="color:#22C55E">'+yes+'</span>' if perms.get('transfer_in') else '<span style="color:#DC2626">'+no+'</span>'}</td>
        </tr>"""
    return rows


# ── Build Full HTML ─────────────────────────────────────
# Compute summary stats
total_high_risk = len([o for o in all_occupations if o.get("composite", 0) >= 45])
high_risk_expat_jobs = sum(
    o.get("employment_est", 0) * (1 - o.get("employment_saudi_pct", 50) / 100)
    for o in all_occupations if o.get("composite", 0) >= 45
    and isinstance(o.get("employment_est"), (int, float))
)
high_risk_saudi_jobs = sum(
    o.get("employment_est", 0) * (o.get("employment_saudi_pct", 50) / 100)
    for o in all_occupations if o.get("composite", 0) >= 45
    and isinstance(o.get("employment_est"), (int, float))
)

top10_employment = sum(
    o.get("employment_est", 0)
    for o in all_occupations_sorted[:10]
    if isinstance(o.get("employment_est"), (int, float))
)

HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>{CSS}</style>
</head>
<body>

<!-- ════════════════════════════════════════════════════════
     PAGE 1 — COVER
     ════════════════════════════════════════════════════════ -->
<div class="page-cover">
    <div style="margin-bottom:80pt">
        <div style="font-size:16pt;letter-spacing:0.3em;font-weight:700">
            <span class="cyan">SHIFT</span>
            <span class="gray-500" style="margin-left:8pt">OBSERVATORY</span>
        </div>
    </div>
    <div style="margin-bottom:24pt">
        <div style="font-size:32pt;font-weight:700;letter-spacing:0.02em;line-height:1.15">
            THE AI DISRUPTION<br>INDEX
        </div>
    </div>
    <div style="font-size:11pt;color:#9CA3AF;margin-bottom:16pt">
        Saudi Arabia Labor Market Intelligence Report
    </div>
    <div style="font-size:10pt;color:#22D3EE;letter-spacing:0.1em;margin-bottom:60pt">
        {QUARTER} &mdash; {QUARTER_RANGE}
    </div>
    <div style="font-size:8pt;color:#6B7280;line-height:1.6;max-width:350pt">
        Based on GOSI, WEF, HRSD, McKinsey, and academic research
    </div>
    <div style="position:absolute;bottom:30mm;font-size:7.5pt;color:#4B5563;letter-spacing:0.08em">
        ksashiftobservatory.online
    </div>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 2 — AT A GLANCE (dark)
     ════════════════════════════════════════════════════════ -->
<div class="page page-dark">
    <div class="section-title cyan">AT A GLANCE</div>
    <div class="section-subtitle-dark">Key figures shaping Saudi Arabia's AI workforce landscape</div>

    <div class="kpi-grid">
        <div class="kpi-box">
            <div class="kpi-number">{fmt_num(hero.get('total_nonsaudi_gosi', 0))}</div>
            <div class="kpi-label">Expat workers in Saudi Arabia<br>(GOSI Q4-2024)</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-number">{len(all_occupations)}</div>
            <div class="kpi-label">Occupations scored on AI<br>automation risk</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-number">{fmt_num(layoffs['totals'].get('tech_global_2025', 0))}</div>
            <div class="kpi-label">Global tech layoffs in 2025<br>(layoffs.fyi)</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-number">{fmt_num(layoffs['challenger'].get('2025_ai_cited', 0))}</div>
            <div class="kpi-label">AI-cited job cuts in the US<br>(Challenger 2025)</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-number">34,650</div>
            <div class="kpi-label">Tech layoffs 2026 YTD<br>(48 companies)</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-number">{len(nitaqat.get('reserved_professions_100', []))}</div>
            <div class="kpi-label">Professions reserved<br>exclusively for Saudis</div>
        </div>
    </div>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 3 — EXECUTIVE SUMMARY (white)
     ════════════════════════════════════════════════════════ -->
<div class="page page-white">
    <div class="section-title">EXECUTIVE SUMMARY</div>
    <div class="section-subtitle">{QUARTER} &mdash; Saudi Arabia AI Labor Market Intelligence</div>

    <p style="margin-bottom:10pt;text-align:justify">
        Saudi Arabia's labor market sits at the intersection of two powerful and potentially contradictory forces. On one side, Vision 2030 drives aggressive nationalization of the workforce through Saudization quotas, Nitaqat band enforcement, and an expanding list of reserved professions. On the other, the Kingdom has positioned itself as the #1 country globally in AI adoption (Kiteworks Global AI Adoption Index, 2025), with sovereign AI investments exceeding $40 billion through PIF, HUMAIN, and partnerships with Qualcomm, NVIDIA, and others.
    </p>
    <p style="margin-bottom:10pt;text-align:justify">
        This creates what we call the <strong>V2030 Paradox</strong>: the same technologies the Kingdom is championing will automate significant portions of the jobs it is simultaneously trying to nationalize. Our analysis of {len(all_occupations)} occupations reveals that {total_high_risk} face high or very high automation risk (composite score &gt;45/100), representing approximately {fmt_num(int(high_risk_expat_jobs))} expat positions and an estimated {fmt_num(int(high_risk_saudi_jobs))} Saudi positions.
    </p>
    <p style="margin-bottom:10pt;text-align:justify">
        Globally, the pace of AI-driven workforce disruption accelerated dramatically in Q1 2026. Block Inc. became the first S&amp;P 500 company to explicitly halve its workforce citing AI, with CEO Jack Dorsey stating that &ldquo;intelligence tools have changed what it means to build a company.&rdquo; This follows {fmt_num(layoffs['totals'].get('tech_global_2025', 0))} tech layoffs in 2025, of which {fmt_num(layoffs['challenger'].get('2025_ai_cited', 0))} were explicitly AI-cited in the US alone.
    </p>
    <p style="margin-bottom:10pt;text-align:justify">
        For professionals working in Saudi Arabia &mdash; both Saudi nationals navigating Saudization requirements and expatriates facing dual pressure from AI and regulatory displacement &mdash; the question is no longer whether disruption is coming, but how fast and in which sectors first.
    </p>

    <div class="callout">
        <strong>KEY INSIGHT:</strong> {total_high_risk} of {len(all_occupations)} occupations scored above our high-risk threshold (45/100). The sectors most exposed are {sectors_sorted[0]['name_en']} ({sectors_sorted[0]['ai_risk_score']}/100), {sectors_sorted[1]['name_en']} ({sectors_sorted[1]['ai_risk_score']}/100), and {sectors_sorted[2]['name_en']} ({sectors_sorted[2]['ai_risk_score']}/100).
    </div>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 4 — TOP 10 HIGHEST RISK (white)
     ════════════════════════════════════════════════════════ -->
<div class="page page-white">
    <div class="section-title">HIGHEST AI AUTOMATION RISK</div>
    <div class="section-subtitle">Top 10 occupations by composite risk score &mdash; {QUARTER}</div>

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width:36pt">RANK</th>
                <th>OCCUPATION</th>
                <th class="text-right" style="width:60pt">SCORE</th>
                <th class="text-right" style="width:72pt">WORKFORCE</th>
                <th style="width:90pt">CATEGORY</th>
                <th style="width:80pt">WEF TREND</th>
            </tr>
        </thead>
        <tbody>
            {occupation_rows(all_occupations_sorted)}
        </tbody>
    </table>

    <p style="margin-top:14pt;font-size:8.5pt;color:#374151;line-height:1.5">
        {all_occupations_sorted[0]['name_en']} lead with {all_occupations_sorted[0]['composite']:.1f}/100, representing approximately {fmt_num(all_occupations_sorted[0].get('employment_est', 0))} workers in Saudi Arabia. The top 10 most exposed roles collectively employ over {fmt_num(int(top10_employment))} workers, predominantly expats in administrative and financial services.
    </p>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 5 — TOP 10 SAFEST (white)
     ════════════════════════════════════════════════════════ -->
<div class="page page-white">
    <div class="section-title">LOWEST AI AUTOMATION RISK</div>
    <div class="section-subtitle">Top 10 occupations by composite risk score (ascending) &mdash; {QUARTER}</div>

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width:36pt">RANK</th>
                <th>OCCUPATION</th>
                <th class="text-right" style="width:60pt">SCORE</th>
                <th class="text-right" style="width:72pt">WORKFORCE</th>
                <th style="width:90pt">CATEGORY</th>
                <th style="width:80pt">WEF TREND</th>
            </tr>
        </thead>
        <tbody>
            {occupation_rows(lowest_risk)}
        </tbody>
    </table>

    <p style="margin-top:14pt;font-size:8.5pt;color:#374151;line-height:1.5">
        {lowest_risk[0]['name_en']}, despite cultural significance, score only {lowest_risk[0]['composite']:.1f}/100 &mdash; roles requiring deep human judgment, physical presence, and emotional intelligence remain the strongest defense against AI automation. Healthcare roles (Dentists, Registered Nurses) consistently score below 15/100.
    </p>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 6 — SECTOR ANALYSIS (white)
     ════════════════════════════════════════════════════════ -->
<div class="page page-white">
    <div class="section-title">SECTOR AI EXPOSURE MAP</div>
    <div class="section-subtitle">20 ISIC sectors ranked by AI risk score &mdash; bar width proportional to exposure</div>

    <div style="margin-top:10pt">
        {sector_bars()}
    </div>

    <p style="margin-top:14pt;font-size:8.5pt;color:#374151;line-height:1.5">
        {sectors_sorted[0]['name_en']} leads sector exposure at {sectors_sorted[0]['ai_risk_score']}/100, driven by the high automation potential of administrative support, document processing, and data management roles. Construction ({[s for s in sectors if 'onstruct' in s['name_en']][0]['ai_risk_score']}/100) and Healthcare ({[s for s in sectors if 'ealth' in s['name_en']][0]['ai_risk_score']}/100) remain the most resilient.
    </p>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 7 — GLOBAL AI LAYOFFS (dark)
     ════════════════════════════════════════════════════════ -->
<div class="page page-dark">
    <div class="section-title cyan">GLOBAL AI-DRIVEN LAYOFFS</div>
    <div class="section-subtitle-dark">Major workforce reductions citing AI &mdash; 2024 to {QUARTER}</div>

    <table class="table-dark">
        <thead>
            <tr>
                <th>COMPANY</th>
                <th class="text-right" style="width:72pt">JOBS CUT</th>
                <th style="width:80pt">AI ROLE</th>
                <th style="width:72pt">DATE</th>
            </tr>
        </thead>
        <tbody>
            {layoff_rows()}
        </tbody>
    </table>

    <div class="callout-dark">
        <strong>SIGNAL:</strong> Block Inc. (Feb 2026) marks a turning point &mdash; the first major public company to frame AI replacement not as cost-cutting but as strategic architecture. CEO Dorsey described AI as changing the fundamental meaning of building a company.
    </div>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 8 — SAUDIZATION & NITAQAT (white)
     ════════════════════════════════════════════════════════ -->
<div class="page page-white">
    <div class="section-title">SAUDIZATION LANDSCAPE &mdash; {QUARTER}</div>
    <div class="section-subtitle">Tawteen decisions and Nitaqat band structure</div>

    <div style="margin-bottom:16pt">
        <h3 style="font-size:10pt;font-weight:700;margin-bottom:8pt;letter-spacing:0.05em">KEY TAWTEEN DECISIONS</h3>
        <table>
            <thead>
                <tr>
                    <th>PROFESSION</th>
                    <th class="text-center" style="width:60pt">QUOTA</th>
                    <th style="width:100pt">EFFECTIVE</th>
                    <th style="width:72pt">PHASE</th>
                </tr>
            </thead>
            <tbody>
                {tawteen_rows(10)}
            </tbody>
        </table>
    </div>

    <div style="margin-top:16pt">
        <h3 style="font-size:10pt;font-weight:700;margin-bottom:8pt;letter-spacing:0.05em">NITAQAT BAND PRIVILEGES</h3>
        <table>
            <thead>
                <tr>
                    <th>BAND</th>
                    <th class="text-center">NEW VISAS</th>
                    <th class="text-center">CHANGE OCC.</th>
                    <th class="text-center">RENEW PERMITS</th>
                    <th class="text-center">TRANSFER IN</th>
                </tr>
            </thead>
            <tbody>
                {band_rows()}
            </tbody>
        </table>
    </div>

    <p style="margin-top:12pt;font-size:8.5pt;color:#374151;line-height:1.5">
        Engineering professions reached 25% Saudization quota in July 2024, with Phase 2 expected to push to 30%+. Consulting professions hit 40% in March 2024. The trend is clear: every quarter, new professions are added to the tawteen pipeline, systematically reducing the share of roles available to expatriate workers.
    </p>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 9 — V2030 PARADOX (white)
     ════════════════════════════════════════════════════════ -->
<div class="page page-white">
    <div class="section-title">THE VISION 2030 PARADOX</div>
    <div class="section-subtitle">When AI ambitions meet employment targets</div>

    <div class="vs-grid" style="border:1px solid #E5E7EB;border-radius:6pt;overflow:hidden">
        <div class="vs-col" style="background:#F0FDFA">
            <h4 class="cyan">AI ACCELERATION</h4>
            <ul>
                <li>KSA #1 in global AI adoption index (Kiteworks 2025)</li>
                <li>PIF $40B+ AI investment through HUMAIN</li>
                <li>HUMAIN + Qualcomm MOU for sovereign AI</li>
                <li>SAMAI 2: 1.1M Saudis trained in AI skills</li>
                <li>stc: 80%+ customer queries handled by AI</li>
                <li>Aramco: AI expansion across all operations</li>
            </ul>
        </div>
        <div class="vs-col" style="background:#FFF7ED">
            <h4 style="color:#D97706">EMPLOYMENT PROTECTION</h4>
            <ul>
                <li>{len(nitaqat.get('reserved_professions_100',[]))} professions reserved for Saudis only</li>
                <li>{len(tawteen)} recent tawteen decisions (2024-2025)</li>
                <li>Nitaqat quotas tightening quarterly</li>
                <li>HRDF reskilling programs scaling rapidly</li>
                <li>7% unemployment target (currently met)</li>
                <li>30% female workforce participation target</li>
            </ul>
        </div>
    </div>

    <p style="margin-top:16pt;font-size:8.5pt;color:#374151;line-height:1.5;text-align:justify">
        This is the central tension of Saudi Arabia's economic transformation. The Kingdom is simultaneously the most aggressive AI adopter in the Middle East and the most aggressive labor market regulator. These forces will eventually collide &mdash; the question is which occupations, sectors, and worker populations will be caught in the crossfire. Vision 2030 programs aim to create an estimated {fmt_num(hero.get('v2030_jobs_target_net', 0))} net new jobs, yet our analysis identifies {fmt_num(hero.get('jobs_ai_exposure_weighted', 0))} positions with meaningful AI exposure risk.
    </p>

    <div class="callout">
        <strong>THE PARADOX IN NUMBERS:</strong> V2030 targets ~{fmt_num(hero.get('v2030_jobs_target_net', 0))} net new jobs. AI threatens ~{fmt_num(hero.get('jobs_ai_exposure_weighted', 0))} existing positions. The gap is not a prediction of job loss &mdash; it is a measure of the policy tension that Saudi planners must navigate.
    </div>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 10 — CAREER TRANSITIONS (white)
     ════════════════════════════════════════════════════════ -->
<div class="page page-white">
    <div class="section-title">RECOMMENDED TRANSITION PATHWAYS</div>
    <div class="section-subtitle">Example career transitions from high-risk to lower-risk occupations</div>

    <div class="transition-card">
        <div style="display:flex;align-items:center;margin-bottom:8pt">
            <span style="font-weight:600">Data Entry Keyers</span>
            <span class="transition-score" style="background:#DC2626;margin-left:8pt">94.9</span>
            <span class="transition-arrow">&rarr;</span>
            <span style="font-weight:600">RPA Developer</span>
            <span class="transition-score" style="background:#22C55E;margin-left:8pt">35.0</span>
        </div>
        <div style="font-size:8pt;color:#6B7280">
            <strong style="color:#22D3EE">Easy transition</strong> &mdash; Leverage existing data familiarity. Doroob digital skills track + UiPath Academy certification. HRDF-supported via Tamheer program.
        </div>
    </div>

    <div class="transition-card">
        <div style="display:flex;align-items:center;margin-bottom:8pt">
            <span style="font-weight:600">Accountants &amp; Auditors</span>
            <span class="transition-score" style="background:#DC2626;margin-left:8pt">88.2</span>
            <span class="transition-arrow">&rarr;</span>
            <span style="font-weight:600">Financial Analyst</span>
            <span class="transition-score" style="background:#D97706;margin-left:8pt">52.0</span>
        </div>
        <div style="font-size:8pt;color:#6B7280">
            <strong style="color:#D97706">Moderate transition</strong> &mdash; Leverage existing finance expertise. CFA pathway or data analytics certification. Move from compliance to strategic advisory.
        </div>
    </div>

    <div class="transition-card">
        <div style="display:flex;align-items:center;margin-bottom:8pt">
            <span style="font-weight:600">Administrative Assistants</span>
            <span class="transition-score" style="background:#DC2626;margin-left:8pt">85.2</span>
            <span class="transition-arrow">&rarr;</span>
            <span style="font-weight:600">Social Media Manager</span>
            <span class="transition-score" style="background:#D97706;margin-left:8pt">42.0</span>
        </div>
        <div style="font-size:8pt;color:#6B7280">
            <strong style="color:#22C55E">Easy transition</strong> &mdash; Transferable communication and organizational skills. Google Digital Marketing certification. Growing demand from Saudi brands and government entities.
        </div>
    </div>

    <div class="callout">
        <strong>HRDF SUPPORT:</strong> The Human Resources Development Fund offers {len(hrdf)} major programs ({', '.join(p['name'] for p in hrdf[:4])}) covering on-the-job training, wage subsidies, and certification support for Saudi nationals transitioning careers.
    </div>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 11 — METHODOLOGY (white)
     ════════════════════════════════════════════════════════ -->
<div class="page page-white">
    <div class="section-title">METHODOLOGY &amp; DATA SOURCES</div>
    <div class="section-subtitle">Scoring framework, data provenance, and limitations</div>

    <h3 style="font-size:9pt;font-weight:700;margin-bottom:8pt;letter-spacing:0.05em">COMPOSITE SCORE FORMULA</h3>
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:4pt;padding:10pt 14pt;margin-bottom:16pt;font-family:'JetBrains Mono',monospace;font-size:8.5pt">
        Score = Automation Probability (40%) + Salary Impact (20%) + Regulatory Pressure (20%) + Demand Signal (20%)
    </div>

    <h3 style="font-size:9pt;font-weight:700;margin-bottom:8pt;letter-spacing:0.05em">DATA SOURCES</h3>
    <table class="meth-table">
        <thead>
            <tr>
                <th>SOURCE</th>
                <th>DATA</th>
                <th style="width:72pt">PERIOD</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>GOSI / GASTAT</td><td>Employment statistics, 13 regions, 20 sectors</td><td>Q4 2024</td></tr>
            <tr><td>WEF</td><td>Future of Jobs 2025, occupation trend classifications</td><td>2025</td></tr>
            <tr><td>HRSD</td><td>Nitaqat rules, tawteen decisions, reserved professions</td><td>Current</td></tr>
            <tr><td>McKinsey</td><td>AI adoption surveys, automation potential estimates</td><td>2023-2025</td></tr>
            <tr><td>Frey &amp; Osborne</td><td>Occupation automation probabilities (Oxford)</td><td>Updated 2024</td></tr>
            <tr><td>Eloundou et al.</td><td>GPT exposure scores by occupation (OpenAI)</td><td>2023</td></tr>
            <tr><td>layoffs.fyi</td><td>Global tech layoff tracker</td><td>Real-time</td></tr>
            <tr><td>Challenger</td><td>AI-cited job cut reports (US)</td><td>Monthly</td></tr>
            <tr><td>Kiteworks</td><td>Global AI Adoption Index (KSA #1)</td><td>2025</td></tr>
            <tr><td>Stanford HAI</td><td>AI Index Report (citations, patents, investment)</td><td>2025</td></tr>
        </tbody>
    </table>

    <h3 style="font-size:9pt;font-weight:700;margin-top:16pt;margin-bottom:6pt;letter-spacing:0.05em">LIMITATIONS</h3>
    <p style="font-size:8pt;color:#6B7280;line-height:1.5">
        This report provides risk indicators, not predictions. Composite scores combine multiple academic models with local regulatory data. Actual job displacement depends on employer adoption speed, government intervention, global AI capability trajectories, and individual worker adaptability. Employment estimates are approximations derived from GOSI sectoral data and occupation-level surveys. Saudi Arabia-specific automation data remains limited; global models are adapted with local weighting. This report should be used as a strategic planning input, not a definitive forecast.
    </p>
    <p style="font-size:7pt;color:#9CA3AF;margin-top:10pt">
        &copy; 2026 Samy Aloulou. Data sourced from public databases and published research. Licensed under CC BY-SA 4.0.
    </p>
</div>

<!-- ════════════════════════════════════════════════════════
     PAGE 12 — BACK COVER (dark)
     ════════════════════════════════════════════════════════ -->
<div class="page-back">
    <div style="margin-bottom:60pt">
        <div style="font-size:28pt;letter-spacing:0.3em;font-weight:700">
            <span class="cyan">SHIFT</span>
            <span class="gray-500" style="margin-left:10pt">OBSERVATORY</span>
        </div>
    </div>
    <div style="font-size:11pt;color:#9CA3AF;margin-bottom:30pt">
        AI Labor Market Intelligence for Saudi Arabia
    </div>
    <div style="font-size:9pt;color:#6B7280;line-height:2.2">
        ksashiftobservatory.online<br>
        github.com/samy-ksa/shift-observatory<br>
        samy@monitoringforcegulf.com
    </div>
    <div style="font-size:9pt;color:#22D3EE;margin-top:30pt;letter-spacing:0.08em">
        {QUARTER} Edition &mdash; Published {EDITION_DATE}
    </div>
    <div style="position:absolute;bottom:25mm;font-size:7pt;color:#4B5563;text-align:center;line-height:1.6">
        &copy; 2026 Samy Aloulou. Data sourced from public databases. CC BY-SA 4.0.
    </div>
</div>

</body>
</html>
"""

# ── Generate PDF ────────────────────────────────────────
print("Generating HTML...")
html_path = output_path.with_suffix(".html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(HTML)
print(f"HTML saved: {html_path}")

print("Generating PDF with WeasyPrint...")
try:
    from weasyprint import HTML as WPHTML
    WPHTML(string=HTML, base_url=str(root)).write_pdf(str(output_path))
    print(f"PDF saved: {output_path}")
    print(f"Size: {output_path.stat().st_size / 1024:.0f} KB")
except ImportError:
    print("ERROR: WeasyPrint not installed. Run: pip install weasyprint --break-system-packages")
    sys.exit(1)

# Clean up HTML
os.remove(html_path)
print("Done.")
