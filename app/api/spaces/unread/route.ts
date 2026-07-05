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
      
      // Default to 24 hours ago if no visit record exists in client
      const lastVisitedAt = lastVisitedParam 
        ? new Date(lastVisitedParam) 
        : new Date(Date.now() - 24 * 60 * 60 * 1000);

      const prismaSpaceType = spaceKey.replace(/-/g, '_').toUpperCase() as SpaceType;

      const count = await prisma.post.count({
        where: {
          collegeId,
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
