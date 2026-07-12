import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';
import { SpaceType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const collegeId = session.user.collegeId;

    if (!collegeId) {
      return NextResponse.json({});
    }

    const { searchParams } = new URL(req.url);
    const spaces = ['announcements', 'events', 'resources', 'lost-found', 'collaboration', 'confession'];

    const countPromises = spaces.map(async (spaceKey) => {
      const lastVisitedParam = searchParams.get(spaceKey);
      const fallback = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Default to 24 hours ago if no visit record exists in client, or if
      // the client sent a garbage/unparseable date string.
      const parsed = lastVisitedParam ? new Date(lastVisitedParam) : null;
      const lastVisitedAt = parsed && !isNaN(parsed.getTime()) ? parsed : fallback;

      const prismaSpaceType = spaceKey.replace(/-/g, '_').toUpperCase() as SpaceType;

      const count = await prisma.post.count({
        where: {
          // Admin-authored posts (announcements/events) have collegeId: null
          // — platform-wide — matching the main feed's OR-scoping pattern
          // (app/api/posts/route.ts) so those unread counts can ever fire.
          OR: [{ collegeId }, { collegeId: null }],
          status: 'APPROVED',
          space: prismaSpaceType,
          createdAt: {
            gt: lastVisitedAt,
          },
        },
      });

      return { spaceKey, count };
    });

    const results = await Promise.all(countPromises);

    const unreadCounts: Record<string, number> = {};
    results.forEach(({ spaceKey, count }) => {
      unreadCounts[spaceKey] = count;
    });

    return NextResponse.json(unreadCounts);
  } catch (error) {
    return handleApiError(error);
  }
}
