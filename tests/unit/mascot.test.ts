import * as THREE from 'three';
import {describe, expect, test} from 'vitest';
import {buildMascot, countTriangles} from '@/components/three/buildMascot';
import {SNAP_LINE, withVertexSnap} from '@/components/three/ps1';

describe('buildMascot', () => {
  const mascot = buildMascot();

  test('has 300–600 non-outline triangles', () => {
    const tris = countTriangles(mascot);
    expect(tris).toBeGreaterThanOrEqual(300);
    expect(tris).toBeLessThanOrEqual(600);
  });

  test('exposes animated parts by name', () => {
    for (const name of ['head', 'torso', 'eyeL', 'eyeR']) expect(mascot.getObjectByName(name), name).toBeDefined();
  });

  test('every visible part has an ink outline except small face details', () => {
    const outlined = ['skull', 'torso', 'armL', 'armR', 'legL', 'legR'];
    for (const name of outlined) {
      const part = mascot.getObjectByName(name);
      expect(part?.children.some((c) => c.userData.outline === true), name).toBe(true);
    }
  });
});

describe('withVertexSnap', () => {
  test('injects the snap uniform and line after projection', () => {
    const material = withVertexSnap(new THREE.MeshBasicMaterial());
    const shader = {uniforms: {} as Record<string, THREE.IUniform>, vertexShader: 'void main() {\n#include <project_vertex>\n}', fragmentShader: ''};
    material.onBeforeCompile(shader as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer);
    expect(shader.uniforms.uSnap).toBeDefined();
    expect(shader.vertexShader.startsWith('uniform vec2 uSnap;')).toBe(true);
    expect(shader.vertexShader.indexOf(SNAP_LINE)).toBeGreaterThan(shader.vertexShader.indexOf('#include <project_vertex>'));
  });
});
