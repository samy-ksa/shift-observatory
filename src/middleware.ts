import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LANGS = ["en", "fr", "ar"] as const;
const DEFAULT_LANG: (typeof LANGS)[number] = "en";

function detectFromAcceptLanguage(header: string | null): (typeof LANGS)[number] {
  if (!header) return DEFAULT_LANG;
  const lower = header.toLowerCase();
  if (lower.startsWith("ar") || lower.includes(",ar")) return "ar";
  if (lower.startsWith("fr") || lower.includes(",fr")) return "fr";
  return "en";
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  // Already prefixed → pass through
  if (/^\/(en|fr|ar)(\/|$)/.test(path)) {
    return NextResponse.next();
  }

  // Detect target lang: cookie wins, else Accept-Language, else "en"
  const cookieLang = request.cookies.get("shift_lang")?.value;
  const lang =
    cookieLang && LANGS.includes(cookieLang as (typeof LANGS)[number])
      ? (cookieLang as (typeof LANGS)[number])
      : detectFromAcceptLanguage(request.headers.get("accept-language"));

  // Redirect /<path> → /<lang>/<path>. 308 = permanent redirect preserving method.
  const redirectUrl = url.clone();
  redirectUrl.pathname = `/${lang}${path === "/" ? "" : path}`;

  const response = NextResponse.redirect(redirectUrl, 308);
  if (cookieLang !== lang) {
    response.cookies.set("shift_lang", lang, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - /api/*           (no lang prefix on API routes)
     * - /_next/*         (Next.js internals)
     * - static assets    (favicon, icons, sitemap, robots, llms, reports/, .well-known)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|sitemap.xml|robots.txt|llms.txt|reports|.well-known).*)",
  ],
};
