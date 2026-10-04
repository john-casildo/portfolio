import {describe, expect, test} from 'vitest';
import {BLINK_DURATION, blinkScale, breathScale, damp, LOOK_LIMITS, lookTarget, nextBlinkDelay} from '@/lib/mascot-motion';

describe('mascot motion', () => {
  test('breathing stays within ±2%', () => {
    for (let t = 0; t < 10; t += 0.1) {
      expect(breathScale(t)).toBeGreaterThanOrEqual(0.98);
      expect(breathScale(t)).toBeLessThanOrEqual(1.02);
    }
  });

  test('blink delay is 2.5–6s', () => {
    expect(nextBlinkDelay(() => 0)).toBe(2.5);
    expect(nextBlinkDelay(() => 0.999999)).toBeCloseTo(6, 3);
  });

  test('eyes close only during the blink', () => {
    expect(blinkScale(-1)).toBe(1);
    expect(blinkScale(0.05)).toBe(0.1);
    expect(blinkScale(BLINK_DURATION + 0.01)).toBe(1);
  });

  test('look target is clamped and signed correctly', () => {
    expect(lookTarget(5, 0).yaw).toBeCloseTo(LOOK_LIMITS.yaw);
    expect(lookTarget(-5, 0).yaw).toBeCloseTo(-LOOK_LIMITS.yaw);
    expect(lookTarget(0, 1).pitch).toBeCloseTo(-LOOK_LIMITS.pitch);
    expect(lookTarget(0, -1).pitch).toBeCloseTo(LOOK_LIMITS.pitch);
  });

  test('damp moves toward target without overshoot', () => {
    const v = damp(0, 1, 6, 1 / 60);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
    expect(damp(0, 1, 6, 10)).toBeCloseTo(1, 5);
  });
});
