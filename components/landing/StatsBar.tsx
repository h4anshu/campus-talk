'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useInView, animate } from 'framer-motion';
import {
  HiOutlineUsers,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBookOpen,
  HiOutlineBolt,
} from 'react-icons/hi2';

interface Stat {
  target: number;
  label: string;
  format: (value: number) => string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
}

const STATS: Stat[] = [
  {
    target: 800,
    label: 'Students joined',
    format: (v) => `${Math.round(v)}+`,
    icon: HiOutlineUsers,
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  },
  {
    target: 3.2,
    label: 'Questions answered',
    format: (v) => `${v.toFixed(1)}k`,
    icon: HiOutlineChatBubbleLeftRight,
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  },
  {
    target: 540,
    label: 'Resources shared',
    format: (v) => `${Math.round(v)}`,
    icon: HiOutlineBookOpen,
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
  },
  {
    target: 94,
    label: 'Active today',
    format: (v) => `${Math.round(v)}`,
    icon: HiOutlineBolt,
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
  },
];

function StatItem({ stat, inView }: { stat: Stat; inView: boolean }) {
  const [value, setValue] = useState(0);
  const Icon = stat.icon;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, stat.target, {
      duration: 1.5,
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, stat.target]);

  return (
    <div className="flex items-center justify-center gap-4 px-6 py-7">
      <span
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: stat.gradient }}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="flex flex-col">
        <span className="text-[36px] font-bold leading-none text-[var(--text-primary)]">
          {stat.format(value)}
        </span>
        <span className="mt-1.5 text-[14px] text-[var(--text-muted)]">{stat.label}</span>
      </div>
    </div>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 border-y-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] sm:grid-cols-4 sm:divide-x sm:divide-[var(--border)]"
    >
      {STATS.map((stat) => (
        <StatItem key={stat.label} stat={stat} inView={inView} />
      ))}
    </div>
  );
}
