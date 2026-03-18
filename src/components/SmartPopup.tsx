"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLang } from "@/lib/i18n/context";

const STORAGE_KEY_SUBSCRIBED = "shift_subscribed";
const SESSION_KEY_DISMISSED = "shift_popup_dismissed";
const TRIGGER_DELAY_MS = 45_000; // 45 seconds
const SCROLL_THRESHOLD = 0.5; // 50% of page

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function SmartPopup() {
  const { t, dir } = useLang();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const shownRef = useRef(false);
  const timerStartedRef = useRef(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(SESSION_KEY_DISMISSED, "true");
    } catch {}
  }, []);

  // Check if popup should ever show
  const shouldSuppress = useCallback(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY_SUBSCRIBED) === "true") return true;
      if (sessionStorage.getItem(SESSION_KEY_DISMISSED) === "true") return true;
    } catch {}
    return false;
  }, []);

  // Trigger logic: 45s + 50% scroll
  useEffect(() => {
    if (shouldSuppress()) return;
    if (timerStartedRef.current) return;
    timerStartedRef.current = true;

    let timeElapsed = false;
    let scrollPassed = false;

    const maybeShow = () => {
      if (shownRef.current) return;
      if (timeElapsed && scrollPassed) {
        shownRef.current = true;
        setVisible(true);
      }
    };

    const timer = setTimeout(() => {
      timeElapsed = true;
      maybeShow();
    }, TRIGGER_DELAY_MS);

    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollY / docHeight >= SCROLL_THRESHOLD) {
        scrollPassed = true;
        maybeShow();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [shouldSuppress]);

  // ESC key
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismiss]);

  // No auto-close — user needs time to click download

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "popup" }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        try {
          localStorage.setItem(STORAGE_KEY_SUBSCRIBED, "true");
        } catch {}
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
      dir={dir}
    >
      {/* Modal */}
      <div
        className="relative bg-[#0A0E17] border border-gray-800 rounded-lg p-8 max-w-md w-full mx-4 animate-popup-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 end-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <span className="text-green-400 text-sm">{"\u2713"} {t.popup.success}</span>
            <a
              href="/reports/SHIFT-Q1-2026-AI-Risk-Report.pdf"
              download
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium text-sm px-4 py-2 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.popup.downloadBtn}
            </a>
          </div>
        ) : (
          <>
            {/* Title */}
            <h3 className="text-white font-bold text-lg mb-3 pe-6">
              {t.popup.title}
            </h3>

            {/* Body */}
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {t.popup.body}
            </p>

            {/* Form */}
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder={t.email.placeholder}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[130px] justify-center text-sm whitespace-nowrap"
              >
                {status === "loading" ? <Spinner /> : t.popup.button}
              </button>
            </div>

            {/* Error */}
            {status === "error" && (
              <p className="text-red-400 text-xs mt-2">{t.email.error}</p>
            )}

            {/* Footer */}
            <p className="text-gray-600 text-xs mt-4">{t.popup.footer}</p>
          </>
        )}
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes popup-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-popup-in {
          animation: popup-in 200ms ease-out;
        }
      `}</style>
    </div>
  );
}
