"use client";

interface TreemapLegendProps {
  lang: string;
  lowLabel: string;
  highLabel: string;
}

export default function TreemapLegend({ lang, lowLabel, highLabel }: TreemapLegendProps) {
  return (
    <div className={`flex items-center gap-2 text-xs text-text-muted ${lang === "ar" ? "flex-row-reverse" : ""}`}>
      <span>{lowLabel}</span>
      <div
        className="h-3 flex-1 max-w-[200px] rounded-full"
        style={{
          background: "linear-gradient(to right, #10B981, #34D399, #FBBF24, #F97316, #EF4444)",
        }}
      />
      <span>{highLabel}</span>
    </div>
  );
}
