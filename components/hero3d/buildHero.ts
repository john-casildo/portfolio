import * as THREE from 'three';
import {createToonMaterial} from './toonMaterial';

const COLORS = {suit: '#111114', red: '#E10600', white: '#F7F5F0', ink: '#0B0B0B'} as const;
// Rebuilt per `buildHero` call (it runs synchronously) so each hero owns — and can dispose — its materials.
let outlineMaterial = new THREE.MeshBasicMaterial({color: COLORS.ink, side: THREE.BackSide});
let materials = new Map<string, THREE.Material>();

function material(color: string, webLines = false): THREE.Material {
  const key = `${color}:${webLines}`;
  let m = materials.get(key);
  if (!m) {
    m = createToonMaterial({color, webLines});
    materials.set(key, m);
  }
  return m;
}

function part(name: string, geometry: THREE.BufferGeometry, color: string, {webLines = false, outline = 1.09} = {}): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material(color, webLines));
  mesh.name = name;
  if (outline > 0) {
    const shell = new THREE.Mesh(geometry, outlineMaterial);
    shell.scale.setScalar(outline);
    shell.userData.outline = true;
    mesh.add(shell);
  }
  return mesh;
}

/** How far the web continues above the anchor, so it stays attached to the top edge while the rig bounces. */
const WEB_ABOVE_ANCHOR = 2;

function placeWeb(web: THREE.Object3D, webLength: number): void {
  web.scale.y = webLength + WEB_ABOVE_ANCHOR;
  web.position.y = (WEB_ABOVE_ANCHOR - webLength) / 2;
}

const capsule = (radius: number, length: number) => new THREE.CapsuleGeometry(radius, length, 4, 10);

function joint(name: string, x: number, y: number, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(x, y, z);
  return g;
}

function limb(prefix: string, upper: [number, number], lower: [number, number], color: string) {
  const top = joint(`${prefix}Upper`, 0, 0);
  const up = part(`${prefix}UpperMesh`, capsule(upper[0], upper[1]), color, {webLines: true});
  up.position.y = -(upper[1] / 2 + upper[0] * 0.6);
  top.add(up);
  const knee = joint(`${prefix}Joint`, 0, -(upper[1] + upper[0] * 1.2));
  const low = part(`${prefix}LowerMesh`, capsule(lower[0], lower[1]), color, {webLines: true});
  low.position.y = -(lower[1] / 2 + lower[0] * 0.6);
  knee.add(low);
  top.add(knee);
  return {top, knee, end: -(lower[1] + lower[0] * 1.2)};
}

function eyeShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.085, 0.035);
  s.quadraticCurveTo(0.0, 0.075, 0.07, 0.0);
  s.quadraticCurveTo(0.02, -0.06, -0.075, -0.03);
  s.closePath();
  return s;
}

function emblem(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'emblem';
  const red = material(COLORS.red);
  const body = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), red);
  body.scale.set(0.8, 1.4, 1);
  g.add(body);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.012), red);
      leg.position.set(side * 0.05, 0.04 - i * 0.03, 0);
      leg.rotation.z = side * (0.9 - i * 0.55);
      g.add(leg);
    }
  }
  return g;
}

/** Hero hanging upside down from a web (pure; no renderer needed). Root origin = top web anchor. */
export function buildHero({webLength = 1.0} = {}): THREE.Group {
  materials = new Map();
  outlineMaterial = new THREE.MeshBasicMaterial({color: COLORS.ink, side: THREE.BackSide});
  const root = new THREE.Group();
  root.name = 'hero';

  const pivot = joint('pivot', 0, 0);
  root.add(pivot);

  const web = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), new THREE.MeshBasicMaterial({color: COLORS.white}));
  web.name = 'web';
  placeWeb(web, webLength);
  // Ink casing behind the white line so the web reads on light paper.
  const webOutline = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1, 6), new THREE.MeshBasicMaterial({color: COLORS.ink}));
  webOutline.name = 'webOutline';
  webOutline.position.z = -0.01;
  web.add(webOutline);
  pivot.add(web);

  // `body` origin is at the ankles; the upright figure inside is flipped so it hangs head-down.
  const body = joint('body', 0, -webLength);
  pivot.add(body);
  const upright = new THREE.Group();
  upright.rotation.z = Math.PI;
  body.add(upright);
  const figure = new THREE.Group();
  figure.position.y = -0.08; // ankles at body origin
  upright.add(figure);

  const hips = joint('hips', 0, 1.55);
  figure.add(hips);
  const pelvis = part('pelvis', capsule(0.15, 0.18), COLORS.suit, {webLines: true});
  pelvis.rotation.z = Math.PI / 2;
  hips.add(pelvis);

  for (const side of [-1, 1] as const) {
    const leg = limb(side < 0 ? 'legL' : 'legR', [0.11, 0.56], [0.088, 0.54], COLORS.suit);
    leg.top.name = side < 0 ? 'legL' : 'legR';
    leg.top.position.set(side * 0.12, -0.05, 0);
    leg.top.rotation.z = side * 0.03;
    leg.knee.rotation.x = 0.18;
    hips.add(leg.top);
    const shoe = part(`shoe${side}`, new THREE.BoxGeometry(0.12, 0.08, 0.27), COLORS.suit);
    shoe.position.set(0, leg.end - 0.02, 0.06);
    const sole = part(`sole${side}`, new THREE.BoxGeometry(0.125, 0.03, 0.28), COLORS.red, {outline: 0});
    sole.position.set(0, -0.05, 0);
    shoe.add(sole);
    leg.knee.add(shoe);
  }

  const torso = joint('torso', 0, 0.05);
  hips.add(torso);
  const abdomen = part('abdomen', capsule(0.17, 0.26), COLORS.suit, {webLines: true});
  abdomen.position.y = 0.24;
  torso.add(abdomen);
  const chest = part('chest', capsule(0.22, 0.22), COLORS.suit, {webLines: true});
  chest.scale.set(1.28, 1, 0.78);
  chest.position.y = 0.58;
  torso.add(chest);
  const mark = emblem();
  mark.position.set(0, 0.6, 0.178);
  mark.scale.setScalar(1.4);
  torso.add(mark);
  const neck = part('neck', new THREE.CylinderGeometry(0.06, 0.07, 0.12, 10), COLORS.suit, {outline: 0});
  neck.position.y = 0.84;
  torso.add(neck);

  const head = joint('head', 0, 0.9);
  torso.add(head);
  const skull = part('skull', new THREE.SphereGeometry(0.21, 18, 14), COLORS.suit, {webLines: true});
  skull.scale.set(0.9, 1.12, 0.96);
  skull.position.y = 0.17;
  head.add(skull);
  for (const side of [-1, 1] as const) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.085, 0.2, 0.185);
    eye.rotation.y = side * 0.38;
    eye.scale.x = side;
    const rim = new THREE.Mesh(new THREE.ShapeGeometry(eyeShape(), 6), material(COLORS.ink));
    rim.scale.setScalar(1.3);
    rim.position.z = -0.002;
    const white = new THREE.Mesh(new THREE.ShapeGeometry(eyeShape(), 6), new THREE.MeshBasicMaterial({color: COLORS.white}));
    white.position.z = 0.004;
    eye.add(rim, white);
    head.add(eye);
  }

  for (const side of [-1, 1] as const) {
    const arm = limb(side < 0 ? 'armL' : 'armR', [0.078, 0.4], [0.068, 0.38], COLORS.suit);
    arm.top.name = side < 0 ? 'armL' : 'armR';
    arm.top.position.set(side * 0.31, 0.74, 0);
    // Upright frame: arms raised overhead → they dangle toward the ground once flipped.
    arm.top.rotation.z = side * (Math.PI - 0.32);
    arm.top.rotation.x = side < 0 ? 0.12 : -0.08;
    arm.knee.rotation.z = side * -0.25;
    torso.add(arm.top);
    const hand = part(`hand${side}`, capsule(0.055, 0.07), COLORS.red);
    hand.position.y = arm.end - 0.02;
    arm.knee.add(hand);
  }

  return root;
}

export function countTriangles(object: THREE.Object3D): number {
  let total = 0;
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || child.userData.outline === true) return;
    const g = child.geometry as THREE.BufferGeometry;
    total += (g.index ? g.index.count : g.getAttribute('position').count) / 3;
  });
  return total;
}

const DOT_SIZE_CSS_PX = 6;

/** Keeps halftone dots the same size in CSS pixels regardless of the device pixel ratio. */
export function setDotScale(hero: THREE.Object3D, dpr: number): void {
  hero.traverse((o) => {
    if (o instanceof THREE.Mesh && o.material instanceof THREE.ShaderMaterial && o.material.uniforms.uDotSize) {
      o.material.uniforms.uDotSize.value = DOT_SIZE_CSS_PX * dpr;
    }
  });
}

/** Resets every animated joint to the still pose (used when reduced motion turns on mid-animation). */
export function restPose(hero: THREE.Object3D, webLength: number): void {
  const pivot = hero.getObjectByName('pivot');
  const body = hero.getObjectByName('body');
  const head = hero.getObjectByName('head');
  const web = hero.getObjectByName('web');
  pivot?.rotation.set(0, 0, 0);
  pivot?.position.setY(0);
  body?.rotation.set(0, 0, 0);
  body?.position.setY(-webLength);
  head?.rotation.set(0, 0, 0);
  if (web) placeWeb(web, webLength);
}

/** Frees GPU resources owned by this hero (geometries and its per-instance materials). */
export function disposeHero(hero: THREE.Object3D): void {
  const seen = new Set<THREE.Material>();
  hero.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    o.geometry.dispose();
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (!seen.has(m)) {
        seen.add(m);
        m.dispose();
      }
    }
  });
}
