"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n/context";

interface ShareBarProps {
  url: string;
  text: string;
  title?: string;
}

const PLATFORMS = [
  { name: "LinkedIn", getUrl: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`, color: "hover:bg-blue-600/20 text-blue-400 border-blue-800" },
  { name: "X", getUrl: (u: string, t: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`, color: "hover:bg-gray-600/20 text-gray-300 border-gray-700" },
  { name: "WhatsApp", getUrl: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(t + " " + u)}`, color: "hover:bg-green-600/20 text-green-400 border-green-800" },
  { name: "Facebook", getUrl: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`, color: "hover:bg-blue-700/20 text-blue-500 border-blue-800" },
  { name: "Telegram", getUrl: (u: string, t: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`, color: "hover:bg-cyan-600/20 text-cyan-300 border-cyan-800" },
];

export default function ShareBar({ url, text, title }: ShareBarProps) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "SHIFT Observatory", text, url });
      } catch { /* user cancelled */ }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Mobile: native share button */}
      {hasNativeShare && (
        <button
          onClick={handleNativeShare}
          className="md:hidden w-full flex items-center justify-center gap-2 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-lg px-4 py-3 text-sm font-medium transition-colors mb-2"
        >
          {lang === "fr" ? "Partager" : lang === "ar" ? "\u0645\u0634\u0627\u0631\u0643\u0629" : "Share"}
        </button>
      )}

      {/* Grid of platform buttons */}
      <div className="grid grid-cols-3 md:flex md:flex-row gap-2">
        {PLATFORMS.map((p) => (
          <a
            key={p.name}
            href={p.getUrl(url, text)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1 border rounded-md p-3 md:px-4 md:py-2 text-xs font-medium ${p.color} transition-colors`}
          >
            {p.name}
          </a>
        ))}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-1 border border-gray-800 rounded-md p-3 md:px-4 md:py-2 text-xs font-medium hover:bg-gray-600/20 text-gray-400 transition-colors"
        >
          {copied ? "\u2713" : (lang === "fr" ? "Copier" : lang === "ar" ? "\u0646\u0633\u062E" : "Copy")}
        </button>
      </div>
    </div>
  );
}
