import * as THREE from 'three';

export const SNAP_LINE = 'gl_Position.xy = floor(gl_Position.xy / gl_Position.w * uSnap) / uSnap * gl_Position.w;';

/** PS1-style vertex wobble: snaps projected vertices to a coarse screen grid. */
export function withVertexSnap<T extends THREE.Material>(material: T, snap: THREE.Vector2 = new THREE.Vector2(160, 120)): T {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSnap = {value: snap};
    shader.vertexShader = `uniform vec2 uSnap;\n${shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>\n${SNAP_LINE}`,
    )}`;
  };
  material.customProgramCacheKey = () => 'ps1-snap';
  return material;
}
