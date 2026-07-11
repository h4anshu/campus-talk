'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { MockTicket } from '@/lib/mock/tickets';
import { useReplyTicket, useTicketStatus, useMarkTicketRead } from '@/hooks/useTickets';
import { getInitials, getAvatarColor } from '@/lib/utils';
import Avatar from '@/components/shared/Avatar';

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

interface TicketThreadProps {
  ticket: MockTicket;
  onBack: () => void;
  /** Admin can see every ticket and change status; a student only replies on their own. */
  viewerIsAdmin: boolean;
}

export default function TicketThread({ ticket, onBack, viewerIsAdmin }: TicketThreadProps) {
  const { data: session } = useSession();
  const [reply, setReply] = useState('');
  const { mutate: sendReply, isPending } = useReplyTicket(ticket.id);
  const { mutate: setStatus } = useTicketStatus(ticket.id);
  const { mutate: markRead } = useMarkTicketRead(ticket.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Opening this thread is what clears the unread badge for whichever side
  // is currently looking at it — the other side's messages are marked read.
  useEffect(() => {
    markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [ticket.messages.length]);

  const submit = () => {
    const trimmed = reply.trim();
    if (!trimmed) return;
    sendReply(trimmed, {
      onSuccess: () => setReply(''),
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to send reply'),
    });
  };

  return (
    <div className="flex h-[calc(100vh-160px)] max-h-[720px] flex-col">
      <div className="shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to tickets
        </button>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="break-words text-[16px] font-medium text-[var(--text-primary)]">{ticket.subject}</h1>
          {viewerIsAdmin ? (
            <select
              value={ticket.status}
              onChange={(e) => setStatus(e.target.value as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED')}
              className={`rounded-full border-[0.5px] px-2 py-0.5 text-[11px] font-medium outline-none ${STATUS_STYLES[ticket.status]}`}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <span
              className={`rounded-full border-[0.5px] px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[ticket.status]}`}
            >
              {STATUS_LABELS[ticket.status]}
            </span>
          )}
        </div>
        {viewerIsAdmin && (
          <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
            <Avatar initials={ticket.user.initials} color={ticket.user.avatarColor} size={18} />
            {ticket.user.name} · {ticket.user.dept}
          </div>
        )}
      </div>

      <div ref={scrollRef} className="mt-4 flex-1 overflow-y-auto rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-page)] p-4">
        <div className="flex flex-col gap-3">
          {ticket.messages.map((msg) => {
            // Alignment is read straight off the message's own stored
            // senderRole — never derived from position in the array, which
            // side rendered it first, or a comparison against the current
            // viewer's session id.
            const isMine = viewerIsAdmin ? msg.senderRole === 'admin' : msg.senderRole === 'user';
            return (
              <div key={msg.id} className={`flex max-w-[75%] flex-col ${isMine ? 'ml-auto items-end' : 'items-start'}`}>
                <div
                  className={`rounded-card border-[0.5px] px-3 py-2 ${
                    isMine
                      ? 'border-[var(--accent-border)] bg-[var(--accent-dim)]'
                      : 'border-[var(--border)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <p className="break-words text-[12px] leading-relaxed text-[var(--text-primary)]">{msg.content}</p>
                </div>
                <span
                  className="mt-1 px-1 text-[11px] text-[var(--text-muted)]"
                  title={format(msg.createdAt, 'PPpp')}
                >
                  {msg.senderRole === 'admin' ? 'Admin' : msg.senderName} ·{' '}
                  {formatDistanceToNowStrict(msg.createdAt, { addSuffix: true })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex shrink-0 gap-2">
        <Avatar
          initials={viewerIsAdmin ? 'AD' : getInitials(session?.user?.name)}
          color={viewerIsAdmin ? 'var(--accent)' : getAvatarColor(session?.user?.id)}
          size={28}
        />
        <div className="flex flex-1 gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={viewerIsAdmin ? 'Reply as admin...' : 'Write a message...'}
            rows={1}
            className="flex-1 resize-none rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
          <button
            onClick={submit}
            disabled={isPending || !reply.trim()}
            className="flex shrink-0 items-center gap-1.5 rounded bg-[var(--accent-fill)] px-3.5 py-2 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
