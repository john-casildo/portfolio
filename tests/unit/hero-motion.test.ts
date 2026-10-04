import {describe, expect, test} from 'vitest';
import {damp, DROP, dropOffset, headLook, LOOK, sway, SWAY, twist, TWIST} from '@/lib/hero-motion';

describe('hero motion', () => {
  test('sway and twist stay within their amplitudes', () => {
    for (let t = 0; t < 20; t += 0.05) {
      expect(Math.abs(sway(t))).toBeLessThanOrEqual(SWAY.amplitude + 1e-9);
      expect(Math.abs(twist(t))).toBeLessThanOrEqual(TWIST.amplitude + 1e-9);
    }
  });

  test('head look is clamped and mirrored for the upside-down body', () => {
    expect(headLook(5, 0).yaw).toBeCloseTo(-LOOK.yaw);
    expect(headLook(-5, 0).yaw).toBeCloseTo(LOOK.yaw);
    expect(headLook(0, 1).pitch).toBeCloseTo(LOOK.pitch);
    expect(headLook(0, -9).pitch).toBeCloseTo(-LOOK.pitch);
  });

  test('drop-in starts high, overshoots below rest, and settles', () => {
    expect(dropOffset(0)).toBeCloseTo(DROP.height);
    let min = Infinity;
    for (let t = 0; t <= 1; t += 0.01) min = Math.min(min, dropOffset(t));
    expect(min).toBeLessThan(-0.1);
    expect(Math.abs(dropOffset(1.2))).toBeLessThan(0.03);
    expect(dropOffset(5)).toBe(0);
  });

  test('damp approaches the target without overshoot', () => {
    const v = damp(0, 1, 6, 1 / 60);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
  });
});
