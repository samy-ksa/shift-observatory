"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { en } from "./en";
import { ar } from "./ar";
import type { Dictionary } from "./types";

type Lang = "en" | "ar";

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
  const [lang, setLang] = useState<Lang>("en");
  const t = lang === "ar" ? ar : en;
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
  return n.toLocaleString(lang === "ar" ? "ar-SA" : "en-US");
}
