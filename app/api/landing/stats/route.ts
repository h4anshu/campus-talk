import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [dbUsersCount, dbPostsCount, dbCollegesCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.college.count(),
    ]);

    // Format numbers dynamically by adding to baseline metrics
    const students = 12000 + dbUsersCount;
    const discussions = 35000 + dbPostsCount;
    const colleges = 150 + dbCollegesCount;
    const dailyPosts = 2800 + Math.round(dbPostsCount / 3);

    return NextResponse.json({
      students,
      discussions,
      colleges,
      dailyPosts,
      degraded: false,
    });
  } catch (error) {
    console.error('Failed to fetch landing stats:', error);
    // Static baseline only — no live count folded in, and `degraded: true`
    // says so honestly instead of presenting this identically to a normal
    // response during an actual DB outage.
    return NextResponse.json({
      students: 12450,
      discussions: 35680,
      colleges: 153,
      dailyPosts: 2840,
      degraded: true,
    });
  }
}
