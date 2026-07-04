'use client';

import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { MOCK_TICKETS } from '@/lib/mock';
import Avatar from '@/components/shared/Avatar';
import TicketThread from '@/components/admin/TicketThread';

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

export default function TicketsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = MOCK_TICKETS.find((t) => t.id === selectedId);

  if (selected) {
    return <TicketThread ticket={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div>
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Tickets</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        {MOCK_TICKETS.length} student ticket{MOCK_TICKETS.length === 1 ? '' : 's'}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {MOCK_TICKETS.map((ticket) => {
          const lastMessage = ticket.messages[ticket.messages.length - 1];
          return (
            <button
              key={ticket.id}
              onClick={() => setSelectedId(ticket.id)}
              className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left transition-colors hover:border-[var(--border-med)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">{ticket.subject}</span>
                <span
                  className={`rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[ticket.status]}`}
                >
                  {STATUS_LABELS[ticket.status]}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <Avatar initials={ticket.user.initials} color={ticket.user.avatarColor} size={16} />
                {ticket.user.name} · {formatDistanceToNowStrict(ticket.createdAt, { addSuffix: true })}
              </div>
              {lastMessage && (
                <p className="mt-1.5 line-clamp-1 text-[11px] text-[var(--text-secondary)]">
                  {lastMessage.fromAdmin ? 'You: ' : ''}
                  {lastMessage.body}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
