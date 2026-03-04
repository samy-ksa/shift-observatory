"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  id?: string;
}

export default function SectionHeader({ title, subtitle, id }: SectionHeaderProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <h2 className="text-sm font-semibold uppercase tracking-widest text-cyan-400 mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-text-secondary text-sm max-w-2xl">{subtitle}</p>
      )}
    </motion.div>
  );
}
