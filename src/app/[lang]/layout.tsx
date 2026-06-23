import "../globals.css";

import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

import type { Lang } from "@/lib/i18n/context";
import { LangProvider } from "@/lib/i18n/context";
import CookieConsent from "@/components/legal/CookieConsent";
import BackToTop from "@/components/shared/BackToTop";
import { buildLanguageAlternates, SITE_URL } from "@/lib/i18n/seo";
import { OCCUPATION_COUNT } from "@/lib/occupations";

/**
 * [lang] layout — Phase 4 root-of-the-app for locale-prefixed routes.
 *
 * After Phase 4 bascule, src/app/layout.tsx is a pass-through and this is the
 * de facto root layout. It owns <html lang dir>, <body>, fonts, global providers,
 * and the localized JSON-LD / hreflang head tags.
 *
 * Middleware (src/middleware.ts) redirects any unprefixed path to /<lang>/<path>,
 * so this layout is the only one users ever hit.
 */

const SITE = SITE_URL;

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
  themeColor: "#0A0E17", // matches bg-bg-primary — colors Safari/Chrome iOS address bar
};

const TITLES: Record<Lang, string> = {
  // Rewritten for desktop CTR (audit lever #1): question/fear hook instead of a
  // cold "dashboard" title. Drops the "| SHIFT" suffix to save SERP space.
  en: "Will AI Take Your Job in Saudi Arabia? Check 237 Roles",
  fr: "L'IA va-t-elle prendre votre emploi en Arabie Saoudite ?",
  ar: "هل سيأخذ الذكاء الاصطناعي وظيفتك في السعودية؟",
};

const DESCRIPTIONS: Record<Lang, string> = {
  en: "Which Saudi jobs will AI replace? Free dashboard scoring 237 occupations. Salary data, Nitaqat status, career transitions, relocation calculator. Updated Q2 2026.",
  fr: "Quels métiers saoudiens l'IA va-t-elle remplacer ? Tableau de bord gratuit notant 237 professions. Salaires, Nitaqat, transitions, calculateur de relocation. T2 2026.",
  ar: "أي الوظائف السعودية سيستبدلها الذكاء الاصطناعي؟ لوحة تحكم مجانية تُقيّم 237 مهنة. الرواتب، نطاقات، الانتقالات، حاسبة الانتقال. T2 2026.",
};

const OG_LOCALES: Record<Lang, string> = {
  en: "en_US",
  fr: "fr_FR",
  ar: "ar_SA",
};

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }, { lang: "ar" }];
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    metadataBase: new URL(SITE),
    applicationName: "SHIFT Observatory",
    title: TITLES[lang],
    description: DESCRIPTIONS[lang],
    authors: [{ name: "Samy Aloulou" }],
    creator: "Samy Aloulou",
    alternates: buildLanguageAlternates(lang, "/"),
    openGraph: {
      type: "website",
      locale: OG_LOCALES[lang],
      alternateLocale: Object.entries(OG_LOCALES)
        .filter(([l]) => l !== lang)
        .map(([, v]) => v),
      url: `${SITE}/${lang}`,
      siteName: "SHIFT Observatory",
      title: TITLES[lang],
      description: DESCRIPTIONS[lang],
      images: [
        {
          url: `${SITE}/api/og?lang=${lang}`,
          width: 1200,
          height: 630,
          alt: "SHIFT Observatory - AI Job Risk Dashboard for Saudi Arabia",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLES[lang],
      description: DESCRIPTIONS[lang],
      images: [`${SITE}/api/og?lang=${lang}`],
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
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Localized JSON-LD
  const webAppLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SHIFT Observatory",
    url: `${SITE}/${lang}`,
    description:
      lang === "fr"
        ? `Tableau de bord du risque d'automatisation IA pour ${OCCUPATION_COUNT} professions en Arabie Saoudite`
        : lang === "ar"
          ? `لوحة تحكم مخاطر الأتمتة بالذكاء الاصطناعي لـ ${OCCUPATION_COUNT} مهنة في المملكة العربية السعودية`
          : `AI automation risk dashboard for ${OCCUPATION_COUNT} occupations in Saudi Arabia`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "SAR" },
    author: { "@type": "Person", name: "Samy Aloulou" },
    inLanguage: ["en", "fr", "ar"],
  };

  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "SHIFT Observatory - AI Automation Risk Scores for Saudi Arabia",
    description: `Composite AI automation risk scores for ${OCCUPATION_COUNT} occupations in Saudi Arabia, combining GOSI employment data, WEF projections, Nitaqat regulations, and academic research.`,
    url: `${SITE}/${lang}`,
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    creator: {
      "@type": "Person",
      name: "Samy Aloulou",
      email: "samy@monitoringforcegulf.com",
    },
    temporalCoverage: "2024/2026",
    spatialCoverage: { "@type": "Place", name: "Saudi Arabia" },
    variableMeasured: [
      { "@type": "PropertyValue", name: "AI Automation Risk Score", unitText: "score out of 100" },
      { "@type": "PropertyValue", name: "Workforce Size", unitText: "number of workers" },
      { "@type": "PropertyValue", name: "Salary Range", unitText: "SAR per month" },
    ],
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${SITE}/api/v1/occupations`,
    },
    isAccessibleForFree: true,
    keywords: ["AI automation risk", "Saudi Arabia", "labor market", "Saudization", "Nitaqat", "occupations", "workforce", "Vision 2030"],
  };

  // Organization schema — unlocks sitelinks + knowledge panel candidacy. Stays
  // lang-agnostic on purpose (the entity is the same across locales).
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SHIFT Observatory",
    alternateName: ["مرصد شيفت", "SHIFT"],
    url: SITE,
    logo: `${SITE}/apple-touch-icon.png`,
    description:
      "Independent, free AI workforce risk dashboard for Saudi Arabia — 237 occupations scored, salary benchmarks, Nitaqat status, relocation calculator.",
    founder: { "@type": "Person", name: "Samy Aloulou" },
    foundingDate: "2026-03",
    areaServed: { "@type": "Place", name: "Saudi Arabia" },
    knowsAbout: [
      "Saudi labor market",
      "AI automation risk",
      "Vision 2030 workforce transformation",
      "Nitaqat saudization",
      "Expat relocation Saudi Arabia",
    ],
    sameAs: [
      "https://twitter.com/saudi_builder",
    ],
  };

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${dmSans.variable} ${jetBrainsMono.variable} ${ibmPlexArabic.variable} scroll-smooth`}
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      </head>
      <body className="antialiased bg-bg-primary text-text-primary min-h-screen">
        <LangProvider initialLang={lang}>
          {children}
          <CookieConsent />
          <BackToTop />
        </LangProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
