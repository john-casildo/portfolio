const deg = (d: number) => (d * Math.PI) / 180;
const clamp = (v: number, min = -1, max = 1) => Math.min(max, Math.max(min, v));

export const SWAY = {amplitude: deg(6), period: 3.2} as const;
export const TWIST = {amplitude: deg(20), period: 7} as const;
export const LOOK = {yaw: deg(25), pitch: deg(12)} as const;
export const DROP = {height: 1.2, omega: 10, zeta: 0.35, settle: 1.6} as const;

/** Pendulum angle around the web's top anchor (radians). */
export function sway(t: number): number {
  return SWAY.amplitude * Math.sin((2 * Math.PI * t) / SWAY.period);
}

/** Slow spin around the web axis (radians). */
export function twist(t: number): number {
  return TWIST.amplitude * Math.sin((2 * Math.PI * t) / TWIST.period);
}

/**
 * Pointer (x right, y up, in [-1, 1]) → head rotation in the body's local frame.
 * The body hangs upside down (rotated π around z), so both axes are mirrored.
 */
export function headLook(x: number, y: number): {yaw: number; pitch: number} {
  return {yaw: -clamp(x) * LOOK.yaw, pitch: clamp(y) * LOOK.pitch};
}

/** Under-damped spring: height above rest while dropping in on the web (0 once settled). */
export function dropOffset(t: number): number {
  if (t <= 0) return DROP.height;
  if (t >= DROP.settle) return 0;
  const omegaD = DROP.omega * Math.sqrt(1 - DROP.zeta * DROP.zeta);
  return DROP.height * Math.exp(-DROP.zeta * DROP.omega * t) * Math.cos(omegaD * t);
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt);
}
