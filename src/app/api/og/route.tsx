import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { fontsForLang, type Lang } from "@/lib/og-fonts";

export const runtime = "edge";

function parseLang(req: NextRequest): Lang {
  const l = req.nextUrl.searchParams.get("lang");
  return l === "fr" || l === "ar" ? l : "en";
}

const TITLE: Record<Lang, string> = {
  en: "Saudi Jobs Exposed to AI",
  fr: "Emplois saoudiens exposés à l'IA",
  ar: "الوظائف السعودية المعرضة للذكاء الاصطناعي",
};

const STAT_LABELS: Record<Lang, { workers: string; atRisk: string; sectors: string; regions: string }> = {
  en: { workers: "Workers", atRisk: "At Risk", sectors: "Sectors", regions: "Regions" },
  fr: { workers: "Actifs", atRisk: "À risque", sectors: "Secteurs", regions: "Régions" },
  ar: { workers: "عاملون", atRisk: "في خطر", sectors: "قطاعات", regions: "مناطق" },
};

const FOOTER: Record<Lang, string> = {
  en: "Interactive Dashboard · GASTAT · WEF · McKinsey Data",
  fr: "Tableau de bord interactif · GASTAT · WEF · McKinsey",
  ar: "لوحة تحكم تفاعلية · GASTAT · WEF · McKinsey",
};

export async function GET(req: NextRequest) {
  const lang = parseLang(req);
  const isAr = lang === "ar";
  const labels = STAT_LABELS[lang];
  const fonts = await fontsForLang(lang);
  const arabicFamily = isAr ? "Cairo, Inter, sans-serif" : "Inter, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #0A0E17 0%, #111827 50%, #0A0E17 100%)",
          fontFamily: arabicFamily,
          padding: "60px",
          position: "relative",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, transparent, #22D3EE, transparent)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#22D3EE",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 900,
              color: "#0A0E17",
            }}
          >
            S
          </div>
          <span
            style={{
              color: "#22D3EE",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            SHIFT OBSERVATORY
          </span>
        </div>

        <div
          style={{
            color: "white",
            fontSize: isAr ? "46px" : "52px",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "1080px",
            direction: isAr ? "rtl" : "ltr",
          }}
        >
          {TITLE[lang]}
        </div>

        <div style={{ display: "flex", gap: "32px", marginTop: "44px" }}>
          {[
            { value: "12.4M", label: labels.workers },
            { value: "4.5M", label: labels.atRisk },
            { value: "20", label: labels.sectors },
            { value: "13", label: labels.regions },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(34,211,238,0.15)",
                borderRadius: "12px",
                padding: "20px 36px",
              }}
            >
              <span
                style={{
                  color: "#22D3EE",
                  fontSize: "38px",
                  fontWeight: 800,
                  fontFamily: "monospace",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "16px",
                  marginTop: "4px",
                  letterSpacing: "0.05em",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: "15px",
            marginTop: "44px",
            letterSpacing: "0.03em",
          }}
        >
          {FOOTER[lang]}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      // Image endpoint — let Google FETCH (for social previews) but never index
      // as a page. Without this, GSC reports the OG variants as "Duplicate,
      // Google chose different canonical" (image presented like a page).
      headers: { "X-Robots-Tag": "noindex" },
    }
  );
}
