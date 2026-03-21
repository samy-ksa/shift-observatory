"use client";

import { useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="absolute bottom-0 inset-x-0 bg-bg-card border-t border-white/10 rounded-t-xl max-h-[60vh] flex flex-col animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center py-3 flex-shrink-0" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-gray-600" />
        </div>
        {title && (
          <div className="px-4 pb-2 flex-shrink-0">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 mobile-scroll">
          {children}
        </div>
      </div>
    </div>
  );
}
