import * as THREE from 'three';
import {describe, expect, test} from 'vitest';
import {buildHero, countTriangles, restPose, setDotScale} from '@/components/hero3d/buildHero';
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

describe('review fixes', () => {
  test('toon shader converts to the output color space and has a sheen for dark suits', () => {
    expect(TOON_FRAGMENT).toContain('#include <colorspace_fragment>');
    const m = createToonMaterial({color: '#111114'});
    expect(m.uniforms.uSheen).toBeDefined();
  });

  test('web line has an ink outline so it reads on paper', () => {
    const web = buildHero().getObjectByName('web')!;
    const outline = web.getObjectByName('webOutline') as THREE.Mesh | undefined;
    expect(outline).toBeDefined();
    expect(((outline!.material as THREE.MeshBasicMaterial).color.getHexString())).toBe('0b0b0b');
  });
});

describe('minor fixes', () => {
  const firstToon = (g: THREE.Object3D) => {
    let found: THREE.ShaderMaterial | undefined;
    g.traverse((o) => {
      if (!found && o instanceof THREE.Mesh && o.material instanceof THREE.ShaderMaterial) found = o.material;
    });
    return found!;
  };

  test('each hero gets its own materials so they can be disposed on unmount', () => {
    expect(firstToon(buildHero())).not.toBe(firstToon(buildHero()));
  });

  test('halftone dot size follows the device pixel ratio', () => {
    const hero = buildHero();
    setDotScale(hero, 2);
    hero.traverse((o) => {
      if (o instanceof THREE.Mesh && o.material instanceof THREE.ShaderMaterial) expect(o.material.uniforms.uDotSize!.value).toBe(12);
    });
  });

  test('restPose undoes sway, twist, head turn, and drop', () => {
    const hero = buildHero({webLength: 0.6});
    const get = (n: string) => hero.getObjectByName(n)!;
    get('pivot').rotation.z = 0.3;
    get('pivot').position.y = 0.8;
    get('body').rotation.y = 0.4;
    get('head').rotation.set(0.2, 0.3, 0);
    restPose(hero, 0.6);
    expect(get('pivot').rotation.z).toBe(0);
    expect(get('pivot').position.y).toBe(0);
    expect(get('body').rotation.y).toBe(0);
    expect(get('head').rotation.x).toBe(0);
    expect(get('head').rotation.y).toBe(0);
    expect(get('body').position.y).toBeCloseTo(-0.6);
  });
});

test('web extends well above the anchor so a bouncing drop-in never detaches it from the top edge', () => {
  const hero = buildHero({webLength: 0.6});
  hero.updateMatrixWorld(true);
  const web = hero.getObjectByName('web') as THREE.Mesh;
  const box = new THREE.Box3().setFromObject(web);
  expect(box.max.y).toBeGreaterThan(1.5);
  expect(box.min.y).toBeCloseTo(-0.6, 1);
});
