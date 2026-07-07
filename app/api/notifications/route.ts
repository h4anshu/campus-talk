import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';

// GET — fetch notifications for current user
export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}
