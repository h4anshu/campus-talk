import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession, getOrCreateAdminOfficeUser } from '@/lib/admin-auth';
import { replyTicketSchema } from '@/lib/validations/ticket';
import { createNotificationSafe } from '@/lib/createNotification';

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await isAdminSession();
    const { body } = replyTicketSchema.parse(await req.json());

    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!ticket) throw new ApiError('Ticket not found', 404);

    if (!admin) {
      const session = await getSessionOrThrow();
      if (ticket.userId !== session.user.id) {
        throw new ApiError('You can only reply to your own tickets', 403);
      }
    }

    const message = await prisma.ticketMessage.create({
      data: { body, fromAdmin: admin, ticketId: params.id },
    });

    const adminOfficeUser = await getOrCreateAdminOfficeUser();
    const recipientId = admin ? ticket.userId : adminOfficeUser.id;

    if (admin) {
      await createNotificationSafe({
        userId: ticket.userId,
        type: 'TICKET_REPLY',
        title: 'Admin replied to your ticket',
        body: `Re: "${ticket.subject.slice(0, 60)}"`,
        linkUrl: `/tickets`,
        refId: ticket.id,
      });
    } else {
      await createNotificationSafe({
        userId: recipientId,
        type: 'TICKET_REPLY',
        title: 'New reply to ticket',
        body: `Re: "${ticket.subject.slice(0, 60)}"`,
        linkUrl: `/admin/tickets`,
        refId: ticket.id,
      });
    }

    return NextResponse.json(
      {
        message: {
          id: message.id,
          body: message.body,
          fromAdmin: message.fromAdmin,
          createdAt: message.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
