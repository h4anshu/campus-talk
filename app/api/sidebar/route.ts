import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';
import { applyRateLimit, looseLimiter, getClientIp } from '@/lib/ratelimit';

async function getTrending(collegeId: string | null | undefined) {
  const window48h = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const collegeFilter = {
    OR: [
      ...(collegeId ? [{ collegeId }] : []),
      { collegeId: null },
    ],
  };

  const fetchPosts = (since: Date) =>
    prisma.post.findMany({
      where: {
        status: 'APPROVED',
        ...collegeFilter,
        createdAt: { gte: since },
      },
      select: {
        id: true,
        title: true,
        _count: { select: { comments: true, votes: true } },
        votes: { select: { type: true } },
      },
      take: 20,
    });

  let posts = await fetchPosts(window48h);

  if (posts.length < 5) {
    posts = await fetchPosts(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  }

  return posts
    .map((p) => {
      const upvotes = p.votes.filter((v) => v.type === 'UP').length;
      const score = upvotes * 2 + p._count.comments * 1.5;
      return { id: p.id, title: p.title, score, commentCount: p._count.comments, voteCount: upvotes };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export async function GET(req: NextRequest) {
  try {
    const rateLimitRes = await applyRateLimit(looseLimiter, getClientIp(req));
    if (rateLimitRes) return rateLimitRes;

    const session = await getSessionOrThrow();
    const collegeId = session.user.collegeId as string | null | undefined;
    const collegeFilter = {
      OR: [
        ...(collegeId ? [{ collegeId }] : []),
        { collegeId: null },
      ],
    };

    const [trending, events, students, posts, answers] = await Promise.all([
      getTrending(collegeId),
      prisma.post.findMany({
        where: {
          space: 'EVENTS',
          status: 'APPROVED',
          ...collegeFilter,
          eventDate: { gte: new Date() },
        },
        select: { id: true, title: true, eventDate: true, eventLocation: true, eventVenue: true },
        orderBy: { eventDate: 'asc' },
        take: 5,
      }),
      prisma.user.count({ where: { collegeId: collegeId ?? undefined } }),
      prisma.post.count({ where: { status: 'APPROVED', ...collegeFilter } }),
      prisma.comment.count({
        where: { accepted: true, post: { ...collegeFilter } },
      }),
    ]);

    const upcomingEvents = events.map((e) => ({
      id: e.id,
      title: e.title,
      eventDate: e.eventDate!.toISOString(),
      eventLocation: e.eventLocation,
      eventVenue: e.eventVenue,
      daysUntil: Math.ceil((e.eventDate!.getTime() - Date.now()) / 86400000),
    }));

    return NextResponse.json({ trending, upcomingEvents, community: { students, posts, answers } });
  } catch (error) {
    return handleApiError(error);
  }
}
