import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n/context";
import CookieConsent from "@/components/legal/CookieConsent";
import HtmlLangSync from "@/components/HtmlLangSync";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const SITE_URL = "https://www.ksashiftobservatory.online";

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
  metadataBase: new URL(SITE_URL),
  title: "SHIFT Observatory — AI Automation Risk Dashboard for Saudi Arabia",
  description:
    "Free intelligence platform mapping AI automation risk of 146 occupations in Saudi Arabia. GOSI data, Nitaqat analysis, career transitions, weekly AI layoff tracking. Bilingual AR/EN.",
  keywords: [
    "AI risk Saudi Arabia",
    "Saudization",
    "Nitaqat",
    "AI jobs KSA",
    "automation risk",
    "Saudi labor market",
    "Vision 2030 jobs",
    "AI layoffs",
    "expat jobs Saudi Arabia",
  ],
  authors: [{ name: "Samy Aloulou" }],
  creator: "Samy Aloulou",
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: SITE_URL,
      ar: SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SA",
    url: SITE_URL,
    siteName: "SHIFT Observatory",
    title: "SHIFT Observatory — AI Automation Risk Dashboard for Saudi Arabia",
    description:
      "Free intelligence platform mapping AI automation risk of 146 occupations in Saudi Arabia. GOSI data, Nitaqat analysis, career transitions, weekly AI layoff tracking.",
    images: [
      {
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "SHIFT Observatory — AI Automation Risk Dashboard for Saudi Arabia",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SHIFT Observatory — AI Automation Risk Dashboard for Saudi Arabia",
    description:
      "Free intelligence platform mapping AI automation risk of 146 occupations in Saudi Arabia. GOSI data, Nitaqat analysis, career transitions.",
    images: [`${SITE_URL}/api/og`],
    creator: "@saudi_builder",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SHIFT Observatory",
  url: SITE_URL,
  description:
    "AI automation risk dashboard for 146 occupations in Saudi Arabia",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "SAR",
  },
  author: {
    "@type": "Person",
    name: "Samy Aloulou",
  },
  inLanguage: ["en", "ar"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetBrainsMono.variable} scroll-smooth`}
    >
      <head>
        <link rel="canonical" href={SITE_URL} />
        <link rel="alternate" hrefLang="en" href={SITE_URL} />
        <link rel="alternate" hrefLang="ar" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-bg-primary text-text-primary min-h-screen">
        <LangProvider>
          <HtmlLangSync />
          {children}
          <CookieConsent />
        </LangProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
