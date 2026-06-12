import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { fontsForLang, type Lang } from "@/lib/og-fonts";

export const runtime = "edge";

function parseLang(req: NextRequest): Lang {
  const l = req.nextUrl.searchParams.get("lang");
  return l === "fr" || l === "ar" ? l : "en";
}

const TITLE: Record<Lang, string> = {
  en: "Career Transition Recommender",
  fr: "Recommandeur de transition de carrière",
  ar: "موجه التحول المهني",
};

const FEATURE_LABELS: Record<Lang, { risk: string; salary: string; demand: string; training: string }> = {
  en: { risk: "Risk Reduction", salary: "Salary Insights", demand: "Demand Signals", training: "Training Paths" },
  fr: { risk: "Baisse du risque", salary: "Aperçu salarial", demand: "Signaux de demande", training: "Parcours formation" },
  ar: { risk: "تقليل المخاطر", salary: "رؤى الرواتب", demand: "إشارات الطلب", training: "مسارات التدريب" },
};

const FOOTER: Record<Lang, string> = {
  en: "Find AI-safe career paths | ksashiftobservatory.online",
  fr: "Parcours de carrière protégés de l'IA | ksashiftobservatory.online",
  ar: "ابحث عن مسارات مهنية آمنة من الذكاء الاصطناعي | ksashiftobservatory.online",
};

export async function GET(req: NextRequest) {
  const lang = parseLang(req);
  const labels = FEATURE_LABELS[lang];
  const isAr = lang === "ar";
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
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#22D3EE",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 900,
              color: "#0A0E17",
            }}
          >
            S
          </div>
          <span
            style={{
              color: "#22D3EE",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            SHIFT OBSERVATORY
          </span>
        </div>

        <div style={{ fontSize: "64px", marginBottom: "16px" }}>
          {"🚀"}
        </div>

        <div
          style={{
            color: "white",
            fontSize: isAr ? "42px" : "48px",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "1080px",
            direction: isAr ? "rtl" : "ltr",
          }}
        >
          {TITLE[lang]}
        </div>

        <div style={{ display: "flex", gap: "20px", marginTop: "40px" }}>
          {[
            { icon: "⬇️", label: labels.risk },
            { icon: "💰", label: labels.salary },
            { icon: "📈", label: labels.demand },
            { icon: "🎓", label: labels.training },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(34,211,238,0.15)",
                borderRadius: "12px",
                padding: "16px 28px",
              }}
            >
              <span style={{ fontSize: "28px" }}>{item.icon}</span>
              <span
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "13px",
                  marginTop: "6px",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: "14px",
            marginTop: "36px",
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
      headers: { "X-Robots-Tag": "noindex" },
    }
  );
}
