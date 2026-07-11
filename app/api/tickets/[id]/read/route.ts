import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession } from '@/lib/admin-auth';

interface RouteParams {
  params: { id: string };
}

/** Marks the other side's messages as read — called when a ticket detail view opens. */
export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const [isAdmin, session] = await Promise.all([isAdminSession(), auth()]);
    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!ticket) throw new ApiError('Ticket not found', 404);

    // Ticket ownership wins over the admin cookie for the same reason as the
    // reply route: a browser holding both sessions must still be treated as
    // the student when it's their own ticket.
    const isTicketOwner = session?.user?.id === ticket.userId;

    if (isAdmin && !isTicketOwner) {
      await prisma.$transaction([
        prisma.ticket.update({ where: { id: params.id }, data: { openedByAdmin: true } }),
        prisma.ticketMessage.updateMany({
          where: { ticketId: params.id, fromAdmin: false, isRead: false },
          data: { isRead: true },
        }),
      ]);
    } else if (isTicketOwner) {
      await prisma.ticketMessage.updateMany({
        where: { ticketId: params.id, fromAdmin: true, isRead: false },
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
