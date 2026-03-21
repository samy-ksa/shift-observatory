"use client";

import { useState, useEffect } from "react";

interface EmailGateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  loading?: boolean;
  lang: string;
}

const COPY = {
  en: {
    title: "Download your comparison",
    subtitle: "Enter your email to receive your personalized PDF report.",
    placeholder: "your@email.com",
    button: "Download PDF",
    privacy: "Your data is private. We never share your email.",
  },
  fr: {
    title: "Téléchargez votre comparaison",
    subtitle: "Entrez votre email pour recevoir votre rapport PDF personnalisé.",
    placeholder: "votre@email.com",
    button: "Télécharger le PDF",
    privacy: "Vos données sont privées. Nous ne partageons jamais votre email.",
  },
  ar: {
    title: "حمّل المقارنة",
    subtitle: "أدخل بريدك الإلكتروني للحصول على تقرير PDF مخصص.",
    placeholder: "your@email.com",
    button: "تحميل PDF",
    privacy: "بياناتك خاصة. لن نشارك بريدك الإلكتروني أبداً.",
  },
};

export default function EmailGateModal({ open, onClose, onSubmit, loading, lang }: EmailGateModalProps) {
  const [email, setEmail] = useState("");
  const c = COPY[lang as keyof typeof COPY] || COPY.en;

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid && !loading) onSubmit(email);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-[#0A0E17] border border-gray-800 rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-lg leading-none" aria-label="Close">
          ✕
        </button>

        {/* Icon */}
        <div className="text-3xl mb-3">📄</div>

        {/* Title */}
        <h3 className="text-lg font-bold text-text-primary mb-1">{c.title}</h3>
        <p className="text-sm text-text-muted mb-5">{c.subtitle}</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={c.placeholder}
            autoFocus
            className="w-full bg-bg-primary border border-white/10 rounded-lg px-4 py-3 text-text-primary text-sm focus:border-cyan-400 focus:outline-none mb-3"
          />
          <button
            type="submit"
            disabled={!valid || loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>📄 {c.button}</>
            )}
          </button>
        </form>

        {/* Privacy */}
        <p className="text-[10px] text-gray-600 mt-3 text-center">{c.privacy}</p>
      </div>
    </div>
  );
}
