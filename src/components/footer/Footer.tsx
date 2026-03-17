"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

export default function Footer() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const legalLinks = [
    { href: "/privacy", label: isAr ? "سياسة الخصوصية" : "Privacy Policy" },
    { href: "/cookies", label: isAr ? "ملفات تعريف الارتباط" : "Cookie Policy" },
    { href: "/terms", label: isAr ? "شروط الاستخدام" : "Terms of Use" },
  ];

  return (
    <footer className="py-12 px-4 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Main tagline */}
        <p className="text-text-muted text-sm text-center">{t.footer.tagline}</p>

        {/* Version */}
        <p className="text-text-muted/50 text-xs text-center mt-2">{t.footer.version}</p>

        {/* Legal links */}
        <div
          className={`flex items-center justify-center gap-4 mt-5 flex-wrap ${isAr ? "flex-row-reverse" : ""}`}
        >
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-muted/40 text-xs hover:text-text-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-text-muted/30 text-[10px] text-center mt-4">
          {isAr
            ? "© 2026 مرصد شيفت. جميع الحقوق محفوظة. البيانات لأغراض إعلامية فقط."
            : "© 2026 SHIFT Observatory. All rights reserved. Data provided for informational purposes only."}
        </p>
      </div>
    </footer>
  );
}
