import { cookies } from "next/headers";

export type ServerLang = "en" | "fr" | "ar";

/**
 * Read the server-side language preference from the cookie set by middleware.
 * Safe to call in Server Components and generateMetadata().
 * NOTE: Using this in a page makes it dynamically rendered (not statically generated).
 * For statically generated pages (job/[slug], relocate/[pair]), use URL-based detection instead.
 */
export function getServerLang(): ServerLang {
  const cookieStore = cookies();
  const lang = cookieStore.get("shift_lang")?.value;
  if (lang === "fr" || lang === "ar") return lang;
  return "en";
}
