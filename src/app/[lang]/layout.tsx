import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n/context";

/**
 * [lang] layout — Phase 2 minimal scaffold.
 *
 * NOTE for Phase 2:
 * - This is a NESTED layout, not a root layout. The root <html> + <body> remain
 *   in src/app/layout.tsx for now to keep the existing routes functional.
 * - As a result, /fr/* and /ar/* pages currently render with <html lang="en">.
 *   This is intentional and gets fixed in Phase 4 when we swap <html> ownership.
 * - In Phase 4 this file will gain:
 *     - `<html lang={params.lang} dir={...}>` (becomes the root layout)
 *     - Hreflang <link> tags via buildLanguageAlternates
 *     - LangProvider with initialLang
 *     - Localized JSON-LD
 *
 * For Phase 2 the only goal is: prove that /en, /fr, /ar route resolution works,
 * params.lang is correctly drilled to child Server Components, and SSG produces
 * 3 static variants per [lang] route.
 */

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }, { lang: "ar" }];
}

export const dynamicParams = false; // only en/fr/ar — anything else 404

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: Lang }>;
}) {
  // Drill params.lang via React context in Phase 3.
  // For Phase 2 this layout is just a pass-through wrapper.
  await params; // touch params so Next.js knows we're a dynamic segment consumer
  return <>{children}</>;
}
