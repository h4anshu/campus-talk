import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';
import { serializePost, serializeAuthor, POST_INCLUDE } from '@/lib/serializers';
import { TOPICS, SPACES } from '@/lib/constants';
import { looseLimiter, getClientIp, applyRateLimit } from '@/lib/ratelimit';

export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = await applyRateLimit(looseLimiter, getClientIp(req));
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionOrThrow();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';

    // If query is empty, return empty results
    if (!q.trim()) {
      return NextResponse.json({
        posts: [],
        people: [],
        topics: [],
      });
    }

    // 1. Full-text search for posts matching the query
    const searchWords = q.trim().split(/\s+/).filter(Boolean);
    const cleanedTokens = searchWords
      .map((word) => word.replace(/['"&|!():*]/g, ''))
      .filter((token) => token.length > 0);
    const formattedQuery = cleanedTokens.map((token) => `${token}:*`).join(' & ');

    let postsResult: any[] = [];
    if (formattedQuery) {
      // Query post IDs matching the search vector
      const matchingPosts = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Post"
        WHERE ("collegeId" = ${session.user.collegeId} OR "collegeId" IS NULL)
          AND status = 'APPROVED'
          AND "searchVector" @@ to_tsquery('english', ${formattedQuery})
        LIMIT 5
      `;

      if (matchingPosts.length > 0) {
        const postIds = matchingPosts.map((p) => p.id);
        const posts = await prisma.post.findMany({
          where: { id: { in: postIds } },
          include: {
            ...POST_INCLUDE,
            savedBy: { where: { userId: session.user.id }, select: { userId: true } },
            comments: { where: { parentId: null, accepted: true }, select: { id: true }, take: 1 },
          },
        });

        // Preserve matching order (relevance) from queryRaw
        const postMap = new Map(posts.map((p) => [p.id, p]));
        const sortedPosts = matchingPosts
          .map((p) => postMap.get(p.id))
          .filter(Boolean);

        postsResult = sortedPosts.map((p) => serializePost(p as any, session.user.id));
      }
    }

    // 2. Case-insensitive search for users/people matching the query
    const matchingUsers = await prisma.user.findMany({
      where: {
        collegeId: session.user.collegeId,
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      take: 3,
      select: {
        id: true,
        name: true,
        image: true,
        year: true,
        dept: true,
      },
    });

    const peopleResult = matchingUsers.map((u) => serializeAuthor(u));

    // 3. Search local TOPICS and SPACES constants
    const qLower = q.toLowerCase();
    const matchedTopics = TOPICS.filter((t) =>
      t.label.toLowerCase().includes(qLower)
    ).map((t) => ({
      key: t.key,
      label: t.label,
      icon: t.icon,
      type: 'topic' as const,
    }));

    const matchedSpaces = SPACES.filter((s) =>
      s.label.toLowerCase().includes(qLower)
    ).map((s) => ({
      key: s.key,
      label: s.label,
      icon: s.icon,
      type: 'space' as const,
    }));

    const topicsResult = [...matchedTopics, ...matchedSpaces].slice(0, 6);

    return NextResponse.json({
      posts: postsResult,
      people: peopleResult,
      topics: topicsResult,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
