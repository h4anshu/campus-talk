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
// opening message from `ticket.body` so both sides stay compatible.
export function serializeTicket(ticket: TicketForSerialization): MockTicket {
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
      { id: `${ticket.id}-opening`, body: ticket.body, fromAdmin: false, createdAt: ticket.createdAt },
      ...ticket.messages.map((m) => ({
        id: m.id,
        body: m.body,
        fromAdmin: m.fromAdmin,
        createdAt: m.createdAt,
      })),
    ],
  };
}
