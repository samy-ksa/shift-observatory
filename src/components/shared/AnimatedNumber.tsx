"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (n: number) => string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 2000,
  formatFn,
  className = "",
}: AnimatedNumberProps) {
  // SSR renders the real value so search engines see actual numbers.
  // On the client we reset to 0 and animate up when the element is visible.
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const hasMounted = useRef(false);

  // After hydration, reset to 0 so the animation can play
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setDisplay(0);
    }
  }, []);

  useEffect(() => {
    if (!hasMounted.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted = formatFn
    ? formatFn(display)
    : display.toLocaleString("en-US");

  return (
    <span ref={ref} className={`font-mono ${className}`} data-value={value}>
      {formatted}
    </span>
  );
}
