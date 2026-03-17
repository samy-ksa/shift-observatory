import { NextResponse } from "next/server";

const AIRTABLE_BASE = "appyqLmjVv9KLEnIR";
const AIRTABLE_TABLE = "tbldfRgbdmkxLoisU";
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`;

function airtableHeaders() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
    "Content-Type": "application/json",
  };
}

/** Search for an existing record by email */
async function findByEmail(email: string): Promise<string | null> {
  const formula = encodeURIComponent(`{Email}="${email}"`);
  const res = await fetch(
    `${AIRTABLE_URL}?filterByFormula=${formula}&maxRecords=1`,
    { headers: airtableHeaders() }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.records?.[0]?.id ?? null;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, occupation, status, region, sector, score, source } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Build Airtable fields payload
  const fields: Record<string, string | number> = {
    Email: email,
    Occupation: occupation || "",
    Status: status === "saudi" ? "Saudi" : status === "expat" ? "Expat" : (status || ""),
    Region: region || "",
    Sector: sector || "",
    Score: score ? Number(score) : 0,
    Source: source || "homepage",
    Date: new Date().toISOString(),
  };

  const pat = process.env.AIRTABLE_PAT;

  // ── Airtable path ──
  if (pat) {
    try {
      // Check for duplicate email → update instead of create
      const existingId = await findByEmail(email);

      if (existingId) {
        // UPDATE existing record
        const res = await fetch(AIRTABLE_URL, {
          method: "PATCH",
          headers: airtableHeaders(),
          body: JSON.stringify({
            records: [{ id: existingId, fields }],
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          console.error("Airtable update error:", err);
          return NextResponse.json(
            { error: "Failed to update subscriber" },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true, action: "updated" });
      }

      // CREATE new record
      const res = await fetch(AIRTABLE_URL, {
        method: "POST",
        headers: airtableHeaders(),
        body: JSON.stringify({
          records: [{ fields }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Airtable create error:", err);
        return NextResponse.json(
          { error: "Failed to subscribe" },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, action: "created" });
    } catch (err) {
      console.error("Airtable request failed:", err);
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: 500 }
      );
    }
  }

  // ── Fallback: Google Sheets webhook ──
  const SHEETS_WEBHOOK = process.env.SHEETS_WEBHOOK_URL;
  if (SHEETS_WEBHOOK) {
    try {
      await fetch(SHEETS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, date: new Date().toISOString() }),
      });
    } catch (err) {
      console.error("Sheets webhook failed:", err);
    }
    return NextResponse.json({ ok: true });
  }

  // ── Local dev fallback: filesystem ──
  try {
    const fs = await import("fs");
    const path = await import("path");
    const SUBSCRIBERS_FILE = path.join(
      process.cwd(),
      "data",
      "subscribers.json"
    );

    let subscribers: string[] = [];
    try {
      const raw = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
      subscribers = JSON.parse(raw);
    } catch {
      // File doesn't exist yet
    }

    if (!subscribers.includes(email)) {
      subscribers.push(email);
      const dir = path.dirname(SUBSCRIBERS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        SUBSCRIBERS_FILE,
        JSON.stringify(subscribers, null, 2)
      );
    }
  } catch (err) {
    console.error("File storage fallback failed:", err);
  }

  return NextResponse.json({ ok: true });
}
