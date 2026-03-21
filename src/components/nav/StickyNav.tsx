"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n/context";

export default function StickyNav() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState("");

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
            <div className="px-4 flex items-center h-8 md:h-10 gap-0.5 overflow-x-auto mobile-scroll">
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
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
