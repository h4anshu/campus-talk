'use client';

import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useTickets } from '@/hooks/useTickets';
import { useContactAdminStore } from '@/store/useContactAdminStore';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import TicketThread from '@/components/tickets/TicketThread';

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'border-[var(--warning-border)] bg-[var(--warning-dim)] text-[var(--warning)]',
  IN_PROGRESS: 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]',
  RESOLVED: 'border-[var(--success-border)] bg-[var(--success-dim)] text-[var(--success)]',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

export default function MyTicketsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: tickets, isLoading, isError } = useTickets();
  const { openDialog } = useContactAdminStore();
  const selected = tickets?.find((t) => t.id === selectedId);

  if (selected) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-6">
        <TicketThread ticket={selected} onBack={() => setSelectedId(null)} viewerIsAdmin={false} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Admin messages</h1>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
            {tickets?.length ?? 0} ticket{tickets?.length === 1 ? '' : 's'} with admin
          </p>
        </div>
        <button
          onClick={openDialog}
          className="rounded bg-[var(--accent-fill)] px-3.5 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
        >
          New ticket
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-card bg-[var(--bg-surface)]" />
          ))
        ) : isError ? (
          <EmptyState title="Couldn't load tickets" description="Something went wrong. Try refreshing the page." />
        ) : !tickets || tickets.length === 0 ? (
          <EmptyState title="No tickets yet" description="Contact admin to open your first ticket." />
        ) : (
          tickets.map((ticket) => {
            const lastMessage = ticket.messages[ticket.messages.length - 1];
            return (
              <button
                key={ticket.id}
                onClick={() => setSelectedId(ticket.id)}
                className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left transition-colors hover:border-[var(--border-med)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {ticket.unread && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" aria-label="Unread" />
                  )}
                  <span className="break-words text-[13px] font-medium text-[var(--text-primary)]">
                    {ticket.subject}
                  </span>
                  <span
                    className={`rounded-full border-[0.5px] px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[ticket.status]}`}
                  >
                    {STATUS_LABELS[ticket.status]}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                  {formatDistanceToNowStrict(ticket.createdAt, { addSuffix: true })}
                </div>
                {lastMessage && (
                  <p className="mt-1.5 line-clamp-1 break-words text-[11px] text-[var(--text-secondary)]">
                    {lastMessage.fromAdmin ? 'Admin: ' : 'You: '}
                    {lastMessage.body}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
