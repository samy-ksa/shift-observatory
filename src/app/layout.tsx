import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n/context";

const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SHIFT Observatory — Saudi Jobs Exposed to AI",
  description:
    "Interactive dashboard tracking AI automation risk for 12.4M workers across 20 sectors and 13 regions in Saudi Arabia. Built with GASTAT, WEF, and McKinsey data.",
  keywords: [
    "Saudi Arabia AI jobs",
    "AI automation risk",
    "Vision 2030 jobs",
    "GOSI workforce",
    "Saudi employment AI",
    "SHIFT Observatory",
    "KSA labor market",
  ],
  authors: [{ name: "SHIFT Observatory" }],
  creator: "SHIFT Observatory",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SA",
    url: "https://shift-observatory.vercel.app",
    siteName: "SHIFT Observatory",
    title: "Saudi Jobs Exposed to AI — SHIFT Observatory",
    description:
      "4.45M jobs at risk. Interactive map, sector analysis, and occupation risk tool for Saudi Arabia's AI transformation.",
    images: [
      {
        url: "https://shift-observatory.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "SHIFT Observatory — Saudi Jobs Exposed to AI",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saudi Jobs Exposed to AI — SHIFT Observatory",
    description:
      "4.45M jobs at risk. Interactive dashboard tracking AI automation across 20 sectors in KSA.",
    images: ["https://shift-observatory.vercel.app/og-image.png"],
    creator: "@saudi_builder",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetBrainsMono.variable} scroll-smooth`}>
      <body className="antialiased bg-bg-primary text-text-primary min-h-screen">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
