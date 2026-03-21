"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n/context";
import type { Lang } from "@/lib/i18n/context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import JobsDropdown from "@/components/nav/JobsDropdown";
import MobileJobSearch from "@/components/nav/MobileJobSearch";

const LANG_OPTIONS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
];

export default function LangToggle() {
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const pages = [
    {
      href: "/",
      label: lang === "ar" ? "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" : lang === "fr" ? "Tableau de bord" : "Dashboard",
    },
    {
      href: "/career",
      label: t.career.navLabel,
    },
    {
      href: "/profile",
      label: t.profile.navLabel,
    },
    {
      href: "/relocate",
      label: t.relocate.navLabel,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  /* Language selector — 3 small buttons: EN | FR | AR */
  const LangSelector = ({ size = "sm" }: { size?: "sm" | "xs" }) => (
    <div className="flex items-center gap-0.5 font-mono">
      {LANG_OPTIONS.map((opt, i) => (
        <span key={opt.code} className="flex items-center">
          {i > 0 && <span className="text-gray-600 mx-1">|</span>}
          <button
            onClick={() => setLang(opt.code)}
            className={`${size === "xs" ? "text-xs" : "text-xs"} font-mono transition-colors ${
              lang === opt.code
                ? "text-white font-bold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {opt.label}
          </button>
        </span>
      ))}
    </div>
  );

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
            <JobsDropdown />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <LangSelector size="sm" />
          </div>
        </div>
      </nav>

      {/* Mobile: sticky top bar (simplified) */}
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
            onClick={() => setMenuOpen(true)}
            className="min-h-12 min-w-12 flex items-center justify-center text-text-muted"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <LangSelector size="xs" />
          </div>
        </div>
      </nav>

      {/* Mobile: full-screen overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] bg-bg-primary/98 backdrop-blur-md flex flex-col md:hidden">
          {/* Top row */}
          <div className="flex items-center justify-between px-4 min-h-12 border-b border-white/5">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
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
              onClick={() => setMenuOpen(false)}
              className="min-h-12 min-w-12 flex items-center justify-center text-text-muted"
              aria-label="Close menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Menu items */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setMenuOpen(false)}
                className={`min-h-12 px-6 text-base font-medium border-b border-white/5 flex items-center ${
                  isActive(page.href)
                    ? "text-accent-primary"
                    : "text-text-muted"
                }`}
              >
                {page.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/career");
                // Allow MobileJobSearch to open after navigation
                setTimeout(() => {
                  const searchInput = document.querySelector<HTMLInputElement>("[data-mobile-search]");
                  if (searchInput) searchInput.focus();
                }, 300);
              }}
              className="min-h-12 px-6 text-base font-medium border-b border-white/5 flex items-center text-text-muted text-left w-full"
            >
              {lang === "ar" ? "\u0628\u062D\u062B \u0639\u0646 \u0648\u0638\u0627\u0626\u0641" : lang === "fr" ? "Rechercher des emplois" : "Search Jobs"}
            </button>
          </div>

          {/* Language toggle at bottom */}
          <div className="px-6 py-4 border-t border-white/5">
            <div className="flex gap-2">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLang(opt.code);
                    setMenuOpen(false);
                  }}
                  className={`flex-1 min-h-11 rounded-lg text-sm font-medium transition-colors ${
                    lang === opt.code
                      ? "bg-accent-primary text-white"
                      : "bg-white/5 text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile: sticky search bar below nav */}
      <MobileJobSearch />

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
