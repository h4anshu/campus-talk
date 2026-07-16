import { NextRequest, NextResponse } from 'next/server';
import type { SpaceType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-helpers';
import { requireAdmin, getOrCreateAdminOfficeUser } from '@/lib/admin-auth';
import { createAdminPostSchema } from '@/lib/validations/admin-post';
import { sanitizeBody } from '@/lib/sanitize';
import { keyToEnum } from '@/lib/constants';
import { serializePost, POST_INCLUDE, type PostForSerialization } from '@/lib/serializers';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = createAdminPostSchema.parse(await req.json());
    const adminOffice = await getOrCreateAdminOfficeUser();

    const post = await prisma.post.create({
      data: {
        title: data.title,
        body: sanitizeBody(data.body),
        type: 'SPACE',
        space: keyToEnum(data.space) as SpaceType,
        priority: data.priority ?? null,
        pinned: data.pinned ?? false,
        status: 'APPROVED',
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        eventLocation: data.eventLocation ?? null,
        authorId: adminOffice.id,
        collegeId: null, // platform-wide — visible regardless of the viewer's college
        tags: {
          connectOrCreate: data.tags.map((name) => ({ where: { name }, create: { name } })),
        },
      },
      include: POST_INCLUDE,
    });

    return NextResponse.json(
      { post: serializePost({ ...post, savedBy: [], comments: [] }, '') },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
