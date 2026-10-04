export const POSES = ['crossed', 'facepalm', 'thinking', 'peace'] as const;
export type Pose = (typeof POSES)[number];

export function nextPose(current: Pose): Pose {
  return POSES[(POSES.indexOf(current) + 1) % POSES.length] ?? POSES[0];
}

type Point = {x: number; y: number};

/** Distance (px) at which the pupil reaches full travel; closer pointers ease the pupil in. */
const FULL_TRAVEL_DISTANCE = 80;

/** Pupil offset (in the eye's own units) that points toward the pointer, clamped to `max`. */
export function pupilOffset(eye: Point, pointer: Point, max: number): Point {
  const dx = pointer.x - eye.x;
  const dy = pointer.y - eye.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return {x: 0, y: 0};
  const travel = max * Math.min(1, dist / FULL_TRAVEL_DISTANCE);
  return {x: (dx / dist) * travel, y: (dy / dist) * travel};
}
