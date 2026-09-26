import { NextResponse } from "next/server";
import seedData from "@/data/pulse-seed.json";
import historyData from "@/data/pulse-history.json";

const AIRTABLE_BASE = "appyqLmjVv9KLEnIR";
const AIRTABLE_TABLE = "tbl8gxM7A3X4xhpZQ"; // Pulse Snapshots
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`;

const FIELD_DATE = "fldZacblCCB07ezNm";
const FIELD_PAYLOAD = "fldJFwxtyahUCAFo8";
const FIELD_WEEKLY_STATS = "fldD9ra9mc8iime3d";

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

async function fetchAirtablePulse(pat: string) {
  // Latest 12 records, sorted by date desc — covers "latest" + "history"
  const params = new URLSearchParams({
    maxRecords: "12",
    "sort[0][field]": FIELD_DATE,
    "sort[0][direction]": "desc",
    "returnFieldsByFieldId": "true",
  });

  const res = await fetch(`${AIRTABLE_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${pat}` },
    // Revalidate every hour
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Airtable read ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { records: AirtableRecord[] };
  return data.records;
}

function safeParse<T>(raw: unknown): T | null {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function GET() {
  const pat = process.env.AIRTABLE_PAT;
  const seed = seedData as Record<string, unknown>;
  const repoHistory = historyData as { date: string; stats: Record<string, unknown> }[];

  if (pat) {
    try {
      const records = await fetchAirtablePulse(pat);
      if (records.length > 0) {
        const [latestRec, ...rest] = records;
        const latest = safeParse<Record<string, unknown>>(
          latestRec.fields[FIELD_PAYLOAD],
        );

        // Airtable plus ancien que le Pulse du repo (généré le lundi sur le Mac) :
        // on sert le repo. Cas du 26/09 : Airtable figé (quota) → Pulse d'avril.
        const repoDate = (seed.report_date as string) ?? "";
        const airDate = (latestRec.fields[FIELD_DATE] as string) ?? "";
        if (latest && airDate >= repoDate) {
          const history = rest
            .map((r) => ({
              date: r.fields[FIELD_DATE] as string,
              stats: safeParse<Record<string, unknown>>(
                r.fields[FIELD_WEEKLY_STATS],
              ),
            }))
            .filter((h) => h.date && h.stats);

          return NextResponse.json(
            { latest, history },
            { headers: { "Cache-Control": "public, max-age=3600" } },
          );
        }
      }
    } catch (e) {
      console.error("Airtable pulse read failed, falling back to seed:", e);
    }
  }

  // Repo Pulse (src/data/pulse-seed.json, refreshed every Monday by the Mac job):
  // served when Airtable is unavailable, empty, or older.
  return NextResponse.json(
    { latest: seed, history: repoHistory },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
