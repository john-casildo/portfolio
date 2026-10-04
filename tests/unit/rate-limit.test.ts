import {expect, test} from 'vitest';
import {createRateLimiter} from '@/lib/rate-limit';

test('allows `limit` hits per window per key, then blocks, then recovers', () => {
  let now = 0;
  const limiter = createRateLimiter({limit: 5, windowMs: 600_000, now: () => now});
  for (let i = 0; i < 5; i++) expect(limiter.check('a')).toBe(true);
  expect(limiter.check('a')).toBe(false);
  expect(limiter.check('b')).toBe(true);
  now = 600_001;
  expect(limiter.check('a')).toBe(true);
});
