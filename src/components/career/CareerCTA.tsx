"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/context";
import { motion } from "framer-motion";

export default function CareerCTA() {
  const { t, dir } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-6"
      dir={dir}
    >
      <Link
        href="/career"
        className="group flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl
          bg-gradient-to-r from-accent-primary/10 to-cyan-500/5
          border border-accent-primary/20 hover:border-accent-primary/40
          transition-all duration-300 hover:shadow-lg hover:shadow-accent-primary/10"
      >
        <span className="text-text-primary font-medium text-base group-hover:text-accent-primary transition-colors">
          {t.career.cta}
        </span>
      </Link>
    </motion.div>
  );
}
