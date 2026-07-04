import crypto from 'crypto';
import { cookies } from 'next/headers';
import { ApiError } from '@/lib/api-helpers';

// Admin panel auth is a single shared password, completely decoupled from
// student Google OAuth/NextAuth — there is no admin User row, no email, no
// college. The cookie just proves "someone who knows the admin password
// signed in before it expired," signed with its own secret so it can't be
// forged even if NEXTAUTH_SECRET ever leaked.
export const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  return secret;
}

function hmac(value: string): string {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function signAdminSession(): string {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  return `${expiresAt}.${hmac(expiresAt)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature) return false;
  if (Date.now() > Number(expiresAt)) return false;

  const expected = hmac(expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Server Components / Route Handlers only (reads the cookie jar). */
export async function isAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

/** For Route Handlers that are admin-only end to end. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) {
    throw new ApiError('Admin authentication required', 401);
  }
}
