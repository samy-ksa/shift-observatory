/**
 * Edge-runtime font loader for @vercel/og.
 *
 * Loads Noto Sans Arabic when the locale is AR — the default fonts in
 * @vercel/og's edge bundle don't include Arabic glyphs, so AR strings
 * fail to render with "lookupType: 5 substFormat: 3 not supported".
 */

let arFontPromise: Promise<ArrayBuffer> | null = null;

export async function loadArabicFont(): Promise<ArrayBuffer> {
  if (!arFontPromise) {
    // Cairo (Arabic) 700 — served by jsdelivr from @fontsource. Stable URL.
    const url =
      "https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.14/files/cairo-arabic-700-normal.woff";
    arFontPromise = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch Arabic font: ${res.status}`);
      return res.arrayBuffer();
    });
  }
  return arFontPromise;
}

export type Lang = "en" | "fr" | "ar";

/**
 * Returns the ImageResponse `fonts` option for a given locale.
 * For en/fr returns undefined (use default fonts). For ar returns a font
 * registered as "Noto Arabic" — reference it in your JSX via fontFamily.
 */
export async function fontsForLang(lang: Lang) {
  if (lang !== "ar") return undefined;
  const data = await loadArabicFont();
  return [
    {
      name: "Cairo",
      data,
      style: "normal" as const,
      weight: 700 as const,
    },
  ];
}
