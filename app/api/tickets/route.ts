import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';
import { isAdminSession } from '@/lib/admin-auth';
import { createTicketSchema } from '@/lib/validations/ticket';
import { serializeTicket, type TicketForSerialization } from '@/lib/ticket-serializers';

const TICKET_INCLUDE = {
  user: { select: { id: true, name: true, year: true, dept: true } },
  messages: { orderBy: { createdAt: 'asc' as const } },
};

export async function GET() {
  try {
    const admin = await isAdminSession();

    const tickets = admin
      ? await prisma.ticket.findMany({ orderBy: { createdAt: 'desc' }, include: TICKET_INCLUDE })
      : await (async () => {
          const session = await getSessionOrThrow();
          return prisma.ticket.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            include: TICKET_INCLUDE,
          });
        })();

    return NextResponse.json({
      tickets: tickets.map((t) => serializeTicket(t as TicketForSerialization, admin)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only real students can open a ticket — the admin panel has no user
    // account of its own to attribute a ticket to.
    const session = await getSessionOrThrow();
    const data = createTicketSchema.parse(await req.json());

    const ticket = await prisma.ticket.create({
      data: {
        subject: data.subject,
        body: data.body,
        type: data.type,
        userId: session.user.id,
      },
      include: TICKET_INCLUDE,
    });

    return NextResponse.json(
      { ticket: serializeTicket(ticket as TicketForSerialization, false) },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
