import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession } from '@/lib/admin-auth';
import { replyTicketSchema } from '@/lib/validations/ticket';

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
