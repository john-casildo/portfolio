export const LOOK_LIMITS = {yaw: Math.PI / 6, pitch: Math.PI / 12} as const;
export const BLINK_DURATION = 0.12;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Torso Y scale for idle breathing: ±2% over a 3.5s period. */
export function breathScale(t: number): number {
  return 1 + 0.02 * Math.sin((t / 3.5) * Math.PI * 2);
}

/** Seconds until the next blink: 2.5–6s. */
export function nextBlinkDelay(rand: () => number): number {
  return 2.5 + rand() * 3.5;
}

export function blinkScale(sinceStart: number): number {
  return sinceStart >= 0 && sinceStart < BLINK_DURATION ? 0.1 : 1;
}

/** x, y in [-1, 1] with +x right and +y up → head rotation (radians). */
export function lookTarget(x: number, y: number): {yaw: number; pitch: number} {
  return {yaw: clamp(x, -1, 1) * LOOK_LIMITS.yaw, pitch: -clamp(y, -1, 1) * LOOK_LIMITS.pitch};
}

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt);
}
