export const MAX_TRIANGLES = 2000;

export type Quilt = {
  count: number;
  cols: number;
  rows: number;
  cell: number;
  /** Per-triangle cell center in pixels, origin at viewport center (x right, y up). */
  centers: Float32Array;
  /** Per-triangle rotation in quarter turns (0–3); pairs (i, i+1) are complementary. */
  orient: Float32Array;
  colorIndex: Uint8Array;
  seeds: Float32Array;
};

function grid(width: number, height: number, cell: number) {
  return {cols: Math.ceil(Math.max(0, width) / cell) + 1, rows: Math.ceil(Math.max(0, height) / cell) + 1};
}

export function buildQuilt(width: number, height: number, targetCell: number, rand: () => number, paletteSize: number): Quilt {
  let cell = Math.max(8, targetCell);
  let {cols, rows} = grid(width, height, cell);
  while (cols * rows * 2 > MAX_TRIANGLES) {
    cell *= 1.1;
    ({cols, rows} = grid(width, height, cell));
  }

  const count = cols * rows * 2;
  const centers = new Float32Array(count * 2);
  const orient = new Float32Array(count);
  const colorIndex = new Uint8Array(count);
  const seeds = new Float32Array(count);
  const originX = -((cols - 1) * cell) / 2;
  const originY = -((rows - 1) * cell) / 2;

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const base = Math.floor(rand() * 4);
      for (const offset of [0, 2]) {
        centers[i * 2] = originX + c * cell;
        centers[i * 2 + 1] = originY + r * cell;
        orient[i] = (base + offset) % 4;
        colorIndex[i] = Math.floor(rand() * paletteSize);
        seeds[i] = rand();
        i++;
      }
    }
  }
  return {count, cols, rows, cell, centers, orient, colorIndex, seeds};
}

export function repattern(orient: Float32Array, rand: () => number): Float32Array {
  const next = new Float32Array(orient.length);
  for (let i = 0; i < orient.length; i += 2) {
    const base = Math.floor(rand() * 4);
    next[i] = base;
    next[i + 1] = (base + 2) % 4;
  }
  return next;
}

/**
 * CPU mirror of the vertex shader's eased rotation (in quarter turns, may be fractional or negative),
 * so a new transition can start from where the triangles visibly are instead of snapping.
 */
export function currentOrientation(orient: Float32Array, next: Float32Array, seeds: Float32Array, mix: number): Float32Array {
  const out = new Float32Array(orient.length);
  for (let i = 0; i < orient.length; i++) {
    const local = Math.min(1, Math.max(0, mix * 1.6 - (seeds[i] ?? 0) * 0.6));
    const eased = local * local * (3 - 2 * local);
    let delta = ((((next[i] ?? 0) - (orient[i] ?? 0)) % 4) + 4) % 4;
    if (delta > 2) delta -= 4;
    out[i] = (orient[i] ?? 0) + delta * eased;
  }
  return out;
}

/** The field only needs frames during a re-pattern or shortly after pointer movement (saves battery). */
export function isFieldAnimating(nowSeconds: number, activeUntilSeconds: number, transitioning: boolean): boolean {
  return transitioning || nowSeconds < activeUntilSeconds;
}
