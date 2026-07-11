import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession } from '@/lib/admin-auth';

interface RouteParams {
  params: { id: string };
}

/** Marks the other side's messages as read — called when a ticket detail view opens. */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const [isAdmin, session] = await Promise.all([isAdminSession(), auth()]);
    const { searchParams } = new URL(req.url);
    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!ticket) throw new ApiError('Ticket not found', 404);

    // Admin intent must be explicit (`?as=admin`), not inferred from ticket
    // ownership — same reason as the reply route: a browser holding both the
    // admin cookie and a NextAuth student session must not have the
    // student's own ticket silently treated as a "student" read just
    // because the two sessions happen to coexist.
    const isTicketOwner = session?.user?.id === ticket.userId;
    const actingAsAdmin = isAdmin && (searchParams.get('as') === 'admin' || !session?.user?.id);

    if (actingAsAdmin) {
      await prisma.$transaction([
        prisma.ticket.update({ where: { id: params.id }, data: { openedByAdmin: true } }),
        prisma.ticketMessage.updateMany({
          where: { ticketId: params.id, senderRole: 'USER', isRead: false },
          data: { isRead: true },
        }),
      ]);
    } else if (isTicketOwner) {
      await prisma.ticketMessage.updateMany({
        where: { ticketId: params.id, senderRole: 'ADMIN', isRead: false },
        data: { isRead: true },
      });
    } else {
      throw new ApiError('You can only read your own tickets', 403);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
