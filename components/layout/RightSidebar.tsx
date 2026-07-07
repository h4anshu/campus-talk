'use client';

import Link from 'next/link';
import { TrendingUp, CalendarDays, LifeBuoy } from 'lucide-react';
import { MOCK_TRENDING, MOCK_EVENTS } from '@/lib/mock';
import { useContactAdminStore } from '@/store/useContactAdminStore';
import { useCollegeStats } from '@/hooks/useCollegeStats';

function formatNumber(num: number | undefined): string {
  if (num === undefined) return '...';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(num);
}

export default function RightSidebar() {
  const { openDialog } = useContactAdminStore();
  const { data: stats } = useCollegeStats();

  const communityStats = [
    { label: 'Students', value: formatNumber(stats?.students) },
    { label: 'Online', value: formatNumber(stats?.online) },
    { label: 'Posts', value: formatNumber(stats?.posts) },
    { label: 'Answers', value: formatNumber(stats?.answers) },
  ];

  return (
    <aside className="sticky top-[52px] hidden h-[calc(100vh-52px)] w-[180px] shrink-0 flex-col gap-3.5 overflow-y-auto border-l-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-4 xl:flex">
      <div>
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          <TrendingUp className="h-3 w-3" />
          Trending
        </div>
        <div className="mt-2 flex flex-col gap-0.5">
          {MOCK_TRENDING.map((item) => (
            <Link
              key={item.id}
              href={`/post/${item.postId}`}
              className="rounded px-1.5 py-1.5 text-[11px] leading-snug text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)]"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          <CalendarDays className="h-3 w-3" />
          Upcoming events
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {MOCK_EVENTS.map((event) => (
            <Link
              key={event.id}
              href="/spaces/events"
              className="rounded border-[0.5px] border-[var(--border)] px-2 py-1.5 transition-colors hover:border-[var(--border-med)]"
            >
              <div className="text-[11px] font-medium text-[var(--text-primary)]">{event.title}</div>
              <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                {event.countdown} · {event.venue}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="px-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Community
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {communityStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded border-[0.5px] border-[var(--border)] px-2 py-1.5 text-center"
            >
              <div className="text-[13px] font-medium text-[var(--text-primary)]">{stat.value}</div>
              <div className="text-[11px] text-[var(--text-muted)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2.5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Live Pulse</span>
        </div>
        <span className="text-[11px] font-bold text-[var(--text-primary)]">
          {stats?.online ?? '0'} online
        </span>
      </div>

      <button
        onClick={openDialog}
        className="mt-auto flex items-center justify-center gap-1.5 rounded border-[0.5px] border-[var(--border-med)] px-2.5 py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)]"
      >
        <LifeBuoy className="h-3.5 w-3.5" />
        Contact admin
      </button>
    </aside>
  );
}
