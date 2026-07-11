import type { Ticket, TicketMessage, User } from '@prisma/client';
import { getInitials, getAvatarColor } from '@/lib/utils';
import type { MockTicket } from '@/lib/mock/tickets';

type TicketUserLite = Pick<User, 'id' | 'name' | 'year' | 'dept'>;

export type TicketForSerialization = Ticket & {
  user: TicketUserLite;
  messages: TicketMessage[];
};

// The Prisma schema (per CLAUDE.md) stores the ticket's opening message as
// `subject` + `body` directly on Ticket, with only *replies* in TicketMessage.
// The existing mock-data UI contract (built in Phase 6) instead models a
// ticket as a subject + a flat `messages[]` thread with no separate `body`.
// Rather than changing either the schema or the UI, this synthesizes that
// opening message from `ticket.body` so both sides stay compatible. Its
// sender is always the ticket owner — there's no separate TicketMessage row
// for it, so senderId/senderName are read straight off `ticket.user`.
export function serializeTicket(ticket: TicketForSerialization, viewerIsAdmin: boolean): MockTicket {
  // The opening message is authored by the student, so it's never "unread"
  // for them — only admin needs `openedByAdmin` to know if they've seen it.
  const unread = viewerIsAdmin
    ? !ticket.openedByAdmin || ticket.messages.some((m) => m.senderRole === 'USER' && !m.isRead)
    : ticket.messages.some((m) => m.senderRole === 'ADMIN' && !m.isRead);

  return {
    id: ticket.id,
    subject: ticket.subject,
    type: ticket.type,
    status: ticket.status,
    user: {
      name: ticket.user.name,
      initials: getInitials(ticket.user.name),
      year: ticket.user.year,
      dept: ticket.user.dept,
      avatarColor: getAvatarColor(ticket.user.id),
    },
    createdAt: ticket.createdAt,
    messages: [
      {
        id: `${ticket.id}-opening`,
        content: ticket.body,
        senderId: ticket.user.id,
        senderName: ticket.user.name,
        senderRole: 'USER',
        createdAt: ticket.createdAt,
      },
      ...ticket.messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        createdAt: m.createdAt,
      })),
    ],
    unread,
  };
}
