"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n/context";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function EmailCapture() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "quarterly_report" }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{t.email.title}</h2>
        <p className="text-gray-400 mb-6">{t.email.subtitle}</p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium py-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {t.email.success}
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder={t.email.placeholder}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
              >
                {status === "loading" ? (
                  <>
                    <Spinner />
                    <span className="sr-only">Loading</span>
                  </>
                ) : (
                  t.email.button
                )}
              </button>
            </div>
            {status === "error" && (
              <p className="text-red-400 text-sm mt-2">{t.email.error}</p>
            )}
          </>
        )}

        <p className="text-gray-600 text-xs mt-3">{t.email.privacy}</p>
      </div>
    </section>
  );
}
