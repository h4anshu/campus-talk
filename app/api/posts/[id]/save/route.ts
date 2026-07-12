import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';

interface RouteParams {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionOrThrow();
    const postId = params.id;
    const userId = session.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) throw new ApiError('Post not found', 404);

    const existing = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.savedPost.delete({ where: { userId_postId: { userId, postId } } });
      return NextResponse.json({ isSaved: false });
    }

    try {
      await prisma.savedPost.create({ data: { userId, postId } });
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Already saved by a concurrent request — treat as success, not an error.
        return NextResponse.json({ isSaved: true });
      }
      throw err;
    }
    return NextResponse.json({ isSaved: true });
  } catch (error) {
    return handleApiError(error);
  }
}
