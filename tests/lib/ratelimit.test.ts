import { describe, it, expect } from 'vitest';
import { getClientIp } from '@/lib/ratelimit';

describe('getClientIp', () => {
  it('extracts first IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(getClientIp(req)).toBe('9.9.9.9');
  });

  it('falls back to anonymous when no IP headers', () => {
    const req = new Request('http://localhost/');
    expect(getClientIp(req)).toBe('anonymous');
  });
});
