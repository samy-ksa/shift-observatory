"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

const CONSENT_KEY = "shift-cookie-consent";

export default function CookieConsent() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only if no consent stored
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 animate-in slide-in-from-bottom duration-500"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto bg-bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Icon + text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold text-text-primary">Cookies</span>
              <h3 className="text-sm font-semibold text-text-primary">
                {isAr ? "نستخدم ملفات تعريف الارتباط" : lang === "fr" ? "Nous utilisons des cookies" : "We use cookies"}
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {isAr
                ? "نستخدم ملفات تعريف الارتباط الأساسية لتشغيل المنصة وملفات تحليلية لتحسين تجربتك. يمكنك قبول جميع ملفات تعريف الارتباط أو قبول الأساسية فقط."
                : lang === "fr"
                ? "Nous utilisons des cookies essentiels pour faire fonctionner la plateforme et des cookies analytiques pour améliorer votre expérience. Vous pouvez accepter tous les cookies ou uniquement les essentiels."
                : "We use essential cookies to run the platform and analytics cookies to improve your experience. You can accept all cookies or only the essential ones."}
              {" "}
              <Link
                href="/cookies"
                className="text-accent-primary hover:underline whitespace-nowrap"
              >
                {isAr ? "اقرأ المزيد" : lang === "fr" ? "En savoir plus" : "Learn more"}
              </Link>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={decline}
              className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text-primary border border-white/10 rounded-lg transition-colors hover:bg-white/5"
            >
              {isAr ? "الأساسية فقط" : lang === "fr" ? "Essentiels uniquement" : "Essential only"}
            </button>
            <button
              onClick={accept}
              className="px-5 py-2 text-xs font-semibold text-bg-primary bg-accent-primary rounded-lg transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent-primary/20"
            >
              {isAr ? "قبول الكل" : lang === "fr" ? "Tout accepter" : "Accept all"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
