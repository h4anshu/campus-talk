import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession } from '@/lib/admin-auth';
import { createTicketSchema } from '@/lib/validations/ticket';
import { serializeTicket, type TicketForSerialization } from '@/lib/ticket-serializers';

const TICKET_INCLUDE = {
  user: { select: { id: true, name: true, year: true, dept: true } },
  messages: { orderBy: { createdAt: 'asc' as const } },
};

export async function GET(req: NextRequest) {
  try {
    const [isAdmin, session] = await Promise.all([isAdminSession(), auth()]);
    // Admin intent must be explicit, not inferred from session state: a
    // browser holding both the admin_session cookie and a NextAuth student
    // session (the common case when testing both sides) is ambiguous on
    // its own. The admin UI declares itself via `?as=admin`; without a
    // student session there's nothing to be ambiguous with, so a bare
    // admin cookie still defaults to admin (unchanged from before).
    const { searchParams } = new URL(req.url);
    const viewerIsAdmin = isAdmin && (!session?.user?.id || searchParams.get('as') === 'admin');

    const tickets = viewerIsAdmin
      ? await prisma.ticket.findMany({ orderBy: { createdAt: 'desc' }, include: TICKET_INCLUDE })
      : await (async () => {
          if (!session?.user?.id) throw new ApiError('Unauthorized', 401);
          return prisma.ticket.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            include: TICKET_INCLUDE,
          });
        })();

    return NextResponse.json({
      tickets: tickets.map((t) => serializeTicket(t as TicketForSerialization, viewerIsAdmin)),
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
