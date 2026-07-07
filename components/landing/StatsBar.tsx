'use client';

import { type ComponentType } from 'react';
import {
  HiOutlineUsers,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBookOpen,
  HiOutlineBolt,
} from 'react-icons/hi2';
import CountUp from './CountUp';

interface Stat {
  /** Final value CountUp animates to. */
  to: number;
  /** Divide by 1000 and append "k" (e.g. 3200 → "3.2k"). */
  compact?: boolean;
  /** Suffix appended after the number (e.g. "+"). */
  suffix?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
}

const STATS: Stat[] = [
  {
    to: 800,
    suffix: '+',
    label: 'Students joined',
    icon: HiOutlineUsers,
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  },
  {
    to: 3200,
    compact: true,
    label: 'Questions answered',
    icon: HiOutlineChatBubbleLeftRight,
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  },
  {
    to: 540,
    label: 'Resources shared',
    icon: HiOutlineBookOpen,
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
  },
  {
    to: 94,
    label: 'Active today',
    icon: HiOutlineBolt,
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
  },
];

function StatItem({ stat }: { stat: Stat }) {
  const Icon = stat.icon;

  return (
    <div className="flex items-center justify-center gap-4 px-6 py-7">
      <span
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: stat.gradient }}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="flex flex-col">
        <CountUp
          to={stat.to}
          compact={stat.compact}
          suffix={stat.suffix}
          duration={1.5}
          className="text-[36px] font-bold leading-none text-[var(--text-primary)]"
        />
        <span className="mt-1.5 text-[14px] text-[var(--text-muted)]">{stat.label}</span>
      </div>
    </div>
  );
}

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 border-y-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] sm:grid-cols-4 sm:divide-x sm:divide-[var(--border)]">
      {STATS.map((stat) => (
        <StatItem key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
