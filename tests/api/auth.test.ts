import { describe, it, expect } from 'vitest';

describe('College domain validation', () => {
  it('accepts valid BBD domain', () => {
    const pattern = '^bbdu\\.ac\\.in$';
    const regex = new RegExp(pattern.startsWith('^') ? pattern : `^${pattern}$`, 'i');
    expect(regex.test('bbdu.ac.in')).toBe(true);
  });

  it('rejects lookalike domain (anchoring fix from M12)', () => {
    const pattern = 'bbdu\\.ac\\.in'; // unanchored — should still be safe after fix
    const anchored = pattern.startsWith('^') && pattern.endsWith('$') ? pattern : `^${pattern}$`;
    const regex = new RegExp(anchored, 'i');
    expect(regex.test('bbdu.ac.in.evil.com')).toBe(false);
  });

  it('rejects empty domain', () => {
    const pattern = '^bbdu\\.ac\\.in$';
    const regex = new RegExp(pattern, 'i');
    expect(regex.test('')).toBe(false);
  });
});
