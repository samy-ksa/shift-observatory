"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n/context";

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
        body: JSON.stringify({ email }),
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
          <div className="text-emerald-400 font-medium py-4">{t.email.success}</div>
        ) : (
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email.placeholder}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "..." : t.email.button}
            </button>
          </div>
        )}
        <p className="text-gray-600 text-xs mt-3">{t.email.privacy}</p>
      </div>
    </section>
  );
}
