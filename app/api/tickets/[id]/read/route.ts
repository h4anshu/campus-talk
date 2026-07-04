import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession } from '@/lib/admin-auth';

interface RouteParams {
  params: { id: string };
}

/** Marks the other side's messages as read — called when a ticket detail view opens. */
export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const admin = await isAdminSession();
    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!ticket) throw new ApiError('Ticket not found', 404);

    if (admin) {
      await prisma.$transaction([
        prisma.ticket.update({ where: { id: params.id }, data: { openedByAdmin: true } }),
        prisma.ticketMessage.updateMany({
          where: { ticketId: params.id, fromAdmin: false, isRead: false },
          data: { isRead: true },
        }),
      ]);
    } else {
      const session = await getSessionOrThrow();
      if (ticket.userId !== session.user.id) {
        throw new ApiError('You can only read your own tickets', 403);
      }
      await prisma.ticketMessage.updateMany({
        where: { ticketId: params.id, fromAdmin: true, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
