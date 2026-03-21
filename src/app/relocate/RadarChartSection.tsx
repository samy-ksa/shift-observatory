"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";

export interface RadarDataPoint {
  axis: string;
  origin: number;
  saudi: number;
  originSar: number;
  saudiSar: number;
}

export interface RadarBullet {
  label: string;
  diffPct: number;
  cheaper: boolean;
}

interface RadarChartSectionProps {
  radarData: RadarDataPoint[];
  radarBullets: RadarBullet[];
  originName: string;
  saudiName: string;
  originRate: number;
  currencySymbol: string;
  fmtLocal: (amount: number, symbol: string) => string;
  fmtSar: (amount: number) => string;
  r: {
    radarTitle: string;
    perMonth: string;
    radarSummary: string;
    radarCheaperBy: string;
    radarPricierBy: string;
  };
}

export default function RadarChartSection({
  radarData,
  radarBullets,
  originName,
  saudiName,
  originRate,
  currencySymbol,
  fmtLocal,
  fmtSar,
  r,
}: RadarChartSectionProps) {
  if (radarData.length === 0) return null;

  return (
    <div className="bg-bg-card/60 border border-white/10 rounded-xl p-5 md:p-6">
      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">
        {r.radarTitle}
      </h3>
      <div className="w-full h-[250px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "#9CA3AF", fontSize: 8 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#6B7280", fontSize: 7 }}
              axisLine={false}
            />
            <Radar
              name={originName}
              dataKey="origin"
              stroke="#D4A853"
              fill="#D4A853"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name={saudiName}
              dataKey="saudi"
              stroke="#22D3EE"
              fill="#22D3EE"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <RTooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: 12,
              }}
              labelStyle={{ color: "#9CA3AF" }}
              /* eslint-disable @typescript-eslint/no-explicit-any */
              formatter={((value: any, name: any) => [`${value ?? 0}/100`, name]) as any}
              /* eslint-enable @typescript-eslint/no-explicit-any */
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend with actual costs */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400 justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4A853]" />
          {originName}:{" "}
          {fmtLocal(
            radarData.reduce((s, d) => s + d.originSar, 0) / originRate,
            currencySymbol,
          )}
          {r.perMonth}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          {saudiName}:{" "}
          {fmtSar(radarData.reduce((s, d) => s + d.saudiSar, 0))}
          {r.perMonth}
        </span>
      </div>

      {/* Radar summary bullets */}
      {radarBullets.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            {r.radarSummary}
          </p>
          <ul className="space-y-1">
            {radarBullets.map((b) => (
              <li key={b.label} className="text-xs flex items-center gap-2">
                <span
                  className={`font-mono font-bold ${b.cheaper ? "text-green-400" : "text-red-400"}`}
                >
                  {b.diffPct > 0 ? "+" : ""}
                  {b.diffPct}%
                </span>
                <span className="text-text-secondary">
                  {b.label}:{" "}
                  {b.cheaper
                    ? r.radarCheaperBy
                        .replace("{city}", saudiName)
                        .replace("{pct}", String(Math.abs(b.diffPct)))
                    : r.radarPricierBy
                        .replace("{city}", saudiName)
                        .replace("{pct}", String(b.diffPct))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
