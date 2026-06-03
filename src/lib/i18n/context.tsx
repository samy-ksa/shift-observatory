"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { en } from "./en";
import { ar } from "./ar";
import { fr } from "./fr";
import type { Dictionary } from "./types";

export type Lang = "en" | "fr" | "ar";

const DICTIONARIES: Record<Lang, Dictionary> = { en, fr, ar };

const LangContext = createContext<{
  lang: Lang;
  t: Dictionary;
  setLang: (l: Lang) => void;
  dir: "ltr" | "rtl";
}>({
  lang: "en",
  t: en,
  setLang: () => {},
  dir: "ltr",
});

/**
 * LangProvider — URL-driven after Phase 4 i18n migration.
 *
 * `initialLang` is REQUIRED and comes from the [lang] URL segment via
 * src/app/[lang]/layout.tsx. The URL is the source of truth; this provider
 * just exposes it to client components via the useLang() hook.
 *
 * setLang() is a no-op fallback for legacy callers — language changes happen
 * through navigation (LangToggle pushes to /<newLang>/<path>), not state.
 */
export function LangProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  initialLang: Lang;
}) {
  // State exists to satisfy the existing useLang() contract, but it's locked
  // to the URL-provided value. Navigations remount the provider with a new
  // initialLang, which re-initializes state.
  const [lang] = useState<Lang>(initialLang);

  const setLang = () => {
    // Legacy no-op. Real lang switching is done by LangToggle via router.push.
  };

  const t = DICTIONARIES[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LangContext.Provider value={{ lang, t, setLang, dir }}>
      <div dir={dir} className={lang === "ar" ? "font-arabic" : ""}>
        {children}
      </div>
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

export function formatNumber(n: number, lang: string): string {
  return n.toLocaleString(lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : "en-US");
}
