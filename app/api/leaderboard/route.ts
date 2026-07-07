import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';

const PERIOD_DAYS: Record<string, number> = { week: 7, month: 30 };

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') ?? 'alltime';

    // College-scoped, not platform-wide — CampusVoice is a single-college
    // forum, and this also naturally excludes the collegeId:null system
    // "Admin Office" account from ever appearing on a student leaderboard.
    const collegeId = session.user.collegeId;

    if (filter === 'alltime') {
      const users = await prisma.user.findMany({
        where: { collegeId },
        orderBy: { reputation: 'desc' },
        take: 50,
        select: { id: true, name: true, image: true, year: true, dept: true, reputation: true },
      });
      return NextResponse.json(users);
    }

    const days = PERIOD_DAYS[filter] ?? PERIOD_DAYS.week;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await prisma.reputationLog.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: since }, points: { gt: 0 }, user: { collegeId } },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 50,
    });

    const users = await prisma.user.findMany({
      where: { id: { in: logs.map((l) => l.userId) } },
      select: { id: true, name: true, image: true, year: true, dept: true, reputation: true },
    });
    const byId = Object.fromEntries(users.map((u) => [u.id, u]));

    return NextResponse.json(
      logs.map((l) => ({ ...byId[l.userId], periodPoints: l._sum.points ?? 0 }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}
