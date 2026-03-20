import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if user already has a language preference
  const langCookie = request.cookies.get("shift_lang");
  if (langCookie) return response;

  // Detect browser language from Accept-Language header
  const acceptLang = request.headers.get("accept-language") || "";
  let detectedLang = "en";
  if (
    acceptLang.startsWith("fr") ||
    acceptLang.includes("fr-FR") ||
    acceptLang.includes("fr-BE") ||
    acceptLang.includes("fr-CA")
  ) {
    detectedLang = "fr";
  } else if (acceptLang.startsWith("ar")) {
    detectedLang = "ar";
  }

  response.cookies.set("shift_lang", detectedLang, {
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|sitemap.xml|robots.txt|llms.txt|reports|.well-known).*)",
  ],
};
