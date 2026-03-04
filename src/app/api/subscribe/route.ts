import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // ----- Vercel-compatible: Google Sheets webhook -----
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
      // Don't fail the request — still return ok so the UX isn't broken
    }
    return NextResponse.json({ ok: true });
  }

  // ----- Local dev fallback: write to filesystem -----
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
      // File doesn't exist yet, start fresh
    }

    if (!subscribers.includes(email)) {
      subscribers.push(email);
      const dir = path.dirname(SUBSCRIBERS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
    }
  } catch (err) {
    console.error("File storage fallback failed:", err);
    // On Vercel without SHEETS_WEBHOOK_URL, this will fail silently
    // Set the env var for production use
  }

  return NextResponse.json({ ok: true });
}
