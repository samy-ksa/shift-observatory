/**
 * Localized URL builder for the [lang] router migration.
 *
 * Usage in Server Components:
 *   localizedHref("ar", "/job/data-scientist") // → "/ar/job/data-scientist"
 *
 * For Client Components, prefer the useLocalizedHref() hook (this file's sibling),
 * which closes over the current lang from context.
 *
 * Convention: "/" → "/{lang}" (no trailing slash), everything else → "/{lang}{path}".
 * Always pass an absolute path starting with "/".
 */

import type { Lang } from "./context";

export function localizedHref(lang: Lang, path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`localizedHref: path must start with "/", got: ${path}`);
  }
  return `/${lang}${path === "/" ? "" : path}`;
}

/** Strip the lang prefix from a pathname. Returns "/" if path is just "/{lang}". */
export function stripLangPrefix(pathname: string): string {
  const m = pathname.match(/^\/(en|fr|ar)(\/.*)?$/);
  if (!m) return pathname;
  return m[2] ?? "/";
}

/** Replace the lang prefix in a pathname. Useful for the LangToggle component. */
export function switchLang(pathname: string, newLang: Lang): string {
  const stripped = stripLangPrefix(pathname);
  return localizedHref(newLang, stripped);
}
