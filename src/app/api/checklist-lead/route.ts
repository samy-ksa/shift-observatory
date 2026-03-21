import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, country, sector } = await req.json();

    const res = await fetch(
      "https://api.airtable.com/v0/appyqLmjVv9KLEnIR/tbldfRgbdmkxLoisU",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                fldNb80rk5aX2JrGC: email,
                fld4zkLYps0gqDIqN: sector,
                fldT5xjv4u54bUbio: country,
                fldIJVYJqzwrxFA6h: "checklist",
                fldQIShwIYM9qU8RG: new Date().toISOString(),
              },
            },
          ],
          typecast: true,
        }),
      },
    );

    if (!res.ok) throw new Error("Airtable error");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
