import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n/context";
import CookieConsent from "@/components/legal/CookieConsent";
import HtmlLangSync from "@/components/HtmlLangSync";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getServerLang } from "@/lib/server-lang";

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

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = getServerLang();

  const titles: Record<string, string> = {
    en: "SHIFT Observatory — AI Automation Risk Dashboard for Saudi Arabia",
    fr: "SHIFT Observatory — Risque IA sur l'emploi en Arabie Saoudite",
    ar: "SHIFT Observatory — مخاطر الذكاء الاصطناعي على التوظيف في المملكة العربية السعودية",
  };

  const descriptions: Record<string, string> = {
    en: "Free dashboard mapping AI automation risk across 146 occupations in Saudi Arabia. Risk scores, salary data, Saudization analysis, relocation calculator.",
    fr: "Tableau de bord gratuit analysant le risque d'automatisation IA de 146 métiers en Arabie Saoudite. Scores de risque, salaires, Saudisation, calculateur d'expatriation.",
    ar: "لوحة معلومات مجانية تحلل مخاطر أتمتة الذكاء الاصطناعي على 146 مهنة في المملكة العربية السعودية. درجات المخاطر، بيانات الرواتب، تحليل السعودة، حاسبة الانتقال.",
  };

  return {
    metadataBase: new URL(SITE_URL),
    title: titles[lang],
    description: descriptions[lang],
    keywords: [
      // English
      "AI risk Saudi Arabia",
      "Saudization",
      "Nitaqat",
      "AI jobs KSA",
      "automation risk",
      "Saudi labor market",
      "Vision 2030 jobs",
      "AI layoffs",
      "expat jobs Saudi Arabia",
      // French
      "risque IA",
      "Arabie Saoudite",
      "marché du travail",
      "expatriation",
      "coût de la vie Riyad",
      "salaire expatrié",
      "Saudisation",
      "calculateur expatriation",
      "s'expatrier en Arabie Saoudite",
      // Arabic
      "مخاطر الذكاء الاصطناعي",
      "المملكة العربية السعودية",
    ],
    authors: [{ name: "Samy Aloulou" }],
    creator: "Samy Aloulou",
    alternates: {
      languages: {
        en: SITE_URL,
        fr: SITE_URL,
        ar: SITE_URL,
      },
    },
    openGraph: {
      type: "website",
      locale: lang === "fr" ? "fr_FR" : lang === "ar" ? "ar_SA" : "en_US",
      alternateLocale: ["ar_SA", "fr_FR", "en_US"].filter(
        (l) => l !== (lang === "fr" ? "fr_FR" : lang === "ar" ? "ar_SA" : "en_US")
      ),
      url: SITE_URL,
      siteName: "SHIFT Observatory",
      title: titles[lang],
      description: descriptions[lang],
      images: [
        {
          url: `${SITE_URL}/api/og`,
          width: 1200,
          height: 630,
          alt: titles[lang],
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[lang],
      description: descriptions[lang],
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
    verification: {
      other: {
        "msvalidate.01": ["D019A5F91131CCB7B436CFF1C9BF1A32"],
      },
    },
  };
}

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
  inLanguage: ["en", "fr", "ar"],
};

const datasetLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "SHIFT Observatory - AI Automation Risk Scores for Saudi Arabia",
  description:
    "Composite AI automation risk scores for 146 occupations in Saudi Arabia, combining GOSI employment data, WEF projections, Nitaqat regulations, and academic research.",
  url: SITE_URL,
  license: "https://creativecommons.org/licenses/by-sa/4.0/",
  creator: {
    "@type": "Person",
    name: "Samy Aloulou",
    email: "samy@monitoringforcegulf.com",
  },
  temporalCoverage: "2024/2026",
  spatialCoverage: {
    "@type": "Place",
    name: "Saudi Arabia",
  },
  variableMeasured: [
    {
      "@type": "PropertyValue",
      name: "AI Automation Risk Score",
      unitText: "score out of 100",
    },
    {
      "@type": "PropertyValue",
      name: "Workforce Size",
      unitText: "number of workers",
    },
    {
      "@type": "PropertyValue",
      name: "Salary Range",
      unitText: "SAR per month",
    },
  ],
  distribution: {
    "@type": "DataDownload",
    encodingFormat: "application/json",
    contentUrl: `${SITE_URL}/api/v1/occupations`,
  },
  isAccessibleForFree: true,
  keywords: [
    "AI automation risk",
    "Saudi Arabia",
    "labor market",
    "Saudization",
    "Nitaqat",
    "occupations",
    "workforce",
    "Vision 2030",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getServerLang();

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${dmSans.variable} ${jetBrainsMono.variable} ${ibmPlexArabic.variable} scroll-smooth`}
    >
      <head>
        {/* Preconnect to Google Fonts CDN for Arabic font subset */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link rel="alternate" hrefLang="en" href={SITE_URL} />
        <link rel="alternate" hrefLang="fr" href={SITE_URL} />
        <link rel="alternate" hrefLang="ar" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
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
