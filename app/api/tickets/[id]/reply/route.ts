import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession, getOrCreateAdminOfficeUser } from '@/lib/admin-auth';
import { replyTicketSchema } from '@/lib/validations/ticket';
import { createNotificationSafe } from '@/lib/createNotification';

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const [isAdmin, session] = await Promise.all([isAdminSession(), auth()]);
    const { body } = replyTicketSchema.parse(await req.json());

    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!ticket) throw new ApiError('Ticket not found', 404);

    // The admin panel's cookie is a single shared-password session, entirely
    // independent of NextAuth — a browser that ever logged into /admin keeps
    // carrying it alongside a student's own session. Ticket ownership must
    // win over that cookie, or a student's own reply gets mislabeled as
    // coming from Admin.
    const isTicketOwner = session?.user?.id === ticket.userId;
    const fromAdmin = isAdmin && !isTicketOwner;

    if (!fromAdmin && !isTicketOwner) {
      throw new ApiError('You can only reply to your own tickets', 403);
    }

    const message = await prisma.ticketMessage.create({
      data: { body, fromAdmin, ticketId: params.id },
    });

    const adminOfficeUser = await getOrCreateAdminOfficeUser();
    const recipientId = fromAdmin ? ticket.userId : adminOfficeUser.id;

    if (fromAdmin) {
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
