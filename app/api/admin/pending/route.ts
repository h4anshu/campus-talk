import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { serializePost, POST_INCLUDE, type PostForSerialization } from '@/lib/serializers';

// The admin panel is a single shared password with no admin User row and no
// college of its own (see lib/admin-auth.ts) — so unlike the student-facing
// GET /api/posts, there's no `session.user.collegeId` to scope by. This
// returns every PENDING post across all colleges. Flagged in PROGRESS.md.
export async function GET() {
  try {
    await requireAdmin();

    const posts = await prisma.post.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        ...POST_INCLUDE,
        comments: { where: { parentId: null, accepted: true }, select: { id: true }, take: 1 },
      },
    });

    const serialized = posts.map((p) => serializePost(p as PostForSerialization, ''));

    return NextResponse.json({ posts: serialized });
  } catch (error) {
    return handleApiError(error);
  }
}
