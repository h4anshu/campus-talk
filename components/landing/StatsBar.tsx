'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';

interface Stat {
  target: number;
  label: string;
  format: (value: number) => string;
}

const STATS: Stat[] = [
  { target: 800, label: 'Students joined', format: (v) => `${Math.round(v)}+` },
  { target: 3.2, label: 'Questions answered', format: (v) => `${v.toFixed(1)}k` },
  { target: 540, label: 'Resources shared', format: (v) => `${Math.round(v)}` },
  { target: 94, label: 'Active today', format: (v) => `${Math.round(v)}` },
];

function StatItem({ stat, inView }: { stat: Stat; inView: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, stat.target, {
      duration: 1.5,
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, stat.target]);

  return (
    <div className="flex flex-col items-center justify-center py-2 text-center">
      <span className="text-[22px] font-medium text-[var(--text-primary)]">
        {stat.format(value)}
      </span>
      <span className="mt-1 text-[11px] text-[var(--text-muted)]">{stat.label}</span>
    </div>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 border-y-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-6 py-4 sm:grid-cols-4 sm:divide-x sm:divide-[var(--border)]"
    >
      {STATS.map((stat) => (
        <StatItem key={stat.label} stat={stat} inView={inView} />
      ))}
    </div>
  );
}
