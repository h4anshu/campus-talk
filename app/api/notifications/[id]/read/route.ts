import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';

interface RouteParams {
  params: { id: string };
}

// PATCH — mark single notification as read
export async function PATCH(_: Request, { params }: RouteParams) {
  try {
    const session = await getSessionOrThrow();
    await prisma.notification.updateMany({
      where: { id: params.id, userId: session.user.id },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
