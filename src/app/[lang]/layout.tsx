import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n/context";
import { LangProvider } from "@/lib/i18n/context";

/**
 * [lang] layout — nested layout for locale-prefixed routes.
 *
 * Wraps children in a LangProvider with `initialLang` locked to the URL segment.
 * This OVERRIDES the outer LangProvider (in src/app/layout.tsx) so that all
 * client components inside /[lang]/* read `lang` from the URL, not from
 * localStorage / navigator.language detection.
 *
 * NOTE for Phase 3:
 * - <html lang dir> still come from src/app/layout.tsx and stay "en"/"ltr" on
 *   the wire. The actual rendered content WILL be in the correct language
 *   because useLang() returns the URL-driven lang. Fixed in Phase 4.
 * - The outer LangProvider already wraps children in <div dir={dir}>, so /ar/*
 *   routes will get a double-wrapped div (outer "ltr" / inner "rtl"). Inner wins
 *   for visual CSS but the duplication will be cleaned in Phase 4.
 */

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }, { lang: "ar" }];
}

export const dynamicParams = false;

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  return <LangProvider initialLang={lang}>{children}</LangProvider>;
}
