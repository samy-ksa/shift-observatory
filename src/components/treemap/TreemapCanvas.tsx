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
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface OccNode {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  data: TreemapOccupation;
}

/** Wrap text into lines that fit maxWidth */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const charWidth = fontSize * 0.55;
  const maxChars = Math.floor((maxWidth - 12) / charWidth);
  if (maxChars < 3) return [];
  if (text.length <= maxChars) return [text];

  const words = text.split(/[\s/]+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= maxChars) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word.length > maxChars ? word.slice(0, maxChars - 1) + "…" : word;
    }
    if (lines.length >= 2) break;
  }
  if (current && lines.length < 3) lines.push(current);
  return lines;
}

/** Get contrasting text color for a given background */
function textColor(composite: number): string {
  // Use white text for most, only very light greens get dark text
  return composite < 15 ? "rgba(0,0,0,0.85)" : "#ffffff";
}

export default function TreemapCanvas({ data, lang, onHover }: TreemapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 900, height: 950 });

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      if (width > 0) {
        // Dynamic height based on width — taller for wider screens
        const height = Math.max(600, Math.min(1100, width * 0.85));
        setDims({ width, height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Build 2-level hierarchy: sector → occupations
  const { sectorNodes, occNodes } = useMemo(() => {
    if (data.length === 0 || dims.width <= 0 || dims.height <= 0)
      return { sectorNodes: [] as SectorNode[], occNodes: [] as OccNode[] };

    // Group by sector
    const sectorMap: Record<string, TreemapOccupation[]> = {};
    data.forEach((o) => {
      const sid = o.sector_id || "other_services";
      if (!sectorMap[sid]) sectorMap[sid] = [];
      sectorMap[sid].push(o);
    });

    // Build hierarchical data
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
      .tile(d3.treemapSquarify.ratio(1.2))
      .paddingTop(22) // Space for sector labels
      .paddingInner(3)
      .paddingOuter(2)(root);

    // Extract sector boundaries (depth 1)
    const sectors: SectorNode[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    root.children?.forEach((child: any) => {
      sectors.push({
        sector_id: child.data.name,
        x0: child.x0,
        y0: child.y0,
        x1: child.x1,
        y1: child.y1,
      });
    });

    // Extract leaf nodes (depth 2 = individual occupations)
    const leaves: OccNode[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    root.leaves().forEach((leaf: any) => {
      if (leaf.data.employment) {
        leaves.push({
          x0: leaf.x0,
          y0: leaf.y0,
          x1: leaf.x1,
          y1: leaf.y1,
          data: leaf.data as TreemapOccupation,
        });
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

  const sectorLabels = lang === "ar" ? SECTOR_LABELS_AR : SECTOR_LABELS_EN;

  return (
    <div ref={containerRef} className="w-full relative" style={{ minHeight: 600 }}>
      <svg width={dims.width} height={dims.height} className="block">
        {/* Sector group backgrounds + labels */}
        {sectorNodes.map((sector) => {
          const sw = sector.x1 - sector.x0;
          if (sw < 30) return null;
          return (
            <g key={sector.sector_id}>
              {/* Sector background */}
              <rect
                x={sector.x0}
                y={sector.y0}
                width={sector.x1 - sector.x0}
                height={sector.y1 - sector.y0}
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
                rx={6}
              />
              {/* Sector label */}
              <text
                x={sector.x0 + 6}
                y={sector.y0 + 15}
                fill="rgba(255,255,255,0.55)"
                fontSize={sw > 120 ? 11 : 9}
                fontWeight={600}
                fontFamily="DM Sans, sans-serif"
                letterSpacing="0.04em"
                style={{ pointerEvents: "none", textTransform: "uppercase" }}
              >
                {(sectorLabels[sector.sector_id] || sector.sector_id).toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Occupation rectangles */}
        {occNodes.map((node, i) => {
          const w = node.x1 - node.x0;
          const h = node.y1 - node.y0;
          const color = exposureColor(node.data.composite);
          const name = lang === "ar" ? node.data.name_ar : node.data.name_en;
          const fill = textColor(node.data.composite);

          // Don't render labels in very tiny rects
          const area = w * h;
          const showAny = area > 600 && w > 25 && h > 18;

          // Adaptive font size
          const fontSize = area > 50000 ? 15
            : area > 25000 ? 14
            : area > 12000 ? 13
            : area > 5000 ? 12
            : 10;

          // Text layout
          const nameLines = showAny ? wrapText(name, w, fontSize) : [];
          const nameHeight = nameLines.length * (fontSize + 3);
          const scoreFontSize = Math.max(9, fontSize - 2);
          const showScore = showAny && w > 55 && (h - nameHeight - 6) > scoreFontSize + 2;
          const showWorkers = showAny && w > 80 && (h - nameHeight - 6) > (scoreFontSize + 2) * 2;

          return (
            <g
              key={`${node.data.name_en}-${i}`}
              onMouseMove={(e) => handleMouseMove(node, e)}
              onMouseLeave={() => onHover(null, null)}
              className="cursor-pointer"
            >
              {/* Main colored rect */}
              <rect
                x={node.x0}
                y={node.y0}
                width={w}
                height={h}
                fill={color}
                fillOpacity={0.8}
                stroke="#0A0E17"
                strokeWidth={1.5}
                rx={3}
                className="hover:brightness-125 transition-all duration-150"
                style={{ filter: "none" }}
                onMouseOver={(e) => {
                  (e.target as SVGRectElement).style.filter = "brightness(1.3)";
                }}
                onMouseOut={(e) => {
                  (e.target as SVGRectElement).style.filter = "none";
                }}
              />

              {/* Dark gradient overlay for text contrast */}
              {nameLines.length > 0 && (
                <rect
                  x={node.x0 + 1}
                  y={node.y0 + 1}
                  width={w - 2}
                  height={Math.min(h - 2, nameHeight + (showScore ? scoreFontSize + 16 : 10))}
                  fill="rgba(0,0,0,0.45)"
                  rx={2}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Name — wrapped lines */}
              {nameLines.map((line, li) => (
                <text
                  key={li}
                  x={node.x0 + 6}
                  y={node.y0 + fontSize + 4 + li * (fontSize + 3)}
                  fill={fill}
                  fontSize={fontSize}
                  fontWeight={700}
                  fontFamily="DM Sans, sans-serif"
                  style={{
                    pointerEvents: "none",
                    textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                  }}
                >
                  {line}
                </text>
              ))}

              {/* Score */}
              {showScore && nameLines.length > 0 && (
                <text
                  x={node.x0 + 6}
                  y={node.y0 + nameHeight + scoreFontSize + 6}
                  fill="rgba(255,255,255,0.85)"
                  fontSize={scoreFontSize}
                  fontWeight={600}
                  fontFamily="JetBrains Mono, monospace"
                  style={{
                    pointerEvents: "none",
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {(node.data.composite / 10).toFixed(1)}/10
                </text>
              )}

              {/* Worker count on separate line for large rects */}
              {showWorkers && nameLines.length > 0 && (
                <text
                  x={node.x0 + 6}
                  y={node.y0 + nameHeight + (scoreFontSize + 6) * 2}
                  fill="rgba(255,255,255,0.6)"
                  fontSize={scoreFontSize - 1}
                  fontWeight={400}
                  fontFamily="JetBrains Mono, monospace"
                  style={{
                    pointerEvents: "none",
                    textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                  }}
                >
                  {formatNumber(node.data.employment, lang)} jobs
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
