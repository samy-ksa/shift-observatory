import { NextResponse } from "next/server";
import data from "@/data/master.json";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=3600",
};

const meta = {
  version: "1.0",
  source: "SHIFT Observatory",
  updated: "2026-03-02",
  license: "CC BY-SA 4.0",
};

export async function GET() {
  return NextResponse.json(
    { count: data.sectors.length, data: data.sectors, meta },
    { headers }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}
