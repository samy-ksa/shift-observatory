"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import { useLang } from "@/lib/i18n/context";
import data from "@/data/master.json";

const wef = data.wef;

export default function WEFDualList() {
  const { t, lang } = useLang();

  const itemName = (item: { name: string; name_ar?: string }) =>
    lang === "ar" && item.name_ar ? item.name_ar : item.name;

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title={t.wef.title}
          subtitle={t.wef.subtitle}
          id="wef"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Growth Column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">&#x1F4C8;</span>
              <h3 className="text-xl font-bold text-risk-very-low">
                {t.wef.growing}
              </h3>
            </div>
            <div className="space-y-2">
              {wef.growth.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3 bg-risk-very-low/5 border border-risk-very-low/10 rounded-lg px-4 py-3 group hover:bg-risk-very-low/10 transition-colors"
                >
                  <span className="text-sm font-mono font-bold text-risk-very-low w-6 text-right">
                    {item.rank}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-text-primary">
                      {itemName(item as { name: string; name_ar?: string })}
                    </span>
                  </div>
                  <span className="text-xs text-risk-very-low/70 whitespace-nowrap">
                    {item.trend === "Very Rapid Growth"
                      ? t.wef.trends.veryRapid
                      : item.trend === "Rapid Growth"
                        ? t.wef.trends.rapid
                        : item.trend}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decline Column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">&#x1F4C9;</span>
              <h3 className="text-xl font-bold text-risk-very-high">
                {t.wef.declining}
              </h3>
            </div>
            <div className="space-y-2">
              {wef.decline.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3 bg-risk-very-high/5 border border-risk-very-high/10 rounded-lg px-4 py-3 group hover:bg-risk-very-high/10 transition-colors"
                >
                  <span className="text-sm font-mono font-bold text-risk-very-high w-6 text-right">
                    {item.rank}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-text-primary">
                      {itemName(item as { name: string; name_ar?: string })}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-risk-very-high">
                    {item.decline_pct}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
