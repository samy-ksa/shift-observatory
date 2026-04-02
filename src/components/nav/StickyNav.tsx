"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n/context";

const PAGE_LINKS = [
  { label: "Career", href: "/career" },
  { label: "Relocate", href: "/relocate" },
  { label: "Checklist", href: "/prepare" },
  { label: "Jobs", href: "/job/software-developers" },
];

export default function StickyNav() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = [
    { label: t.nav.riskTool, href: "#calculator" },
    { label: t.nav.map, href: "#map" },
    { label: t.nav.sectors, href: "#sectors" },
    { label: t.nav.nitaqat, href: "#nitaqat" },
    { label: t.nav.employers, href: "#employers" },
    { label: t.nav.layoffs, href: "#layoffs" },
    { label: t.nav.pulse, href: "#pulse" },
    { label: t.nav.wef, href: "#wef" },
    { label: t.nav.v2030, href: "#v2030" },
    { label: t.nav.about, href: "#about" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive("#" + entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    const ids = navItems.map((n) => n.href.slice(1));
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-12 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-md border-b border-white/5"
        >
          <div className="relative max-w-7xl mx-auto">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-bg-primary/95 to-transparent z-10 pointer-events-none md:hidden" />
            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-bg-primary/95 to-transparent z-10 pointer-events-none md:hidden" />
            <div className="px-4 flex items-center h-8 md:h-10 gap-0.5">
              {/* Section scroll links — scrollable on mobile */}
              <div className="flex items-center gap-0.5 overflow-x-auto mobile-scroll flex-1 min-w-0">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => scrollTo(item.href)}
                    className={`px-2.5 md:px-3 py-1.5 text-[10px] md:text-[11px] font-medium uppercase tracking-wider transition-all flex-shrink-0 ${
                      active === item.href
                        ? "text-cyan-400 border-b-2 border-cyan-400"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Page links — desktop: inline pipes, mobile: ≡ dropdown */}
              <div className="flex-shrink-0 flex items-center pl-2 border-l border-white/10">
                {/* Desktop */}
                <div className="hidden md:flex items-center gap-0">
                  {PAGE_LINKS.map((link, i) => (
                    <span key={link.href} className="flex items-center">
                      {i > 0 && <span className="text-white/20 text-[10px] px-1">|</span>}
                      <Link
                        href={link.href}
                        className="text-[10px] text-gray-400 hover:text-cyan-400 transition-colors whitespace-nowrap px-1"
                      >
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </div>

                {/* Mobile: hamburger dropdown */}
                <div className="md:hidden relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="px-2 py-1 text-[11px] text-gray-400 hover:text-cyan-400 transition-colors"
                    aria-label="Pages menu"
                    aria-expanded={menuOpen}
                  >
                    ≡ Pages
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-bg-card border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-[130px]">
                      {PAGE_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
