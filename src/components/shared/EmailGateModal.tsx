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
    title: "YOUR PERSONALIZED RELOCATION REPORT",
    subtitle: "Get your complete 8-page analysis: income comparison, cost breakdown, negotiation checklist, AI risk assessment, and salary targets — all customized for your situation.",
    placeholder: "your@email.com",
    button: "Download my free report →",
    privacy: "Your data is private. We never share your email.",
  },
  fr: {
    title: "VOTRE RAPPORT D'EXPATRIATION PERSONNALISÉ",
    subtitle: "Recevez votre analyse complète de 8 pages : comparaison de revenus, détail des coûts, checklist de négociation, évaluation du risque IA, et objectifs salariaux — le tout personnalisé pour votre situation.",
    placeholder: "votre@email.com",
    button: "Télécharger mon rapport gratuit →",
    privacy: "Vos données sont privées. Nous ne partageons jamais votre email.",
  },
  ar: {
    title: "تقريرك الشخصي للانتقال",
    subtitle: "احصل على تحليلك الكامل من 8 صفحات: مقارنة الدخل، تفصيل التكاليف، قائمة التفاوض، تقييم مخاطر الذكاء الاصطناعي، وأهداف الراتب — كل ذلك مخصص لحالتك.",
    placeholder: "your@email.com",
    button: "تحميل تقريري المجاني ←",
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
        className="relative w-full max-w-sm bg-[#0A0E17] border border-cyan-500/20 rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-lg leading-none" aria-label="Close">
          ✕
        </button>

        {/* Title */}
        <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wide mb-1">{c.title}</h3>
        <p className="text-sm text-text-muted mb-5 leading-relaxed">{c.subtitle}</p>

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
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg text-base transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>{c.button}</>
            )}
          </button>
        </form>

        {/* Privacy */}
        <p className="text-[10px] text-gray-600 mt-3 text-center">{c.privacy}</p>
      </div>
    </div>
  );
}
