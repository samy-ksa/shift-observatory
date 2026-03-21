import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const res = await fetch(
      "https://api.airtable.com/v0/appyqLmjVv9KLEnIR/tblhaF7ZG5VfzbkNZ",
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
                fldJFEO17C9zVmSUr: data.email,
                fldgUH2pSDZ7al7l7: data.originCity,
                fldVHiXJf7mr0tbBB: data.originCountry,
                flddGTd6kwOqxc9Aj: data.currentSalary,
                fldZTUxmxYtA2oc9e: data.currency,
                fld21vVBVF0FdA9cj: data.salarySAR,
                fldMbQI1PCW1Gr0Vq: data.occupation,
                fldH0AnJYN4de4wnM: data.aiRiskScore,
                fldAaVVjqI1wmyMTX: data.adults,
                fldx6n9IrFB6RN8ve: data.children,
                fldL5W2apckeFUEnk: data.singleIncome || false,
                fld2Af2TXYWWNuyOR: data.targetCity,
                fldoUf7qAtiaqxqJq: data.housing,
                fldCJphjroMVI8dKs: data.schoolTier,
                fld5seYz4oMQNjOGX: data.minSalaryKSA,
                flde5Zkm2givqV3NT: data.taxSavings,
                fldndypZcMIvPo5bo: data.language,
                fldJvGezOXEhTyp16: new Date().toISOString(),
              },
            },
          ],
          typecast: true,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Airtable error:", err);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Relocation lead error:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
