import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { ticketStatusSchema } from '@/lib/validations/ticket';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { status } = ticketStatusSchema.parse(await req.json());

    const existing = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError('Ticket not found', 404);

    await prisma.ticket.update({ where: { id: params.id }, data: { status } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
