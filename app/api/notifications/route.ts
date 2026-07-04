import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          actor: { select: { id: true, name: true, image: true } },
          post: { select: { id: true, title: true } },
        },
      }),
      prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Mark all notifications as read
export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();

    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
