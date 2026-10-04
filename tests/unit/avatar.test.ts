import {describe, expect, test} from 'vitest';
import {nextPose, POSES, pupilOffset, type Pose} from '@/lib/avatar';

describe('pupilOffset', () => {
  const eye = {x: 100, y: 100};
  test('looks toward the pointer, clamped to the max travel', () => {
    const right = pupilOffset(eye, {x: 900, y: 100}, 5);
    expect(right.x).toBeCloseTo(5);
    expect(right.y).toBeCloseTo(0);
    const upLeft = pupilOffset(eye, {x: 0, y: 0}, 5);
    expect(upLeft.x).toBeLessThan(0);
    expect(upLeft.y).toBeLessThan(0);
    expect(Math.hypot(upLeft.x, upLeft.y)).toBeCloseTo(5);
  });
  test('eases in near the eye instead of snapping to the edge', () => {
    const near = pupilOffset(eye, {x: 110, y: 100}, 5);
    expect(near.x).toBeGreaterThan(0);
    expect(near.x).toBeLessThan(5);
  });
  test('centers when the pointer is on the eye', () => {
    expect(pupilOffset(eye, eye, 5)).toEqual({x: 0, y: 0});
  });
});

describe('poses', () => {
  test('cycles through every pose and wraps', () => {
    expect(POSES).toEqual(['crossed', 'facepalm', 'thinking', 'peace']);
    let p: Pose = POSES[0];
    const seen: Pose[] = [p];
    for (let i = 0; i < POSES.length; i++) {
      p = nextPose(p);
      seen.push(p);
    }
    expect(seen).toEqual(['crossed', 'facepalm', 'thinking', 'peace', 'crossed']);
  });
});
