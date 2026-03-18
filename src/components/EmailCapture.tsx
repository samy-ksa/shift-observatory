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
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-green-400 text-sm">{"\u2713"} {t.email.success}</span>
            <a
              href="/reports/SHIFT-Q1-2026-AI-Risk-Report.pdf"
              download
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.email.downloadBtn}
            </a>
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
