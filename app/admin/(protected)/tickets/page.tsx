'use client';

import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useTickets } from '@/hooks/useTickets';
import Avatar from '@/components/shared/Avatar';
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

export default function AdminTicketsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: tickets, isLoading, isError } = useTickets();
  const selected = tickets?.find((t) => t.id === selectedId);

  if (selected) {
    return <TicketThread ticket={selected} onBack={() => setSelectedId(null)} viewerIsAdmin />;
  }

  return (
    <div>
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Tickets</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        {tickets?.length ?? 0} student ticket{tickets?.length === 1 ? '' : 's'}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-card bg-[var(--bg-surface)]" />
          ))
        ) : isError ? (
          <EmptyState title="Couldn't load tickets" description="Something went wrong. Try refreshing the page." />
        ) : !tickets || tickets.length === 0 ? (
          <EmptyState title="No tickets yet" description="Student tickets will show up here." />
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
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <Avatar initials={ticket.user.initials} color={ticket.user.avatarColor} size={16} />
                  {ticket.user.name} · {formatDistanceToNowStrict(ticket.createdAt, { addSuffix: true })}
                </div>
                {lastMessage && (
                  <p className="mt-1.5 line-clamp-1 break-words text-[11px] text-[var(--text-secondary)]">
                    {lastMessage.senderRole === 'admin' ? 'You: ' : ''}
                    {lastMessage.content}
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
