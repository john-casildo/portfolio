import * as THREE from 'three';
import {describe, expect, test} from 'vitest';
import {buildHero, countTriangles} from '@/components/hero3d/buildHero';
import {createToonMaterial, TOON_FRAGMENT} from '@/components/hero3d/toonMaterial';

describe('buildHero', () => {
  const hero = buildHero();
  hero.updateMatrixWorld(true);

  test('has 1,500–4,000 non-outline triangles', () => {
    const tris = countTriangles(hero);
    expect(tris).toBeGreaterThanOrEqual(1500);
    expect(tris).toBeLessThanOrEqual(4000);
  });

  test('exposes every animated joint', () => {
    for (const name of ['pivot', 'web', 'body', 'hips', 'torso', 'head', 'armL', 'armR', 'legL', 'legR']) {
      expect(hero.getObjectByName(name), name).toBeDefined();
    }
  });

  test('hangs upside down: head below hips, web above the body', () => {
    const y = (name: string) => hero.getObjectByName(name)!.getWorldPosition(new THREE.Vector3()).y;
    expect(y('head')).toBeLessThan(y('hips'));
    expect(y('pivot')).toBeGreaterThan(y('hips'));
  });
});

describe('toon material', () => {
  test('exposes the comic uniforms and halftone shading', () => {
    const m = createToonMaterial({color: '#111114', webLines: true});
    for (const u of ['uColor', 'uLineColor', 'uInk', 'uLightDir', 'uWebLines', 'uDotSize']) expect(m.uniforms[u], u).toBeDefined();
    expect(m.uniforms.uWebLines!.value).toBe(1);
    expect(TOON_FRAGMENT).toContain('halftone');
  });
});
