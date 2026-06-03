/**
 * Root layout — minimal pass-through after Phase 4 i18n migration.
 *
 * All routing now lives under src/app/[lang]/* (en/fr/ar). Middleware
 * (src/middleware.ts) 308-redirects any unprefixed path to /<lang>/<path>,
 * so this layout is effectively never the rendering root in production —
 * src/app/[lang]/layout.tsx owns <html>, <body>, fonts, providers, and
 * localized metadata/JSON-LD.
 *
 * Next.js still requires a root layout file. This minimal version preserves
 * the convention without conflicting with the [lang] layout's <html>.
 */

import type { Metadata } from "next";
import type { ReactNode } from "react";

// metadataBase needed for OG image URL resolution even on locale-prefixed pages.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.ksashiftobservatory.online"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
