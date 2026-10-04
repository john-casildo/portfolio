let cached: boolean | undefined;

/** three.js (r163+) needs WebGL2; probe once and release the throwaway context immediately. */
export function hasWebGL(): boolean {
  if (cached !== undefined) return cached;
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    cached = gl !== null;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}
