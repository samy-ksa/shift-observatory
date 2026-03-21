"use client";

import { useState, useEffect } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-20 right-4 z-50 md:hidden w-10 h-10 rounded-full bg-gray-800/90 border border-gray-700 text-cyan-400 flex items-center justify-center shadow-lg backdrop-blur-sm transition-opacity"
    >
      ↑
    </button>
  );
}
