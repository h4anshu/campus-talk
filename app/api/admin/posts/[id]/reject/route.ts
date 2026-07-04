import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';

const rejectSchema = z.object({ reason: z.string().trim().max(500).optional() });

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { reason } = rejectSchema.parse(await req.json().catch(() => ({})));

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError('Post not found', 404);

    await prisma.post.update({
      where: { id: params.id },
      data: { status: 'REJECTED', rejectionReason: reason ?? null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
