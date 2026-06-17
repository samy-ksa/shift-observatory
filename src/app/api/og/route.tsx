import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { fontsForLang, type Lang } from "@/lib/og-fonts";

export const runtime = "edge";

function parseLang(req: NextRequest): Lang {
  const l = req.nextUrl.searchParams.get("lang");
  return l === "fr" || l === "ar" ? l : "en";
}

// ===========================================================================
// Localized strings
// ===========================================================================

const HOME_TITLE: Record<Lang, string> = {
  en: "Saudi Jobs Exposed to AI",
  fr: "Emplois saoudiens exposés à l'IA",
  ar: "الوظائف السعودية المعرضة للذكاء الاصطناعي",
};

const STAT_LABELS: Record<Lang, { workers: string; atRisk: string; sectors: string; regions: string }> = {
  en: { workers: "Workers", atRisk: "At Risk", sectors: "Sectors", regions: "Regions" },
  fr: { workers: "Actifs", atRisk: "À risque", sectors: "Secteurs", regions: "Régions" },
  ar: { workers: "عاملون", atRisk: "في خطر", sectors: "قطاعات", regions: "مناطق" },
};

const FOOTER_DEFAULT: Record<Lang, string> = {
  en: "Interactive Dashboard · GASTAT · WEF · McKinsey Data",
  fr: "Tableau de bord interactif · GASTAT · WEF · McKinsey",
  ar: "لوحة تحكم تفاعلية · GASTAT · WEF · McKinsey",
};

const FOOTER_JOB: Record<Lang, string> = {
  en: "ksashiftobservatory.online · 237 Saudi occupations scored · Free",
  fr: "ksashiftobservatory.online · 237 métiers saoudiens scorés · Gratuit",
  ar: "ksashiftobservatory.online · 237 مهنة سعودية مقيمة · مجاناً",
};

const AI_RISK_SCORE_LABEL: Record<Lang, string> = {
  en: "AI Risk Score",
  fr: "Score de risque IA",
  ar: "درجة المخاطر",
};

const COUNTRY_YEAR: Record<Lang, string> = {
  en: "Saudi Arabia · 2026",
  fr: "Arabie Saoudite · 2026",
  ar: "المملكة العربية السعودية · 2026",
};

function riskLabel(score: number, lang: Lang): string {
  if (score >= 70) {
    return lang === "fr" ? "RISQUE ÉLEVÉ" : lang === "ar" ? "مخاطر عالية" : "HIGH RISK";
  }
  if (score >= 45) {
    return lang === "fr" ? "RISQUE MOYEN" : lang === "ar" ? "مخاطر متوسطة" : "MEDIUM RISK";
  }
  if (score >= 25) {
    return lang === "fr" ? "RISQUE FAIBLE-MOYEN" : lang === "ar" ? "مخاطر منخفضة-متوسطة" : "MODERATE RISK";
  }
  return lang === "fr" ? "FAIBLE RISQUE" : lang === "ar" ? "مخاطر منخفضة" : "LOW RISK";
}

function riskColor(score: number) {
  if (score >= 70) return { vivid: "#EF4444", faded: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)" };
  if (score >= 45) return { vivid: "#F97316", faded: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)" };
  if (score >= 25) return { vivid: "#FBBF24", faded: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.4)" };
  return { vivid: "#10B981", faded: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.4)" };
}

// ===========================================================================
// Layout building blocks
// ===========================================================================

function BrandBar({ family }: { family: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "32px",
        fontFamily: family,
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
          fontSize: "26px",
          fontWeight: 700,
          letterSpacing: "0.1em",
        }}
      >
        SHIFT OBSERVATORY
      </span>
    </div>
  );
}

function TopAccentBar() {
  return (
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
  );
}

// ===========================================================================
// Mode renderers
// ===========================================================================

function renderJobMode(
  occupation: string,
  score: number,
  lang: Lang,
  fontFamily: string,
) {
  const isAr = lang === "ar";
  const colors = riskColor(score);
  const scoreStr = Number.isFinite(score)
    ? score % 1 === 0
      ? `${score}`
      : score.toFixed(1)
    : "—";

  return (
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
        fontFamily,
        padding: "60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TopAccentBar />
      <BrandBar family={fontFamily} />

      {/* Score badge — the visual centerpiece */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: colors.faded,
          border: `2px solid ${colors.border}`,
          borderRadius: "24px",
          padding: "24px 56px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "8px",
          }}
        >
          <span
            style={{
              color: colors.vivid,
              fontSize: "112px",
              fontWeight: 900,
              fontFamily: "monospace",
              lineHeight: 1,
            }}
          >
            {scoreStr}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "44px",
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            /100
          </span>
        </div>
        <span
          style={{
            color: colors.vivid,
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            marginTop: "6px",
          }}
        >
          {riskLabel(score, lang)}
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            marginTop: "4px",
          }}
        >
          {AI_RISK_SCORE_LABEL[lang]}
        </span>
      </div>

      {/* Occupation name */}
      <div
        style={{
          color: "white",
          fontSize: isAr ? "44px" : "48px",
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.15,
          maxWidth: "1080px",
          direction: isAr ? "rtl" : "ltr",
          marginBottom: "8px",
        }}
      >
        {occupation}
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: "22px",
          fontWeight: 500,
          letterSpacing: "0.05em",
          direction: isAr ? "rtl" : "ltr",
        }}
      >
        {COUNTRY_YEAR[lang]}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          color: "rgba(255,255,255,0.3)",
          fontSize: "15px",
          letterSpacing: "0.03em",
          direction: isAr ? "rtl" : "ltr",
        }}
      >
        {FOOTER_JOB[lang]}
      </div>
    </div>
  );
}

function renderTitleMode(
  title: string,
  subtitle: string | null,
  lang: Lang,
  fontFamily: string,
) {
  const isAr = lang === "ar";
  const titleSize = title.length > 30 ? 64 : 80;

  return (
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
        fontFamily,
        padding: "60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TopAccentBar />
      <BrandBar family={fontFamily} />

      {/* Title — the centerpiece */}
      <div
        style={{
          color: "white",
          fontSize: `${isAr ? Math.round(titleSize * 0.9) : titleSize}px`,
          fontWeight: 900,
          textAlign: "center",
          lineHeight: 1.15,
          maxWidth: "1080px",
          direction: isAr ? "rtl" : "ltr",
          padding: "0 20px",
        }}
      >
        {title}
      </div>

      {subtitle && (
        <div
          style={{
            color: "#22D3EE",
            fontSize: "28px",
            fontWeight: 600,
            textAlign: "center",
            marginTop: "20px",
            letterSpacing: "0.03em",
            direction: isAr ? "rtl" : "ltr",
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          color: "rgba(255,255,255,0.3)",
          fontSize: "15px",
          letterSpacing: "0.03em",
          direction: isAr ? "rtl" : "ltr",
        }}
      >
        {FOOTER_DEFAULT[lang]}
      </div>
    </div>
  );
}

function renderDefaultMode(lang: Lang, fontFamily: string) {
  const isAr = lang === "ar";
  const labels = STAT_LABELS[lang];

  return (
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
        fontFamily,
        padding: "60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TopAccentBar />
      <BrandBar family={fontFamily} />

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
        {HOME_TITLE[lang]}
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
        {FOOTER_DEFAULT[lang]}
      </div>
    </div>
  );
}

// ===========================================================================
// Route handler — dispatches by query params
// ===========================================================================

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const lang = parseLang(req);
  const isAr = lang === "ar";
  const fonts = await fontsForLang(lang);
  const fontFamily = isAr ? "Cairo, Inter, sans-serif" : "Inter, sans-serif";

  const occupation = params.get("occupation");
  const scoreStr = params.get("score");
  const title = params.get("title");
  const subtitle = params.get("subtitle");

  let body: React.ReactElement;

  if (occupation && scoreStr) {
    // Job mode
    const score = parseFloat(scoreStr);
    body = renderJobMode(occupation, score, lang, fontFamily);
  } else if (title) {
    // Title mode (relocate pairs, vs pages, prepare, etc.)
    body = renderTitleMode(title, subtitle, lang, fontFamily);
  } else {
    // Default mode (home, generic)
    body = renderDefaultMode(lang, fontFamily);
  }

  return new ImageResponse(body, {
    width: 1200,
    height: 630,
    fonts,
    headers: { "X-Robots-Tag": "noindex" },
  });
}
