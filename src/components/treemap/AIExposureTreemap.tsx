"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import BottomSheet from "@/components/shared/BottomSheet";
import { useLang, formatNumber } from "@/lib/i18n/context";
import { prepareTreemapData, exposureColor, type WorkforceFilter, type TreemapOccupation } from "@/lib/treemap/treemap-utils";
import { scoreToCategory } from "@/lib/utils";
import TreemapCanvas from "./TreemapCanvas";
import TreemapSidebar from "./TreemapSidebar";
import TreemapTooltip from "./TreemapTooltip";
import TreemapLegend from "./TreemapLegend";
import data from "@/data/master.json";

const highRisk = data.occupations.high_risk;
const lowRisk = data.occupations.low_risk;

export default function AIExposureTreemap() {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<WorkforceFilter>("all");
  const [hoveredOcc, setHoveredOcc] = useState<TreemapOccupation | null>(null);
  const [tooltipPos, setTooltipPos] = useState<DOMRect | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [sidebarSheetOpen, setSidebarSheetOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const treemapData = useMemo(() => prepareTreemapData(highRisk as any, lowRisk as any, filter), [filter]);

  const handleHover = (occ: TreemapOccupation | null, rect: DOMRect | null) => {
    setHoveredOcc(occ);
    setTooltipPos(rect);
  };

  // Mobile list: sorted by employment desc
  const listData = useMemo(
    () => [...treemapData].sort((a, b) => b.employment - a.employment),
    [treemapData]
  );

  return (
    <section id="sectors" className="pt-16 pb-20 px-4 md:px-8 max-w-[1800px] mx-auto" dir={lang === "ar" ? "rtl" : "ltr"}>
      <SectionHeader
        title={t.treemap.title}
        subtitle={t.treemap.subtitle}
      />

      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        {/* Sidebar — sticky + scrollable on desktop, hidden on mobile */}
        <div className="hidden lg:block lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:scrollbar-none">
          <TreemapSidebar
            data={treemapData}
            lang={lang}
            filter={filter}
            onFilterChange={setFilter}
            t={t}
          />
        </div>

        {/* Mobile: button to open sidebar in BottomSheet */}
        <div className="lg:hidden">
          <button
            onClick={() => setSidebarSheetOpen(true)}
            className="min-h-11 px-4 py-2 text-sm bg-bg-card/60 border border-white/10 rounded-md text-text-muted"
          >
            {t.treemap.everyone} / {t.treemap.saudiOnly} / {t.treemap.expatOnly}
          </button>
        </div>

        {/* Mobile BottomSheet for sidebar content */}
        <BottomSheet
          open={sidebarSheetOpen}
          onClose={() => setSidebarSheetOpen(false)}
          title={t.treemap.title}
        >
          <TreemapSidebar
            data={treemapData}
            lang={lang}
            filter={filter}
            onFilterChange={(f) => {
              setFilter(f);
              setSidebarSheetOpen(false);
            }}
            t={t}
          />
        </BottomSheet>

        {/* Main treemap area */}
        <div className="flex-1 min-w-0">
          {/* Legend + mobile toggle */}
          <div className="flex items-center justify-between mb-3">
            <TreemapLegend
              lang={lang}
              lowLabel={t.treemap.lowExposure}
              highLabel={t.treemap.highExposure}
            />
            <div className="flex lg:hidden rounded-md border border-white/10 overflow-hidden">
              <button
                onClick={() => setMobileView("map")}
                className={`px-3 py-1 text-xs min-h-11 ${mobileView === "map" ? "bg-accent-primary/20 text-accent-primary" : "text-text-muted"}`}
              >
                {t.treemap.mapView}
              </button>
              <button
                onClick={() => setMobileView("list")}
                className={`px-3 py-1 text-xs min-h-11 ${mobileView === "list" ? "bg-accent-primary/20 text-accent-primary" : "text-text-muted"}`}
              >
                {t.treemap.listView}
              </button>
            </div>
          </div>

          {/* Desktop: always treemap. Mobile: toggle */}
          <div className="hidden lg:block overflow-hidden">
            <motion.div
              key={filter}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <TreemapCanvas data={treemapData} lang={lang} onHover={handleHover} />
            </motion.div>
          </div>

          {/* Mobile view */}
          <div className="lg:hidden overflow-hidden">
            {mobileView === "map" ? (
              <motion.div
                key={`mobile-map-${filter}`}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
              >
                <TreemapCanvas data={treemapData} lang={lang} onHover={handleHover} />
              </motion.div>
            ) : (
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto mobile-scroll">
                {listData.slice(0, 50).map((occ, i) => {
                  const cat = scoreToCategory(occ.composite);
                  return (
                    <div
                      key={`${occ.name_en}-${i}`}
                      className="flex items-center gap-3 bg-bg-card/40 rounded-md px-3 py-2 border border-white/5 min-h-11"
                    >
                      <div
                        className="w-2 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: exposureColor(occ.composite) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">
                          {lang === "ar" ? occ.name_ar : occ.name_en}
                        </p>
                        <p className="text-xs text-text-muted font-mono">
                          {formatNumber(occ.employment, lang)} {t.treemap.workers.toLowerCase()} · {(occ.composite / 10).toFixed(1)}/10
                        </p>
                      </div>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: exposureColor(occ.composite) + "22",
                          color: exposureColor(occ.composite),
                        }}
                      >
                        {cat.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Source */}
          <p className="text-xs text-text-muted/50 mt-3">
            {lang === "ar"
              ? "المصدر: الهيئة العامة للإحصاء / التأمينات الاجتماعية الربع الثالث 2025 · تقييم الذكاء الاصطناعي: Frey-Osborne, Eloundou, Felten"
              : "Source: GASTAT / GOSI Q3 2025 · AI scores: Frey-Osborne, Eloundou, Felten"}
          </p>
        </div>
      </div>

      {/* Tooltip (portal-style, fixed position) */}
      <TreemapTooltip occ={hoveredOcc} position={tooltipPos} lang={lang} t={t} />
    </section>
  );
}
