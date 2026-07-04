import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError('Post not found', 404);

    await prisma.post.update({
      where: { id: params.id },
      data: { status: 'APPROVED', rejectionReason: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
