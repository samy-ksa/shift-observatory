"use client";

/**
 * LazyRecharts — wraps each Recharts component with IntersectionObserver
 * so the 346 KiB Recharts bundle is NOT added to the page's script manifest
 * (unlike next/dynamic which adds <script async> in initial HTML).
 *
 * Each component defines its own factory inline so there is no function
 * prop crossing the Server → Client boundary.
 */

import { useEffect, useRef, useState, type ComponentType } from "react";

function useLazyLoad(factory: () => Promise<{ default: ComponentType }>) {
  const ref = useRef<HTMLDivElement>(null);
  const [Comp, setComp] = useState<ComponentType | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          factory().then((m) => setComp(() => m.default));
          obs.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, Comp };
}

export function LazyLayoffsChart() {
  const { ref, Comp } = useLazyLoad(
    () => import("@/components/layoffs/LayoffsChart")
  );
  if (!Comp)
    return (
      <div ref={ref} className="h-80 animate-pulse bg-gray-900/50 rounded-lg mx-4" />
    );
  return <Comp />;
}

export function LazyParadoxChart() {
  const { ref, Comp } = useLazyLoad(
    () => import("@/components/paradox/ParadoxChart")
  );
  if (!Comp)
    return (
      <div ref={ref} className="h-80 animate-pulse bg-gray-900/50 rounded-lg mx-4" />
    );
  return <Comp />;
}
