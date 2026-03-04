export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  return n.toLocaleString("en-US");
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export type RiskCategory =
  | "very_low"
  | "low"
  | "moderate"
  | "high"
  | "very_high";

export function riskColor(category: string): string {
  const map: Record<string, string> = {
    very_low: "#10B981",
    low: "#34D399",
    moderate: "#FBBF24",
    high: "#F97316",
    very_high: "#EF4444",
  };
  return map[category] || "#9CA3AF";
}

export function riskBg(category: string): string {
  const map: Record<string, string> = {
    very_low: "bg-risk-very-low/20 text-risk-very-low",
    low: "bg-risk-low/20 text-risk-low",
    moderate: "bg-risk-moderate/20 text-risk-moderate",
    high: "bg-risk-high/20 text-risk-high",
    very_high: "bg-risk-very-high/20 text-risk-very-high",
  };
  return map[category] || "bg-gray-500/20 text-gray-400";
}

export function riskLabel(category: string): string {
  const map: Record<string, string> = {
    very_low: "Very Low",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    very_high: "Very High",
  };
  return map[category] || category;
}

export function scoreToCategory(score: number): RiskCategory {
  if (score <= 20) return "very_low";
  if (score <= 35) return "low";
  if (score <= 50) return "moderate";
  if (score <= 65) return "high";
  return "very_high";
}

/* ── Career Transition Recommender ── */

import type { Occupation } from "@/lib/data-types";
import { getTier, isTierFeasible } from "@/lib/career/tiers";
import { getFamilies } from "@/lib/career/families";

export type TransitionDifficulty = "easy" | "moderate" | "hard";

export interface TransitionRecommendation {
  occupation: Occupation;
  score: number;
  risk_reduction: number;
  salary_change_pct: number;
  skills_overlap: number;
  demand_signal: "high_demand" | "growing" | "emerging" | "stable";
  training_path: string[];
  transition_difficulty: TransitionDifficulty;
  is_emerging: boolean;
  insight: string;
  insight_ar: string;
}

/**
 * Calculate skills overlap using:
 *   1. transition_from direct match → +60
 *   2. Shared skill families: 2+ → +30, 1 → +20, 0 → +0
 * Capped at 100.
 */
function calculateSkillsOverlap(
  currentName: string,
  target: Occupation,
): number {
  let overlap = 0;

  // 1. transition_from direct match (strongest signal)
  if (target.transition_from) {
    const currentLower = currentName.toLowerCase();
    const directMatch = target.transition_from.some((from) => {
      const fromLower = from.toLowerCase();
      return (
        currentLower.includes(fromLower) ||
        fromLower.includes(currentLower) ||
        currentLower
          .split(" ")
          .some((w) => w.length > 3 && fromLower.includes(w))
      );
    });
    if (directMatch) overlap += 60;
  }

  // 2. Skill family overlap
  const currentFamilies = getFamilies(currentName);
  const targetFamilies = getFamilies(target.name_en);
  const sharedCount = currentFamilies.filter((f) =>
    targetFamilies.includes(f),
  ).length;

  if (sharedCount >= 2) overlap += 30;
  else if (sharedCount === 1) overlap += 20;

  return Math.min(100, overlap);
}

export function recommendTransitions(
  currentOcc: Occupation,
  allOccupations: Occupation[],
  isExpat: boolean,
): TransitionRecommendation[] {
  const currentTier = getTier(currentOcc.name_en);

  /* ── 1. Filter candidates ── */
  const candidates = allOccupations.filter((o) => {
    if (o.name_en === currentOcc.name_en) return false;
    if (o.composite >= currentOcc.composite) return false;
    if (isExpat && o.nitaqat_status === "reserved_saudi_only") return false;

    // HARD FILTER: tier feasibility (max +1 tier up)
    const targetTier = getTier(o.name_en);
    if (!isTierFeasible(currentTier, targetTier)) return false;

    return true;
  });

  /* ── 2. Score each candidate ── */
  const scored = candidates.map((target) => {
    const targetTier = getTier(target.name_en);
    const tierDiff = targetTier - currentTier;

    // Skills overlap calculation (new)
    const skillsOverlap = calculateSkillsOverlap(currentOcc.name_en, target);

    // Check shared families for penalty
    const currentFamilies = getFamilies(currentOcc.name_en);
    const targetFamilies = getFamilies(target.name_en);
    const sharedCount = currentFamilies.filter((f) =>
      targetFamilies.includes(f),
    ).length;

    let score = 0;

    // Skills overlap (35% weight — was 20%)
    score += skillsOverlap * 0.35;

    // Risk reduction (25% weight — was 40%)
    const riskReduction = currentOcc.composite - target.composite;
    const riskScore = Math.min(
      100,
      (riskReduction / Math.max(currentOcc.composite, 1)) * 100,
    );
    score += riskScore * 0.25;

    // Salary improvement (15% weight — was 20%)
    const currentSalary = currentOcc.salary_median_sar || 8000;
    const targetSalary = target.salary_median_sar || 8000;
    const salaryChangePct =
      ((targetSalary - currentSalary) / Math.max(currentSalary, 1)) * 100;
    const salaryScore = Math.min(100, Math.max(0, 50 + salaryChangePct));
    score += salaryScore * 0.15;

    // Demand signal (15% weight — was 20%)
    let demandScore = 50;
    let demandSignal: "high_demand" | "growing" | "emerging" | "stable" =
      "stable";
    if (target.demand_rank_2024 && target.demand_rank_2024 <= 10) {
      demandScore = 100;
      demandSignal = "high_demand";
    } else if (target.demand_rank_2024 && target.demand_rank_2024 <= 25) {
      demandScore = 80;
      demandSignal = "high_demand";
    } else if (target.demand_rank_2024) {
      demandScore = 60;
      demandSignal = "growing";
    }
    if (target.wef_trend?.includes("growth")) {
      demandScore = Math.max(demandScore, 80);
      if (demandSignal === "stable") demandSignal = "growing";
    }
    if (target.emerging) {
      demandScore = Math.max(demandScore, 85);
      demandSignal = "emerging";
    }
    score += demandScore * 0.15;

    // Feasibility — tier proximity (10% weight — new)
    let feasibilityScore = 100;
    if (tierDiff === 1) feasibilityScore = 60;
    else if (tierDiff === 0) feasibilityScore = 90;
    else if (tierDiff < 0) feasibilityScore = 100; // going down is easy
    score += feasibilityScore * 0.10;

    // 70% penalty if zero shared families AND skills_overlap < 30
    if (sharedCount === 0 && skillsOverlap < 30) {
      score *= 0.3; // 70% penalty
    }

    // Difficulty calculation (updated rules)
    let difficulty: TransitionDifficulty;
    if (skillsOverlap >= 60 && tierDiff <= 0) {
      difficulty = "easy";
    } else if (
      skillsOverlap >= 40 ||
      (skillsOverlap >= 30 && tierDiff <= 0)
    ) {
      difficulty = "moderate";
    } else {
      difficulty = "hard";
    }

    // Training path
    const trainingPath =
      target.training_path ||
      (target.hrdf_programs || []).map((p) => p.name).slice(0, 3);

    // Demand text
    const demandText = target.demand_rank_2024
      ? `ranked #${target.demand_rank_2024} in demand`
      : target.emerging
        ? "emerging role with rapid growth"
        : "stable demand";

    // Salary text
    const salaryText =
      salaryChangePct > 0
        ? `${Math.round(salaryChangePct)}% higher salary`
        : salaryChangePct < -10
          ? `${Math.round(Math.abs(salaryChangePct))}% lower salary`
          : "similar salary";

    // Difficulty text
    const diffText =
      difficulty === "easy"
        ? "Natural career progression."
        : difficulty === "moderate"
          ? "Requires some upskilling."
          : "Requires significant retraining.";

    const insight = `${riskReduction.toFixed(0)} points lower AI risk, ${salaryText}, ${demandText}. ${diffText}`;

    const diffTextAr =
      difficulty === "easy"
        ? "\u062A\u0637\u0648\u0631 \u0645\u0647\u0646\u064A \u0637\u0628\u064A\u0639\u064A."
        : difficulty === "moderate"
          ? "\u064A\u062A\u0637\u0644\u0628 \u0628\u0639\u0636 \u0627\u0644\u062A\u0637\u0648\u064A\u0631."
          : "\u064A\u062A\u0637\u0644\u0628 \u0625\u0639\u0627\u062F\u0629 \u062A\u0623\u0647\u064A\u0644 \u0643\u0628\u064A\u0631\u0629.";
    const insight_ar = `${riskReduction.toFixed(0)} \u0646\u0642\u0637\u0629 \u0623\u0642\u0644 \u0641\u064A \u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A\u060C ${salaryChangePct > 0 ? `+${Math.round(salaryChangePct)}% \u0631\u0627\u062A\u0628` : "\u0631\u0627\u062A\u0628 \u0645\u0645\u0627\u062B\u0644"}\u060C ${target.emerging ? "\u0645\u0647\u0646\u0629 \u0646\u0627\u0634\u0626\u0629" : "\u0637\u0644\u0628 \u0645\u0633\u062A\u0642\u0631"}. ${diffTextAr}`;

    return {
      occupation: target,
      score: Math.round(score),
      risk_reduction: Math.round(riskReduction * 10) / 10,
      salary_change_pct: Math.round(salaryChangePct),
      skills_overlap: skillsOverlap,
      demand_signal: demandSignal,
      training_path: trainingPath,
      transition_difficulty: difficulty,
      is_emerging: !!target.emerging,
      insight,
      insight_ar,
    };
  });

  /* ── 3. Sort by score, ensure diversity ── */
  scored.sort((a, b) => b.score - a.score);

  // Ensure at least 1 easy transition in top 8 (if available)
  const easyOnes = scored.filter((s) => s.transition_difficulty === "easy");
  // Ensure at least 2 emerging in top 8 (if available)
  const emergingOnes = scored.filter((s) => s.is_emerging);

  // Start with top scored
  const result: TransitionRecommendation[] = [];
  const used = new Set<string>();

  // Add top by score
  for (const r of scored) {
    if (result.length >= 8) break;
    if (!used.has(r.occupation.name_en)) {
      result.push(r);
      used.add(r.occupation.name_en);
    }
  }

  // Guarantee ≥1 easy (if available)
  if (
    easyOnes.length > 0 &&
    !result.some((r) => r.transition_difficulty === "easy")
  ) {
    const easy = easyOnes[0];
    if (!used.has(easy.occupation.name_en)) {
      if (result.length >= 8) result.pop();
      result.push(easy);
      used.add(easy.occupation.name_en);
    }
  }

  // Guarantee ≥2 emerging (if available)
  const emergingInResult = result.filter((r) => r.is_emerging).length;
  if (emergingInResult < 2 && emergingOnes.length >= 2) {
    for (const em of emergingOnes) {
      if (result.filter((r) => r.is_emerging).length >= 2) break;
      if (!used.has(em.occupation.name_en)) {
        if (result.length >= 8) {
          // Replace lowest-scored non-emerging
          const replaceIdx = [...result]
            .reverse()
            .findIndex((r) => !r.is_emerging);
          if (replaceIdx >= 0) {
            result.splice(result.length - 1 - replaceIdx, 1);
          } else {
            result.pop();
          }
        }
        result.push(em);
        used.add(em.occupation.name_en);
      }
    }
  }

  // Final sort by score
  result.sort((a, b) => b.score - a.score);

  return result.slice(0, 8);
}
