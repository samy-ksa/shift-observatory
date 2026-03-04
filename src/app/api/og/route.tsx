import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          fontFamily: "Inter, sans-serif",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top accent line */}
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

        {/* Logo / Brand */}
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

        {/* Title */}
        <div
          style={{
            color: "white",
            fontSize: "52px",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          Saudi Jobs Exposed to AI
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "28px",
            marginTop: "8px",
            textAlign: "center",
          }}
        >
          الوظائف السعودية المعرضة للذكاء الاصطناعي
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "32px", marginTop: "44px" }}>
          {[
            { value: "12.4M", label: "Workers" },
            { value: "4.5M", label: "At Risk" },
            { value: "20", label: "Sectors" },
            { value: "13", label: "Regions" },
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

        {/* Footer */}
        <div
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: "15px",
            marginTop: "44px",
            letterSpacing: "0.03em",
          }}
        >
          Interactive Dashboard · GASTAT · WEF · McKinsey Data
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
