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
   Profile PDF
   ══════════════════════════════════════════ */
export async function exportProfilePDF(
  data: ProfilePDFData,
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
  doc.text("AI Risk Profile Report", W / 2, 23, { align: "center" });
  y = 38;

  // ── Occupation name ──
  doc.setFillColor(...CARD);
  doc.roundedRect(12, y, W - 24, 16, 3, 3, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(data.occupationName, W / 2, y + 7, { align: "center" });
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(data.occupationNameAr, W / 2, y + 13, { align: "center" });
  y += 22;

  // ── Score display ──
  doc.setFillColor(...CARD);
  doc.roundedRect(W / 2 - 30, y, 60, 30, 4, 4, "F");

  // Score number
  const scoreColor = data.score >= 70
    ? [239, 68, 68]
    : data.score >= 50
    ? [245, 158, 11]
    : data.score >= 30
    ? [59, 130, 246]
    : [16, 185, 129];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(String(data.score), W / 2, y + 16, { align: "center" });

  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`/100 \u2022 ${data.category}`, W / 2, y + 24, {
    align: "center",
  });
  y += 36;

  // ── Profile info ──
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.text(
    `Sector: ${data.sectorName}  |  Region: ${data.regionName}  |  Status: ${data.status}`,
    W / 2,
    y,
    { align: "center" }
  );
  y += 8;

  // ── Breakdown table ──
  doc.setFillColor(...CYAN);
  doc.roundedRect(12, y, W - 24, 9, 2, 2, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Factor", 16, y + 6);
  doc.text("Weight", 120, y + 6);
  doc.text("Points", 170, y + 6, { align: "right" });
  y += 9;

  doc.setFont("helvetica", "normal");
  data.breakdown.forEach((row, i) => {
    const bg: [number, number, number] = i % 2 === 0 ? [...CARD] : [...DARK];
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(12, y, W - 24, 8, "F");

    doc.setTextColor(...GRAY);
    doc.setFontSize(7.5);
    doc.text(row.label, 16, y + 5.5);
    doc.text(row.weight, 120, y + 5.5);

    const valColor =
      row.value > 0 ? [239, 68, 68] : row.value < 0 ? [16, 185, 129] : GRAY;
    doc.setTextColor(valColor[0], valColor[1], valColor[2]);
    doc.text(
      `${row.value > 0 ? "+" : ""}${row.value}`,
      170,
      y + 5.5,
      { align: "right" }
    );
    y += 8;
  });

  // Total row
  doc.setFillColor(30, 40, 60);
  doc.rect(12, y, W - 24, 9, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Score", 16, y + 6);
  doc.text(String(data.score), 170, y + 6, { align: "right" });
  y += 14;

  // ── Key Findings ──
  if (data.findings.length > 0) {
    doc.setFillColor(...CARD);
    const findingsH = 10 + data.findings.length * 10;
    doc.roundedRect(12, y, W - 24, Math.min(findingsH, 60), 3, 3, "F");

    doc.setTextColor(...CYAN);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Key Findings", 18, y + 7);

    doc.setTextColor(200, 200, 210);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    let fY = y + 14;
    data.findings.forEach((f) => {
      const lines = doc.splitTextToSize(f, W - 44);
      doc.text(`\u2022 ${lines[0]}`, 18, fY);
      if (lines.length > 1) {
        doc.text(lines.slice(1), 22, fY + 3.5);
        fY += lines.length * 3.5 + 2;
      } else {
        fY += 5;
      }
    });
    y += Math.min(findingsH, 60) + 4;
  }

  // ── HRDF Programs ──
  if (data.hrdfPrograms.length > 0 && y < 240) {
    doc.setFillColor(...CARD);
    const progH = 10 + data.hrdfPrograms.length * 8;
    doc.roundedRect(12, y, W - 24, Math.min(progH, 50), 3, 3, "F");

    doc.setTextColor(...CYAN);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Recommended HRDF Programs", 18, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    let pY = y + 14;
    data.hrdfPrograms.forEach((prog, i) => {
      if (pY > 270) return;
      doc.setTextColor(...WHITE);
      doc.text(`${i + 1}. ${prog.name}`, 18, pY);
      doc.setTextColor(...GRAY);
      doc.text(`${prog.type} \u2022 ${prog.relevance}`, 22, pY + 3.5);
      pY += 8;
    });
  }

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
