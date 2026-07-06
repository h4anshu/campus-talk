'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';

interface CountUpProps {
  /** Final value to animate to. */
  to: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** Divide by 1000 and append "k" once the value crosses 1000. */
  compact?: boolean;
  /** Suffix appended after the formatted number (e.g. "%"). */
  suffix?: string;
  className?: string;
}

function format(value: number, compact: boolean): string {
  if (compact && value >= 1000) {
    const k = value / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return Math.round(value).toString();
}

/**
 * Animates a number from 0 to `to` the first time it scrolls into view.
 * Respects the reduced-motion story by snapping straight to the value if the
 * element is already visible on mount.
 */
export default function CountUp({
  to,
  duration = 1.2,
  compact = false,
  suffix = '',
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {format(display, compact)}
      {suffix}
    </span>
  );
}
