import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { createCommentSchema } from '@/lib/validations/comment';
import { sanitizePlainText } from '@/lib/sanitize';
import { serializeAuthor } from '@/lib/serializers';
import type { MockComment } from '@/lib/mock/comments';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const data = createCommentSchema.parse(await req.json());

    const post = await prisma.post.findUnique({ where: { id: data.postId }, select: { id: true } });
    if (!post) throw new ApiError('Post not found', 404);

    if (data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { id: true, postId: true },
      });
      if (!parent || parent.postId !== data.postId) {
        throw new ApiError('Parent comment not found on this post', 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        body: sanitizePlainText(data.body),
        postId: data.postId,
        parentId: data.parentId ?? null,
        authorId: session.user.id,
        collegeId: session.user.collegeId,
      },
      include: {
        author: { select: { id: true, name: true, image: true, year: true, dept: true } },
      },
    });

    // Create notifications for comments/replies
    try {
      if (data.parentId) {
        const parent = await prisma.comment.findUnique({
          where: { id: data.parentId },
          select: { authorId: true },
        });
        if (parent && parent.authorId !== session.user.id) {
          await prisma.notification.create({
            data: {
              userId: parent.authorId,
              actorId: session.user.id,
              type: 'REPLY',
              postId: data.postId,
            },
          });
        }
      } else {
        const postDetail = await prisma.post.findUnique({
          where: { id: data.postId },
          select: { authorId: true },
        });
        if (postDetail && postDetail.authorId !== session.user.id) {
          await prisma.notification.create({
            data: {
              userId: postDetail.authorId,
              actorId: session.user.id,
              type: 'COMMENT',
              postId: data.postId,
            },
          });
        }
      }
    } catch (err) {
      console.error('Notification creation failed:', err);
    }

    const serialized: MockComment = {
      id: comment.id,
      body: comment.body,
      author: serializeAuthor(comment.author),
      voteCount: 0,
      createdAt: comment.createdAt,
      parentId: comment.parentId,
      accepted: comment.accepted,
      userVote: null,
      replies: [],
    };

    return NextResponse.json({ comment: serialized }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
