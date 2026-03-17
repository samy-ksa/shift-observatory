"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import * as d3 from "d3";
import {
  exposureColor,
  sqrtScale,
  SECTOR_LABELS_EN,
  SECTOR_LABELS_AR,
  type TreemapOccupation,
} from "@/lib/treemap/treemap-utils";
import { formatNumber } from "@/lib/i18n/context";

interface TreemapCanvasProps {
  data: TreemapOccupation[];
  lang: string;
  onHover: (occ: TreemapOccupation | null, rect: DOMRect | null) => void;
}

interface SectorNode {
  sector_id: string;
  x0: number; y0: number; x1: number; y1: number;
}

interface OccNode {
  x0: number; y0: number; x1: number; y1: number;
  data: TreemapOccupation;
}

export default function TreemapCanvas({ data, lang, onHover }: TreemapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 900, height: 950 });
  const isAr = lang === "ar";

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      if (width > 0) {
        const height = Math.max(600, Math.min(1100, width * 0.85));
        setDims({ width, height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const { sectorNodes, occNodes } = useMemo(() => {
    if (data.length === 0 || dims.width <= 0 || dims.height <= 0)
      return { sectorNodes: [] as SectorNode[], occNodes: [] as OccNode[] };

    const sectorMap: Record<string, TreemapOccupation[]> = {};
    data.forEach((o) => {
      const sid = o.sector_id || "other_services";
      if (!sectorMap[sid]) sectorMap[sid] = [];
      sectorMap[sid].push(o);
    });

    const hierarchyData = {
      name: "root",
      children: Object.entries(sectorMap).map(([sid, occs]) => ({
        name: sid,
        children: occs.map((o) => ({ name: o.name_en, ...o })),
      })),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = d3.hierarchy(hierarchyData as any)
      .sum((d: unknown) => {
        const node = d as { employment?: number };
        return node.employment ? sqrtScale(node.employment) : 0;
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d3.treemap<any>()
      .size([dims.width, dims.height])
      .tile(d3.treemapSquarify.ratio(1.3))
      .paddingTop(20)
      .paddingInner(3)
      .paddingOuter(2)(root);

    const sectors: SectorNode[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    root.children?.forEach((child: any) => {
      sectors.push({ sector_id: child.data.name, x0: child.x0, y0: child.y0, x1: child.x1, y1: child.y1 });
    });

    const leaves: OccNode[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    root.leaves().forEach((leaf: any) => {
      if (leaf.data.employment) {
        leaves.push({ x0: leaf.x0, y0: leaf.y0, x1: leaf.x1, y1: leaf.y1, data: leaf.data as TreemapOccupation });
      }
    });

    return { sectorNodes: sectors, occNodes: leaves };
  }, [data, dims]);

  const handleMouseMove = useCallback(
    (node: OccNode, e: React.MouseEvent) => {
      onHover(node.data, new DOMRect(e.clientX, e.clientY, 0, 0));
    },
    [onHover]
  );

  const sectorLabels = isAr ? SECTOR_LABELS_AR : SECTOR_LABELS_EN;

  return (
    <div ref={containerRef} className="w-full relative" style={{ height: dims.height }}>
      {/* SVG for colored rectangles only */}
      <svg
        width={dims.width}
        height={dims.height}
        className="block absolute inset-0"
      >
        {/* Sector backgrounds */}
        {sectorNodes.map((s) => {
          const sw = s.x1 - s.x0;
          if (sw < 35) return null;
          return (
            <rect key={s.sector_id} x={s.x0} y={s.y0} width={sw} height={s.y1 - s.y0}
              fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} rx={5} />
          );
        })}

        {/* Occupation colored rects */}
        {occNodes.map((node, i) => (
          <rect
            key={`rect-${node.data.name_en}-${i}`}
            x={node.x0} y={node.y0}
            width={node.x1 - node.x0} height={node.y1 - node.y0}
            fill={exposureColor(node.data.composite)} fillOpacity={0.85}
            stroke="#0A0E17" strokeWidth={1.5} rx={3}
            style={{ filter: "none" }}
            onMouseMove={(e) => handleMouseMove(node, e)}
            onMouseLeave={() => onHover(null, null)}
            onMouseOver={(e) => { (e.target as SVGRectElement).style.filter = "brightness(1.2)"; }}
            onMouseOut={(e) => { (e.target as SVGRectElement).style.filter = "none"; }}
            className="cursor-pointer"
          />
        ))}
      </svg>

      {/* HTML overlay for text — uses native browser text rendering */}
      <div className="absolute inset-0 pointer-events-none" style={{ width: dims.width, height: dims.height }}>
        {/* Sector labels */}
        {sectorNodes.map((s) => {
          const sw = s.x1 - s.x0;
          if (sw < 50) return null;
          return (
            <div
              key={`slabel-${s.sector_id}`}
              className="absolute overflow-hidden"
              style={{
                left: s.x0 + 6,
                top: s.y0 + 3,
                width: sw - 12,
                height: 16,
                direction: isAr ? "rtl" : "ltr",
              }}
            >
              <span
                className="text-white/50 font-semibold whitespace-nowrap block truncate"
                style={{ fontSize: sw > 130 ? 10 : 8, letterSpacing: isAr ? 0 : "0.05em" }}
              >
                {isAr
                  ? sectorLabels[s.sector_id] || s.sector_id
                  : (sectorLabels[s.sector_id] || s.sector_id).toUpperCase()}
              </span>
            </div>
          );
        })}

        {/* Occupation labels — HTML divs with native text rendering */}
        {occNodes.map((node, i) => {
          const w = node.x1 - node.x0;
          const h = node.y1 - node.y0;
          const area = w * h;
          const name = isAr ? node.data.name_ar : node.data.name_en;

          // Size thresholds
          const showName = w > 35 && h > 22 && area > 1000;
          const showScore = w > 50 && h > 40 && area > 3500;
          const showCount = w > 75 && h > 58 && area > 10000;

          if (!showName) return null;

          // Font sizes based on area
          const nameSize = area > 50000 ? 14 : area > 20000 ? 13 : area > 8000 ? 12 : area > 3000 ? 11 : 10;

          return (
            <div
              key={`label-${node.data.name_en}-${i}`}
              className="absolute overflow-hidden pointer-events-none"
              style={{
                left: node.x0 + 2,
                top: node.y0 + 2,
                width: w - 4,
                height: h - 4,
                direction: isAr ? "rtl" : "ltr",
              }}
            >
              {/* Dark background strip */}
              <div
                className="absolute inset-x-0 top-0 rounded-sm"
                style={{
                  height: showCount ? "100%" : showScore ? "70%" : "55%",
                  maxHeight: h - 4,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%)",
                }}
              />

              {/* Text content */}
              <div className="relative px-1.5 pt-1" style={{ direction: isAr ? "rtl" : "ltr" }}>
                {/* Name */}
                <p
                  className="text-white font-extrabold leading-tight truncate"
                  style={{ fontSize: nameSize }}
                >
                  {name}
                </p>

                {/* Score */}
                {showScore && (
                  <p
                    className="text-white/90 font-bold font-mono leading-tight mt-0.5"
                    style={{ fontSize: Math.max(9, nameSize - 2) }}
                  >
                    {(node.data.composite / 10).toFixed(1)}/10
                  </p>
                )}

                {/* Worker count */}
                {showCount && (
                  <p
                    className="text-white/70 font-mono leading-tight mt-0.5"
                    style={{ fontSize: Math.max(8, nameSize - 3) }}
                  >
                    {formatNumber(node.data.employment, lang)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
