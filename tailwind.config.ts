import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0E17",
          secondary: "#111827",
          card: "#1A1F2E",
          "card-hover": "#232838",
        },
        risk: {
          "very-low": "#10B981",
          low: "#34D399",
          moderate: "#FBBF24",
          high: "#F97316",
          "very-high": "#EF4444",
        },
        accent: {
          primary: "#3B82F6",
          saudi: "#00A859",
          gold: "#D4AF37",
          neon: "#22D3EE",
        },
        text: {
          primary: "#F9FAFB",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SF Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
