"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n/context";

interface ShareBarProps {
  url: string;
  text: string;
  title?: string;
}

const PLATFORMS = [
  { name: "LinkedIn", icon: "\uD83D\uDD17", getUrl: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`, color: "hover:bg-blue-600/20 text-blue-400" },
  { name: "X", icon: "\uD835\uDD4F", getUrl: (u: string, t: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`, color: "hover:bg-gray-600/20 text-gray-300" },
  { name: "WhatsApp", icon: "\uD83D\uDCAC", getUrl: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(t + " " + u)}`, color: "hover:bg-green-600/20 text-green-400" },
  { name: "Facebook", icon: "\uD83D\uDCD8", getUrl: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`, color: "hover:bg-blue-700/20 text-blue-500" },
  { name: "Telegram", icon: "\u2708\uFE0F", getUrl: (u: string, t: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`, color: "hover:bg-cyan-600/20 text-cyan-300" },
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
          {"\uD83D\uDCE4"} {lang === "fr" ? "Partager" : lang === "ar" ? "\u0645\u0634\u0627\u0631\u0643\u0629" : "Share"}
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
            className={`flex flex-col items-center justify-center gap-1 border border-gray-800 rounded-md p-3 md:px-4 md:py-2 md:flex-row text-xs ${p.color} transition-colors`}
          >
            <span className="text-lg md:text-sm">{p.icon}</span>
            <span className="text-[10px] md:text-xs">{p.name}</span>
          </a>
        ))}
        <button
          onClick={handleCopy}
          className="flex flex-col items-center justify-center gap-1 border border-gray-800 rounded-md p-3 md:px-4 md:py-2 md:flex-row text-xs hover:bg-gray-600/20 text-gray-400 transition-colors"
        >
          <span className="text-lg md:text-sm">{"\uD83D\uDCCB"}</span>
          <span className="text-[10px] md:text-xs">{copied ? "\u2713" : (lang === "fr" ? "Copier" : lang === "ar" ? "\u0646\u0633\u062E" : "Copy")}</span>
        </button>
      </div>
    </div>
  );
}
