import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionOrThrow();
    const commentId = params.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: { select: { id: true, authorId: true } } },
    });
    if (!comment) throw new ApiError('Comment not found', 404);
    if (comment.parentId !== null) {
      throw new ApiError('Only a top-level answer can be accepted', 400);
    }
    if (comment.post.authorId !== session.user.id) {
      throw new ApiError('Only the post author can accept an answer', 403);
    }

    await prisma.$transaction([
      prisma.comment.updateMany({
        where: { postId: comment.post.id, accepted: true },
        data: { accepted: false },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { accepted: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
