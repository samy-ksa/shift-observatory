"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (show && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + window.scrollY - 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [show]);

  const tooltip =
    show && mounted
      ? createPortal(
          <div
            className="absolute z-[99999] pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div
              className="bg-[#0F172A] border border-white/20 rounded-lg shadow-2xl px-4 py-3 text-xs text-gray-300 leading-relaxed"
              style={{ width: "280px" }}
            >
              {text}
            </div>
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-[#0F172A] border-r border-b border-white/20 rotate-45 -mt-1" />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <span
        ref={iconRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex items-center justify-center w-4 h-4 text-[10px] text-gray-500 hover:text-gray-300 cursor-help transition-colors"
      >
        &#9432;
      </span>
      {tooltip}
    </>
  );
}
