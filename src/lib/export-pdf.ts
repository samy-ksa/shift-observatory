"use client";

/* ── Types ── */
export interface CareerTransitionRow {
  name_en: string;
  composite: number;
  salaryChange: string;
  difficulty: string;
  emerging: boolean;
}

export interface CareerPDFData {
  currentJob_en: string;
  currentJob_ar: string;
  currentScore: number;
  currentCategory: string;
  transitions: CareerTransitionRow[];
  status: string;
}

export interface BreakdownRow {
  label: string;
  value: number;
  weight: string;
}

export interface ProfilePDFData {
  occupationName: string;
  occupationNameAr: string;
  score: number;
  category: string;
  breakdown: BreakdownRow[];
  findings: string[];
  hrdfPrograms: { name: string; type: string; relevance: string }[];
  sectorName: string;
  regionName: string;
  status: string;
}

/* ── Shared constants ── */
const W = 210; // A4 width
const DARK = [10, 14, 23] as const;
const CARD = [17, 24, 39] as const;
const CYAN = [34, 211, 238] as const;
const WHITE = [255, 255, 255] as const;
const GRAY = [140, 140, 160] as const;
const MUTED = [100, 100, 120] as const;

/* ══════════════════════════════════════════
   Career Transition PDF
   ══════════════════════════════════════════ */
export async function exportCareerPDF(
  data: CareerPDFData,
  filename: string
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF("p", "mm", "a4");
  let y = 0;

  // ── Header bar ──
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 32, "F");
  doc.setTextColor(...CYAN);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SHIFT OBSERVATORY", W / 2, 13, { align: "center" });
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Career Transition Report", W / 2, 23, { align: "center" });
  y = 38;

  // ── Current job card ──
  doc.setFillColor(...CARD);
  doc.roundedRect(12, y, W - 24, 28, 3, 3, "F");

  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.text("CURRENT OCCUPATION", 18, y + 7);

  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(data.currentJob_en, 18, y + 15);

  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(data.currentJob_ar, 18, y + 22);

  // Score on right
  const scoreColor = data.currentScore >= 65
    ? [239, 68, 68]
    : data.currentScore >= 50
    ? [245, 158, 11]
    : data.currentScore >= 35
    ? [59, 130, 246]
    : [16, 185, 129];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(String(data.currentScore), W - 30, y + 14, { align: "center" });
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`/100 | ${data.status}`, W - 30, y + 21, { align: "center" });
  y += 34;

  // ── Arrow ──
  doc.setTextColor(...CYAN);
  doc.setFontSize(12);
  doc.text("\u2193 Recommended Transitions", W / 2, y + 4, { align: "center" });
  y += 10;

  // ── Transitions table ──
  const col1X = 14;
  const col2X = 90;
  const col3X = 125;
  const col4X = 160;

  // Table header
  doc.setFillColor(...CYAN);
  doc.roundedRect(12, y, W - 24, 10, 2, 2, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Target Occupation", col1X, y + 7);
  doc.text("Score", col2X, y + 7);
  doc.text("Salary \u0394", col3X, y + 7);
  doc.text("Difficulty", col4X, y + 7);
  y += 10;

  // Table rows
  doc.setFont("helvetica", "normal");
  data.transitions.forEach((row, i) => {
    const bg: [number, number, number] = i % 2 === 0 ? [...CARD] : [...DARK];
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(12, y, W - 24, 10, "F");

    // Name with emerging badge
    doc.setTextColor(...WHITE);
    doc.setFontSize(8);
    const nameLabel = row.emerging ? `\u2605 ${row.name_en}` : row.name_en;
    doc.text(nameLabel.substring(0, 38), col1X, y + 6.5);

    // Score
    const tScoreColor = row.composite >= 50
      ? [245, 158, 11]
      : row.composite >= 30
      ? [59, 130, 246]
      : [16, 185, 129];
    doc.setTextColor(tScoreColor[0], tScoreColor[1], tScoreColor[2]);
    doc.text(String(row.composite), col2X, y + 6.5);

    // Salary change
    const salPct = parseInt(row.salaryChange);
    doc.setTextColor(
      salPct >= 0 ? 16 : 239,
      salPct >= 0 ? 185 : 68,
      salPct >= 0 ? 129 : 68
    );
    doc.text(row.salaryChange, col3X, y + 6.5);

    // Difficulty
    const diffColor =
      row.difficulty === "easy"
        ? [16, 185, 129]
        : row.difficulty === "moderate"
        ? [245, 158, 11]
        : [239, 68, 68];
    doc.setTextColor(diffColor[0], diffColor[1], diffColor[2]);
    doc.text(
      row.difficulty.charAt(0).toUpperCase() + row.difficulty.slice(1),
      col4X,
      y + 6.5
    );

    y += 10;
  });

  y += 8;

  // ── Legend ──
  doc.setFillColor(...CARD);
  doc.roundedRect(12, y, W - 24, 14, 3, 3, "F");
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.text(
    "\u2605 = Emerging role created by AI economy  |  Score = AI automation risk (lower is safer)",
    18,
    y + 6
  );
  doc.text(
    `Risk reduction from ${data.currentScore} to target score  |  Generated for ${data.status}`,
    18,
    y + 11
  );

  // ── Footer ──
  doc.setFillColor(...DARK);
  doc.rect(0, 280, W, 17, "F");
  doc.setTextColor(...MUTED);
  doc.setFontSize(6.5);
  doc.text(
    "Sources: GASTAT GOSI, WEF Future of Jobs 2025, HRDF, Eloundou et al., Frey & Osborne",
    12,
    287
  );
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} | shift-observatory.vercel.app`,
    12,
    292
  );

  doc.save(filename);
}

/* ══════════════════════════════════════════
   Profile PDF — Premium McKinsey / Bloomberg style
   ══════════════════════════════════════════ */

// Clean color palette for print
const P = {
  dark:     [10, 14, 23]   as const,
  cyan:     [34, 211, 238] as const,
  body:     [17, 24, 39]   as const,  // #111827
  secondary:[107, 114, 128] as const, // #6B7280
  tertiary: [156, 163, 175] as const, // #9CA3AF
  white:    [255, 255, 255] as const,
  rowAlt:   [249, 250, 251] as const, // #F9FAFB
  rowWhite: [255, 255, 255] as const,
  tableHead:[17, 24, 39]   as const,  // #111827
  riskHigh: [220, 38, 38]  as const,  // #DC2626
  riskMod:  [217, 119, 6]  as const,  // #D97706
  riskLow:  [34, 197, 94]  as const,  // #22C55E
  posGreen: [22, 163, 74]  as const,
  negRed:   [220, 38, 38]  as const,
};

function riskColorFor(score: number): readonly [number, number, number] {
  if (score > 70) return P.riskHigh;
  if (score > 45) return P.riskMod;
  return P.riskLow;
}

function riskLabelFor(score: number): string {
  if (score > 70) return "HIGH RISK";
  if (score > 45) return "MODERATE RISK";
  return "LOW RISK";
}

function drawScoreCircle(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  cx: number, cy: number, r: number,
  score: number, color: readonly [number, number, number]
) {
  // Outer ring background
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(2.5);
  doc.circle(cx, cy, r, "S");

  // Colored arc — approximate with thick stroke circle
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(2.8);
  // Draw arc proportional to score (simulate with dashed approach)
  // jsPDF doesn't support arcs easily, so draw a full colored ring
  // and overlay a white wedge for the missing portion
  doc.circle(cx, cy, r, "S");

  // Score number
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text(String(score), cx, cy + 4, { align: "center" });

  // /100 label
  doc.setTextColor(...P.tertiary);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("/100", cx, cy + 12, { align: "center" });
}

export async function exportProfilePDF(
  data: ProfilePDFData,
  filename: string
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF("p", "mm", "a4");
  const M = { l: 18, r: 18 }; // margins
  const CW = W - M.l - M.r; // content width
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // ════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════

  // ── Dark header band (80px ≈ 28mm) ──
  doc.setFillColor(...P.dark);
  doc.rect(0, 0, W, 28, "F");

  // SHIFT OBSERVATORY — tracking-wide
  doc.setTextColor(...P.cyan);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("S H I F T   O B S E R V A T O R Y", M.l, 12);

  // Subtitle
  doc.setTextColor(...P.white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI Risk Profile Report", M.l, 20);

  // Date — right aligned
  doc.setTextColor(...P.tertiary);
  doc.setFontSize(8);
  doc.text(dateStr, W - M.r, 20, { align: "right" });

  // Thin cyan accent line under header
  doc.setDrawColor(...P.cyan);
  doc.setLineWidth(0.6);
  doc.line(0, 28, W, 28);

  let y = 36;

  // ── Hero section: occupation + score ──
  // Occupation name
  doc.setTextColor(...P.body);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const nameLines = doc.splitTextToSize(data.occupationName, CW - 50);
  doc.text(nameLines, M.l, y);
  y += nameLines.length * 8 + 2;

  // Arabic name
  doc.setTextColor(...P.secondary);
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text(data.occupationNameAr, M.l, y);
  y += 8;

  // Context line
  doc.setTextColor(...P.tertiary);
  doc.setFontSize(9);
  doc.text(
    `Sector: ${data.sectorName}  |  Region: ${data.regionName}  |  Status: ${data.status}`,
    M.l, y
  );
  y += 4;

  // Score circle — positioned at right side of hero
  const circleR = 18; // radius ~36mm diameter ≈ 120px
  const circleCx = W - M.r - circleR - 2;
  const circleCy = 50;
  const sc = riskColorFor(data.score);
  drawScoreCircle(doc, circleCx, circleCy, circleR, data.score, sc);

  // Risk label below circle
  doc.setTextColor(sc[0], sc[1], sc[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(riskLabelFor(data.score), circleCx, circleCy + circleR + 6, { align: "center" });

  y = Math.max(y, circleCy + circleR + 14);

  // ── Light separator ──
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(M.l, y, W - M.r, y);
  y += 6;

  // ── Score Breakdown Table ──
  // Section label
  doc.setTextColor(...P.body);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SCORE BREAKDOWN", M.l, y);
  y += 5;

  // Table header
  const tX = M.l;
  const tW = CW;
  const colFactor = tX + 2;
  const colWeight = tX + tW * 0.6;
  const colPoints = tX + tW - 2;
  const rowH = 8;

  doc.setFillColor(...P.tableHead);
  doc.rect(tX, y, tW, rowH, "F");
  doc.setTextColor(...P.white);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("FACTOR", colFactor, y + 5.5);
  doc.text("WEIGHT", colWeight, y + 5.5);
  doc.text("POINTS", colPoints, y + 5.5, { align: "right" });
  y += rowH;

  // Data rows
  data.breakdown.forEach((row, i) => {
    const bg = i % 2 === 0 ? P.rowAlt : P.rowWhite;
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(tX, y, tW, rowH, "F");

    doc.setTextColor(...P.body);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(row.label, colFactor, y + 5.5);

    doc.setTextColor(...P.secondary);
    doc.setFontSize(8);
    doc.text(row.weight, colWeight, y + 5.5);

    // Points — colored
    const ptColor = row.value > 0 ? P.negRed : row.value < 0 ? P.posGreen : P.secondary;
    doc.setTextColor(ptColor[0], ptColor[1], ptColor[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${row.value > 0 ? "+" : ""}${row.value}`,
      colPoints, y + 5.5, { align: "right" }
    );
    y += rowH;
  });

  // Total row — border top + bold
  doc.setDrawColor(...P.body);
  doc.setLineWidth(0.5);
  doc.line(tX, y, tX + tW, y);
  doc.setFillColor(...P.rowAlt);
  doc.rect(tX, y, tW, rowH + 1, "F");
  doc.setTextColor(...P.body);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("OVERALL SCORE", colFactor, y + 6);
  doc.setTextColor(sc[0], sc[1], sc[2]);
  doc.text(String(data.score), colPoints, y + 6, { align: "right" });
  y += rowH + 6;

  // ── Key Findings ──
  if (data.findings.length > 0) {
    // Cyan left border accent + title
    doc.setFillColor(...P.cyan);
    doc.rect(M.l, y, 1, 5, "F");
    doc.setTextColor(...P.body);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("KEY FINDINGS", M.l + 4, y + 4);
    y += 10;

    doc.setTextColor(...P.body);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    data.findings.forEach((f) => {
      const lines = doc.splitTextToSize(f, CW - 10);
      // Bullet
      doc.setFillColor(...P.cyan);
      doc.circle(M.l + 1.5, y - 0.8, 0.8, "F");
      doc.setTextColor(68, 74, 89); // slightly lighter than body for readability
      doc.text(lines, M.l + 6, y);
      y += lines.length * 4 + 3;
    });

    y += 2;
  }

  // ════════════════════════════════════════
  // PAGE 2 — if HRDF programs exist
  // ════════════════════════════════════════
  if (data.hrdfPrograms.length > 0) {
    doc.addPage();
    y = 16;

    // Minimal header on page 2
    doc.setDrawColor(...P.cyan);
    doc.setLineWidth(0.6);
    doc.line(0, 10, W, 10);
    doc.setTextColor(...P.tertiary);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("S H I F T   O B S E R V A T O R Y", M.l, 8);
    doc.text("AI Risk Profile Report", W - M.r, 8, { align: "right" });

    // Section title
    doc.setFillColor(...P.cyan);
    doc.rect(M.l, y, 1, 5, "F");
    doc.setTextColor(...P.body);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("RECOMMENDED HRDF PROGRAMS", M.l + 4, y + 4);
    y += 12;

    // Program cards
    data.hrdfPrograms.slice(0, 5).forEach((prog, i) => {
      // Card background
      const cardH = 18;
      doc.setFillColor(i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 251 : 255);
      doc.roundedRect(M.l, y, CW, cardH, 2, 2, "F");

      // Left cyan accent bar
      doc.setFillColor(...P.cyan);
      doc.roundedRect(M.l, y, 1.5, cardH, 0.5, 0.5, "F");

      // Program name
      doc.setTextColor(...P.body);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(prog.name, M.l + 6, y + 7);

      // Type badge
      const badgeX = M.l + 6 + doc.getTextWidth(prog.name) + 3;
      const badgeW = doc.getTextWidth(prog.type) + 4;
      doc.setFillColor(...P.cyan);
      doc.roundedRect(Math.min(badgeX, W - M.r - badgeW - 4), y + 2.5, badgeW + 2, 5, 1.5, 1.5, "F");
      doc.setTextColor(...P.dark);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text(prog.type, Math.min(badgeX + 1, W - M.r - badgeW - 3), y + 6);

      // Relevance description
      doc.setTextColor(...P.secondary);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const relLines = doc.splitTextToSize(prog.relevance, CW - 10);
      doc.text(relLines[0] || "", M.l + 6, y + 13);
      if (relLines.length > 1) {
        doc.text(relLines[1], M.l + 6, y + 17);
      }

      y += cardH + 4;
    });

    y += 4;

    // ── Disclaimer / methodology note ──
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(M.l, y, W - M.r, y);
    y += 5;

    doc.setTextColor(...P.tertiary);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    const discLines = doc.splitTextToSize(
      "This report is generated from the SHIFT Observatory composite scoring model, combining Eloundou et al. (2023) AI exposure indices, " +
      "Frey & Osborne (2017) automation probabilities, Felten et al. (2021) AI impact scores, WEF Future of Jobs 2025 trend data, " +
      "GASTAT GOSI employment statistics, and HRDF program recommendations. Scores are indicative and should be interpreted alongside " +
      "professional career guidance.",
      CW
    );
    doc.text(discLines, M.l, y);

    // ── Footer ──
    const footY = 282;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(M.l, footY, W - M.r, footY);

    doc.setTextColor(...P.tertiary);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Sources: GASTAT GOSI, WEF Future of Jobs 2025, HRDF, Eloundou et al., Frey & Osborne",
      M.l, footY + 4
    );
    doc.text(`Generated ${dateStr}`, M.l, footY + 8);
    doc.text("ksashiftobservatory.online", W - M.r, footY + 4, { align: "right" });
  }

  // ── Page 1 footer (always) ──
  doc.setPage(1);
  const foot1Y = 282;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(M.l, foot1Y, W - M.r, foot1Y);

  doc.setTextColor(...P.tertiary);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Sources: GASTAT GOSI, WEF Future of Jobs 2025, HRDF, Eloundou et al., Frey & Osborne",
    M.l, foot1Y + 4
  );
  doc.text(`Generated ${dateStr}`, M.l, foot1Y + 8);
  doc.text("ksashiftobservatory.online", W - M.r, foot1Y + 4, { align: "right" });

  if (doc.getNumberOfPages() > 1) {
    doc.setTextColor(...P.tertiary);
    doc.setFontSize(6);
    doc.text("Page 1 of 2", W / 2, foot1Y + 8, { align: "center" });
    doc.setPage(2);
    doc.text("Page 2 of 2", W / 2, 290, { align: "center" });
  }

  doc.save(filename);
}
