import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { auth } from '@/auth';
import type { Session } from 'next-auth';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Resolves the current session or throws an ApiError(401).
 * (NextAuth v5 is installed, not v4 — `auth()` replaces `getServerSession(authOptions)`
 * and reads the request context automatically inside Route Handlers/Server Components.)
 */
export async function getSessionOrThrow(): Promise<Session & { user: NonNullable<Session['user']> }> {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError('Unauthorized', 401);
  }
  return session as Session & { user: NonNullable<Session['user']> };
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', issues: error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  console.error(error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
