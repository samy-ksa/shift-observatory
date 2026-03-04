"use client";

import { useLang } from "@/lib/i18n/context";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LangToggle() {
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();

  const pages = [
    {
      href: "/",
      label: lang === "ar" ? "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" : "Dashboard",
    },
    {
      href: "/career",
      label: t.career.navLabel,
    },
    {
      href: "/profile",
      label: t.profile.navLabel,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop: sticky top bar */}
      <nav className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur-md border-b border-white/5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 mr-6 flex-shrink-0"
            >
              <span className="text-accent-primary font-bold text-sm tracking-[0.15em] uppercase">
                SHIFT
              </span>
              <span className="text-text-muted text-xs tracking-[0.1em] uppercase font-medium">
                OBSERVATORY
              </span>
            </Link>
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all ${
                  isActive(page.href)
                    ? "text-accent-primary border-b-2 border-accent-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {page.label}
              </Link>
            ))}
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm hover:bg-white/10 transition-colors text-text-secondary"
          >
            {lang === "en" ? "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" : "English"}
          </button>
        </div>
      </nav>

      {/* Mobile: sticky top bar (simplified) + sticky bottom bar */}
      <nav className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur-md border-b border-white/5 md:hidden">
        <div className="flex items-center justify-between px-4 h-12">
          <Link
            href="/"
            className="flex items-center gap-1"
          >
            <span className="text-accent-primary font-bold text-xs tracking-[0.15em] uppercase">
              SHIFT
            </span>
            <span className="text-text-muted text-[10px] tracking-[0.1em] uppercase">
              OBS
            </span>
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs hover:bg-white/10 transition-colors text-text-secondary"
          >
            {lang === "en" ? "\u0639\u0631\u0628\u064A" : "EN"}
          </button>
        </div>
      </nav>

      {/* Mobile: bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-md border-t border-white/5 md:hidden safe-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 transition-all ${
                isActive(page.href)
                  ? "text-accent-primary"
                  : "text-text-muted"
              }`}
            >
              <span className="text-xs font-medium">{page.label}</span>
              {isActive(page.href) && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
