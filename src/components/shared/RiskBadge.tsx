"use client";

import { riskBg } from "@/lib/utils";
import { useLang } from "@/lib/i18n/context";

interface RiskBadgeProps {
  category: string;
  score?: number;
  size?: "sm" | "md" | "lg";
}

export default function RiskBadge({
  category,
  score,
  size = "md",
}: RiskBadgeProps) {
  const { t } = useLang();

  const labelMap: Record<string, string> = {
    very_low: t.common.veryLow,
    low: t.common.low,
    moderate: t.common.moderate,
    high: t.common.high,
    very_high: t.common.veryHigh,
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${riskBg(category)} ${sizeClasses[size]}`}
    >
      {labelMap[category] || category}
      {score !== undefined && (
        <span className="font-mono font-bold">{score}</span>
      )}
    </span>
  );
}
