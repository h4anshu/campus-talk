'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ArrowLeft, Send } from 'lucide-react';
import type { MockTicket, MockTicketMessage } from '@/lib/mock/tickets';
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
}

export default function TicketThread({ ticket, onBack }: TicketThreadProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState(ticket.messages);
  const [reply, setReply] = useState('');

  const sendReply = () => {
    const trimmed = reply.trim();
    if (!trimmed) return;
    const newMessage: MockTicketMessage = {
      id: `${ticket.id}-local-${Date.now()}`,
      body: trimmed,
      fromAdmin: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setReply('');
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to tickets
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h1 className="text-[16px] font-medium text-[var(--text-primary)]">{ticket.subject}</h1>
        <span
          className={`rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[ticket.status]}`}
        >
          {STATUS_LABELS[ticket.status]}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
        <Avatar initials={ticket.user.initials} color={ticket.user.avatarColor} size={18} />
        {ticket.user.name} · {ticket.user.dept}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[85%] rounded-card border-[0.5px] p-3 ${
              msg.fromAdmin
                ? 'ml-auto border-[var(--accent-border)] bg-[var(--accent-dim)]'
                : 'border-[var(--border)] bg-[var(--bg-surface)]'
            }`}
          >
            <div className="text-[10px] font-medium text-[var(--text-muted)]">
              {msg.fromAdmin ? 'Admin' : ticket.user.name} ·{' '}
              {formatDistanceToNowStrict(msg.createdAt, { addSuffix: true })}
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-primary)]">{msg.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2 border-t-[0.5px] border-[var(--border)] pt-4">
        <Avatar initials={getInitials(session?.user?.name)} color={getAvatarColor(session?.user?.id)} size={24} />
        <div className="flex-1">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Reply as admin..."
            rows={2}
            className="w-full resize-none rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-2.5 py-2 text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
          <div className="mt-1.5 flex justify-end">
            <button
              onClick={sendReply}
              className="flex items-center gap-1.5 rounded bg-[var(--accent-fill)] px-3 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <Send className="h-3 w-3" />
              Send reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
