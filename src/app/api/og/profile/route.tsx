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
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top accent */}
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

        {/* Brand */}
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

        {/* Icon */}
        <div
          style={{
            fontSize: "64px",
            marginBottom: "16px",
          }}
        >
          {"\uD83C\uDFAF"}
        </div>

        {/* Title */}
        <div
          style={{
            color: "white",
            fontSize: "48px",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          My AI Risk Profile
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "24px",
            marginTop: "8px",
            textAlign: "center",
          }}
        >
          {"\u0645\u0644\u0641\u064A \u0627\u0644\u0634\u062E\u0635\u064A \u0644\u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A"}
        </div>

        {/* Feature cards */}
        <div style={{ display: "flex", gap: "20px", marginTop: "40px" }}>
          {[
            { icon: "\uD83D\uDCBC", label: "Occupation Risk" },
            { icon: "\uD83C\uDFED", label: "Sector Pressure" },
            { icon: "\uD83D\uDDFA\uFE0F", label: "Region Exposure" },
            { icon: "\u26A0\uFE0F", label: "Nitaqat Impact" },
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

        {/* Footer */}
        <div
          style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: "14px",
            marginTop: "36px",
          }}
        >
          Discover your personalized AI risk score | shift-observatory.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
