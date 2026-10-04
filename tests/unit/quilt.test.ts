import {describe, expect, test} from 'vitest';
import {buildQuilt, MAX_TRIANGLES, repattern} from '@/lib/quilt';
import {mulberry32} from '@/lib/random';

describe('mulberry32', () => {
  test('is deterministic and in [0,1)', () => {
    const a = mulberry32(7), b = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('buildQuilt', () => {
  test('covers the viewport with complementary pairs', () => {
    const q = buildQuilt(1440, 900, 64, mulberry32(1), 9);
    expect(q.cols * q.cell).toBeGreaterThanOrEqual(1440);
    expect(q.rows * q.cell).toBeGreaterThanOrEqual(900);
    expect(q.count).toBe(q.cols * q.rows * 2);
    for (let i = 0; i < q.count; i += 2) expect((q.orient[i]! + 2) % 4).toBe(q.orient[i + 1]);
    expect(Math.max(...q.colorIndex)).toBeLessThan(9);
  });

  test('caps triangle count on huge screens by growing cells', () => {
    const q = buildQuilt(3840, 2160, 24, mulberry32(1), 9);
    expect(q.count).toBeLessThanOrEqual(MAX_TRIANGLES);
    expect(q.cols * q.cell).toBeGreaterThanOrEqual(3840);
  });

  test('handles zero-size viewports', () => {
    const q = buildQuilt(0, 0, 64, mulberry32(1), 9);
    expect(q.count).toBeGreaterThan(0);
  });
});

describe('repattern', () => {
  test('keeps pairs complementary', () => {
    const q = buildQuilt(800, 600, 64, mulberry32(3), 9);
    const next = repattern(q.orient, mulberry32(4));
    expect(next.length).toBe(q.orient.length);
    for (let i = 0; i < next.length; i += 2) expect((next[i]! + 2) % 4).toBe(next[i + 1]);
  });
});
