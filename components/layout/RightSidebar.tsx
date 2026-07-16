'use client';

import Link from 'next/link';
import { TrendingUp, CalendarDays, LifeBuoy } from 'lucide-react';
import { useContactAdminStore } from '@/store/useContactAdminStore';
import { useSidebar } from '@/hooks/useSidebar';
import { Skeleton } from '@/components/ui/skeleton';

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(num);
}

export default function RightSidebar() {
  const { openDialog } = useContactAdminStore();
  const { data, isLoading } = useSidebar();

  return (
    <aside className="sticky top-[52px] hidden h-[calc(100vh-52px)] w-[180px] shrink-0 flex-col gap-3.5 overflow-y-auto border-l-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-4 xl:flex">
      <div>
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          <TrendingUp className="h-3 w-3" />
          Trending
        </div>
        <div className="mt-2 flex flex-col gap-0.5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[28px] rounded bg-[var(--bg-panel)]" />
            ))
          ) : data?.trending.length === 0 ? (
            <p className="px-1 text-[12px] text-[var(--text-muted)]">No trending posts yet</p>
          ) : (
            data?.trending.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="rounded px-1.5 py-1.5 text-[11px] leading-snug text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)] line-clamp-2"
              >
                {post.title}
              </Link>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          <CalendarDays className="h-3 w-3" />
          Upcoming events
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-[44px] rounded bg-[var(--bg-panel)]" />
            ))
          ) : data?.upcomingEvents.length === 0 ? (
            <p className="py-1 text-[12px] text-[var(--text-muted)]">No upcoming events</p>
          ) : (
            data?.upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/post/${event.id}`}
                className="rounded border-[0.5px] border-[var(--border)] px-2 py-1.5 transition-colors hover:border-[var(--border-med)] hover:opacity-80"
              >
                <div className="text-[11px] font-medium text-[var(--text-primary)] line-clamp-1">{event.title}</div>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {event.daysUntil === 0
                    ? 'Today'
                    : event.daysUntil === 1
                      ? 'Tomorrow'
                      : `In ${event.daysUntil} days`}
                  {event.eventLocation && ` · ${event.eventLocation}`}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="px-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Community
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {(['students', 'posts', 'answers'] as const).map((key) => (
            <div
              key={key}
              className={`rounded border-[0.5px] border-[var(--border)] px-2 py-1.5 text-center ${key === 'answers' ? 'col-span-2' : ''}`}
            >
              <div className="text-[13px] font-medium text-[var(--text-primary)]">
                {data?.community[key] !== undefined ? formatNumber(data.community[key]) : '—'}
              </div>
              <div className="capitalize text-[11px] text-[var(--text-muted)]">{key}</div>
            </div>
          ))}
        </div>
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
