import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Try Vercel KV first (only available in production with KV linked)
    if (
      process.env.KV_REST_API_URL &&
      process.env.KV_REST_API_TOKEN
    ) {
      const { kv } = await import("@vercel/kv");
      const latestRaw = await kv.get<string>("shift:pulse:latest");
      const historyRaw = await kv.get<string>("shift:pulse:history");

      if (latestRaw) {
        const latest =
          typeof latestRaw === "string" ? JSON.parse(latestRaw) : latestRaw;
        const history = historyRaw
          ? typeof historyRaw === "string"
            ? JSON.parse(historyRaw)
            : historyRaw
          : [];

        return NextResponse.json(
          { latest, history },
          {
            headers: { "Cache-Control": "public, max-age=3600" },
          }
        );
      }
    }
  } catch {
    // KV not available (local dev) — fall through to seed data
  }

  // Fallback: serve seed data
  const seed = await import("@/data/pulse-seed.json");
  return NextResponse.json(
    { latest: seed.default, history: [] },
    {
      headers: { "Cache-Control": "public, max-age=3600" },
    }
  );
}
