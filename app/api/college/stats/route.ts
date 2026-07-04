import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const collegeId = session.user.collegeId;

    if (!collegeId) {
      return NextResponse.json({
        students: 0,
        online: 0,
        posts: 0,
        answers: 0,
      });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [students, online, posts, answers] = await Promise.all([
      // 1. Students count (Users where collegeId matches)
      prisma.user.count({
        where: { collegeId },
      }),

      // 2. Online count (lastActiveAt in last 5 minutes)
      prisma.user.count({
        where: {
          collegeId,
          lastActiveAt: { gte: fiveMinutesAgo },
        },
      }),

      // 3. Posts count (APPROVED and college-scoped)
      prisma.post.count({
        where: {
          collegeId,
          status: 'APPROVED',
        },
      }),

      // 4. Answers count (Comments, college-scoped)
      prisma.comment.count({
        where: { collegeId },
      }),
    ]);

    return NextResponse.json({
      students,
      online,
      posts,
      answers,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
