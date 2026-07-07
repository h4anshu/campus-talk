import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';

const PERIOD_DAYS: Record<string, number> = { week: 7, month: 30 };

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') ?? 'alltime';
    const userId = session.user.id;
    const collegeId = session.user.collegeId;

    if (filter === 'alltime') {
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { reputation: true } });
      const rank = await prisma.user.count({
        where: { collegeId, reputation: { gt: me?.reputation ?? 0 } },
      });
      return NextResponse.json({ rank: rank + 1, points: me?.reputation ?? 0 });
    }

    const days = PERIOD_DAYS[filter] ?? PERIOD_DAYS.week;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const myLog = await prisma.reputationLog.aggregate({
      where: { userId, createdAt: { gte: since }, points: { gt: 0 } },
      _sum: { points: true },
    });
    const myPoints = myLog._sum.points ?? 0;

    const higherCount = await prisma.reputationLog.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: since }, points: { gt: 0 }, user: { collegeId } },
      _sum: { points: true },
      having: { points: { _sum: { gt: myPoints } } },
    });

    return NextResponse.json({ rank: higherCount.length + 1, points: myPoints });
  } catch (error) {
    return handleApiError(error);
  }
}
