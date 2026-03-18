import { NextRequest, NextResponse } from "next/server";
import data from "@/data/master.json";
import type { Occupation } from "@/lib/data-types";

const allOccupations: Occupation[] = [
  ...(data.occupations.high_risk as Occupation[]),
  ...(data.occupations.low_risk as Occupation[]),
].sort((a, b) => b.composite - a.composite);

const highRiskNames = new Set(
  (data.occupations.high_risk as Occupation[]).map((o) => o.name_en)
);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=3600",
};

const meta = {
  version: "1.0",
  source: "SHIFT Observatory",
  url: "https://www.ksashiftobservatory.online",
  updated: "2026-03-18",
  license: "CC BY-SA 4.0",
  methodology:
    "Composite score = Automation Probability (40%) + Salary Impact (20%) + Regulatory Pressure (20%) + Demand Signal (20%)",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const risk = searchParams.get("risk");
  const q = searchParams.get("q");

  let filtered = allOccupations;

  if (risk === "high") {
    filtered = filtered.filter((o) => highRiskNames.has(o.name_en));
  } else if (risk === "low") {
    filtered = filtered.filter((o) => !highRiskNames.has(o.name_en));
  }

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.name_en.toLowerCase().includes(query) ||
        o.name_ar.includes(q)
    );
  }

  return NextResponse.json(
    {
      description:
        "AI automation risk scores for 146 occupations in Saudi Arabia. Source: SHIFT Observatory (ksashiftobservatory.online). Data: GOSI Q4-2024, WEF 2025, HRSD Nitaqat. License: CC BY-SA 4.0.",
      count: filtered.length,
      data: filtered,
      meta,
    },
    { headers }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}
