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
    const { searchParams } = new URL(req.url);
    const { content } = replyTicketSchema.parse(await req.json());

    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!ticket) throw new ApiError('Ticket not found', 404);

    // The admin panel's cookie is a single shared-password session, entirely
    // independent of NextAuth — a browser that ever logged into /admin keeps
    // carrying it alongside a student's own session (the common case when
    // testing both sides). Admin intent must be explicit (`?as=admin`, sent
    // by the admin UI), never inferred from ticket ownership — inferring it
    // meant an admin replying to their OWN ticket (as a student, elsewhere)
    // silently got attributed to the student instead. Ownership is still
    // checked separately below, purely to authorize a non-admin request.
    const isTicketOwner = session?.user?.id === ticket.userId;
    const sendingAsAdmin = isAdmin && (searchParams.get('as') === 'admin' || !session?.user?.id);

    if (!sendingAsAdmin && !isTicketOwner) {
      throw new ApiError('You can only reply to your own tickets', 403);
    }

    // Sender identity is resolved once, here, and stored on the row — every
    // other read of this message (thread view, ticket list preview, unread
    // counts) trusts senderRole alone, never re-deriving who sent it from
    // session state or message position. Admin has no individual NextAuth
    // identity (shared-password cookie), so it's a fixed sentinel.
    const senderId = sendingAsAdmin ? 'admin' : session!.user.id;
    const senderName = sendingAsAdmin ? 'Admin' : (session!.user.name ?? 'Student');

    const dataToCreate = {
      content,
      ticketId: params.id,
      senderId,
      senderName,
      senderRole: sendingAsAdmin ? ('ADMIN' as const) : ('USER' as const),
    };

    const message = await prisma.ticketMessage.create({ data: dataToCreate });

    if (sendingAsAdmin) {
      await createNotificationSafe({
        userId: ticket.userId,
        type: 'TICKET_REPLY',
        title: 'Admin replied to your ticket',
        body: `Re: "${ticket.subject.slice(0, 60)}"`,
        linkUrl: `/tickets`,
        refId: ticket.id,
      });
    } else {
      // Notification.userId is a real FK, so the recipient still needs an
      // actual User row — that's orthogonal to the message's senderId sentinel.
      const recipientId = (await getOrCreateAdminOfficeUser()).id;
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
          content: message.content,
          senderId: message.senderId,
          senderName: message.senderName,
          senderRole: message.senderRole,
          createdAt: message.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
