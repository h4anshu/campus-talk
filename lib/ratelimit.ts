import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limiters for different sensitivity levels

// Strict — auth, reports, tickets (5 requests per minute)
export const strictLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: false,
  prefix: 'ct:strict',
});

// Standard — posts, comments, votes (30 per minute)
export const standardLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: false,
  prefix: 'ct:standard',
});

// Loose — reads, search, notifications (60 per minute)
export const looseLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: false,
  prefix: 'ct:loose',
});

// Helper: get the real client IP from Next.js request
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous'
  );
}

// Helper: apply rate limit and return 429 response if exceeded
export async function applyRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<Response | null> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  if (!success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }
  return null; // null means not rate-limited, proceed
}
