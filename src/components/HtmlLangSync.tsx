"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/i18n/context";

/**
 * Syncs the <html> element's `lang` and `dir` attributes
 * with the current language from the i18n context.
 * Must be rendered inside LangProvider.
 */
export default function HtmlLangSync() {
  const { lang, dir } = useLang();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", dir);
  }, [lang, dir]);

  return null;
}
