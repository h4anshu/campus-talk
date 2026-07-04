import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { updatePostSchema } from '@/lib/validations/post';
import { sanitizeBody } from '@/lib/sanitize';
import {
  serializePost,
  buildCommentTree,
  type PostForSerialization,
  type CommentForSerialization,
} from '@/lib/serializers';

const POST_INCLUDE = {
  author: { select: { id: true, name: true, image: true, year: true, dept: true } },
  tags: true,
  votes: { select: { type: true, userId: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionOrThrow();

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        ...POST_INCLUDE,
        savedBy: { where: { userId: session.user.id }, select: { userId: true } },
        comments: { where: { parentId: null, accepted: true }, select: { id: true }, take: 1 },
      },
    });

    if (!post) {
      throw new ApiError('Post not found', 404);
    }

    const flatComments = await prisma.comment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, image: true, year: true, dept: true } },
        votes: { select: { type: true, userId: true } },
      },
    });

    const comments = buildCommentTree(flatComments as CommentForSerialization[], session.user.id);

    return NextResponse.json({
      post: serializePost(post as PostForSerialization, session.user.id),
      comments,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionOrThrow();
    const json = await req.json();
    const data = updatePostSchema.parse(json);

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError('Post not found', 404);
    if (existing.authorId !== session.user.id) {
      throw new ApiError('You can only edit your own posts', 403);
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.body !== undefined && { body: sanitizeBody(data.body) }),
        ...(data.tags !== undefined && {
          tags: {
            set: [],
            connectOrCreate: data.tags.map((name) => ({ where: { name }, create: { name } })),
          },
        }),
      },
      include: {
        ...POST_INCLUDE,
        savedBy: { where: { userId: session.user.id }, select: { userId: true } },
        comments: { where: { parentId: null, accepted: true }, select: { id: true }, take: 1 },
      },
    });

    return NextResponse.json({ post: serializePost(post as PostForSerialization, session.user.id) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionOrThrow();

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError('Post not found', 404);
    if (existing.authorId !== session.user.id) {
      throw new ApiError('You can only delete your own posts', 403);
    }

    await prisma.post.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
