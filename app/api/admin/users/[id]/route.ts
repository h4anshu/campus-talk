import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteUserSchema } from '@/lib/validations/admin-user';

interface RouteParams {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const data = deleteUserSchema.parse(await req.json().catch(() => ({})));

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, role: true },
    });
    if (!existing) throw new ApiError('User not found', 404);
    if (existing.role === 'ADMIN') throw new ApiError('Cannot delete an admin account', 403);

    await prisma.$transaction(async (tx) => {
      if (data.blockEmail) {
        await tx.bannedEmail.upsert({
          where: { email: existing.email },
          update: { reason: data.reason ?? null },
          create: {
            email: existing.email,
            reason: data.reason ?? null,
            bannedBy: 'admin',
          },
        });
      }

      // Posts/comments/votes/sessions all cascade via onDelete: Cascade.
      await tx.user.delete({ where: { id: params.id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
