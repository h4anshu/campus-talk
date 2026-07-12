import { vi } from 'vitest';

// Mock Prisma globally — tests never hit the real DB. This codebase always
// imports `{ prisma }` (a named export from lib/prisma.ts, not a default
// export), so the mock must match that shape exactly or `prisma` would be
// `undefined` in every route under test.
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn() },
    post: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    comment: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    vote: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    report: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    ticket: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    ticketMessage: { findMany: vi.fn(), create: vi.fn() },
    reputationLog: { findFirst: vi.fn(), create: vi.fn() },
    session: { deleteMany: vi.fn(), create: vi.fn() },
    bannedEmail: { findUnique: vi.fn(), create: vi.fn() },
    notification: { create: vi.fn() },
    $transaction: vi.fn((fn) =>
      typeof fn === 'function'
        ? fn({
            // Mirrors the top-level mock above for code that runs inside
            // prisma.$transaction(async (tx) => ...) — mocked separately
            // since `tx` is a distinct client instance, not the outer one.
            reputationLog: { findFirst: vi.fn(), create: vi.fn() },
            user: { update: vi.fn() },
            vote: { findMany: vi.fn() },
            post: { update: vi.fn() },
            report: { updateMany: vi.fn() },
            ticketMessage: { create: vi.fn() },
          })
        : Promise.resolve(fn)
    ),
  },
}));

// Mock NextAuth session
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock the separate cookie-based admin auth system (unrelated to NextAuth —
// see lib/admin-auth.ts's own module comment). Several routes under test
// (tickets reply/list, admin actions) call these directly.
vi.mock('@/lib/admin-auth', () => ({
  isAdminSession: vi.fn().mockResolvedValue(false),
  requireAdmin: vi.fn(),
  getOrCreateAdminOfficeUser: vi.fn().mockResolvedValue({ id: 'admin-office-id', name: 'Admin Office' }),
}));

// Mock notification creation — never actually writes
vi.mock('@/lib/createNotification', () => ({
  createNotification: vi.fn(),
  createNotificationSafe: vi.fn(),
}));

// Mock rate limiter — never hit Redis in tests. `getClientIp` is kept as the
// REAL implementation (pure header parsing, no Redis) since tests/lib/ratelimit.test.ts
// exercises it directly; only the Redis-backed limiters/applyRateLimit are stubbed.
vi.mock('@/lib/ratelimit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/ratelimit')>();
  return {
    ...actual,
    strictLimiter: { limit: vi.fn().mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: Date.now() + 60000 }) },
    standardLimiter: { limit: vi.fn().mockResolvedValue({ success: true, limit: 30, remaining: 29, reset: Date.now() + 60000 }) },
    looseLimiter: { limit: vi.fn().mockResolvedValue({ success: true, limit: 60, remaining: 59, reset: Date.now() + 60000 }) },
    applyRateLimit: vi.fn().mockResolvedValue(null), // null = not rate limited
  };
});

// Mock Sentry — never send events in tests
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  withServerActionInstrumentation: vi.fn((_: unknown, fn: () => unknown) => fn),
}));
