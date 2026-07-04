import { NextRequest, NextResponse } from 'next/server';
import type { Prisma, TopicType, SpaceType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';
import { createPostSchema } from '@/lib/validations/post';
import { sanitizeBody } from '@/lib/sanitize';
import { keyToEnum } from '@/lib/constants';
import { serializePost, POST_INCLUDE, type PostForSerialization } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const { searchParams } = new URL(req.url);
    const topicKey = searchParams.get('topic');
    const spaceKey = searchParams.get('space');
    const sort = searchParams.get('sort') ?? 'Hot';
    const savedOnly = searchParams.get('saved') === 'true';

    const where: Prisma.PostWhereInput = {
      status: 'APPROVED',
      collegeId: session.user.collegeId,
    };
    if (topicKey) {
      where.type = 'DISCUSSION';
      where.topic = keyToEnum(topicKey) as TopicType;
    }
    if (spaceKey) {
      where.type = 'SPACE';
      where.space = keyToEnum(spaceKey) as SpaceType;
    }
    if (savedOnly) {
      where.savedBy = { some: { userId: session.user.id } };
    }

    const orderBy: Prisma.PostOrderByWithRelationInput =
      sort === 'Rising' ? { comments: { _count: 'desc' } } : { createdAt: 'desc' };

    const posts = await prisma.post.findMany({
      where,
      orderBy,
      take: 100,
      include: {
        ...POST_INCLUDE,
        savedBy: { where: { userId: session.user.id }, select: { userId: true } },
        comments: { where: { parentId: null, accepted: true }, select: { id: true }, take: 1 },
      },
    });

    let serialized = posts.map((p) => serializePost(p as PostForSerialization, session.user.id));

    if (sort === 'Top') {
      serialized = serialized.sort((a, b) => b.voteCount - a.voteCount);
    } else if (sort === 'Hot') {
      serialized = serialized.sort(
        (a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || b.voteCount - a.voteCount
      );
    }

    return NextResponse.json({ posts: serialized });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const json = await req.json();
    const data = createPostSchema.parse(json);

    const sanitizedBody = sanitizeBody(data.body);
    const isAdmin = session.user.role === 'ADMIN';
    const status = data.type === 'DISCUSSION' || isAdmin ? 'APPROVED' : 'PENDING';

    const post = await prisma.post.create({
      data: {
        title: data.title,
        body: sanitizedBody,
        type: data.type,
        topic: data.type === 'DISCUSSION' ? (keyToEnum(data.topic!) as TopicType) : null,
        space: data.type === 'SPACE' ? (keyToEnum(data.space!) as SpaceType) : null,
        anonymous: data.anonymous ?? false,
        status,
        authorId: session.user.id,
        collegeId: session.user.collegeId,
        tags: {
          connectOrCreate: data.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: POST_INCLUDE,
    });

    return NextResponse.json(
      { post: serializePost({ ...post, savedBy: [], comments: [] }, session.user.id) },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
