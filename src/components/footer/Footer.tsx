"use client";

import { useLang } from "@/lib/i18n/context";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="py-12 px-4 border-t border-white/5">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-text-muted text-sm">{t.footer.tagline}</p>
        <p className="text-text-muted/50 text-xs mt-2">{t.footer.version}</p>
      </div>
    </footer>
  );
}
