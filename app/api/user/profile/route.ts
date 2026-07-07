import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';

const updateProfileSchema = z.object({
  bio: z.string().max(500).optional().nullable(),
  year: z.number().int().min(1).max(4).optional().nullable(),
  dept: z.string().max(50).optional().nullable(),
  image: z.string().url().optional().nullable(),
  banner: z.string().url().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const json = await req.json();
    const data = updateProfileSchema.parse(json);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio: data.bio,
        year: data.year,
        dept: data.dept,
        image: data.image,
        banner: data.banner,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
