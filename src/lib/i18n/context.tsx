"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "./en";
import { ar } from "./ar";
import { fr } from "./fr";
import type { Dictionary } from "./types";

export type Lang = "en" | "fr" | "ar";

const DICTIONARIES: Record<Lang, Dictionary> = { en, fr, ar };

const STORAGE_KEY = "shift_lang";

/** Detect preferred language from browser settings */
function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "fr" || stored === "ar") return stored;
  const nav = navigator.language || "";
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("fr")) return "fr";
  return "en";
}

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

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, l);
    }
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
