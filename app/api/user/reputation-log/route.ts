import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';

// Scoped to the caller's own session rather than a `[username]` route param —
// there is no real `username` column on User (see the profile page's own
// note on this), and this log is only ever shown on the viewer's own
// profile, so "the current session's user" is the only identity this
// endpoint ever needs.
export async function GET() {
  try {
    const session = await getSessionOrThrow();

    const logs = await prisma.reputationLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    return handleApiError(error);
  }
}
