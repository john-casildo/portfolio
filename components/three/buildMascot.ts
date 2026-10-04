import * as THREE from 'three';
import {withVertexSnap} from './ps1';

export const MASCOT_COLORS = {
  skin: '#B8743F',
  hair: '#1A1A1A',
  hoodie: '#1E4E7A',
  sleeve: '#2B6399',
  collar: '#6B7A8C',
  denim: '#2A2D33',
  patch: '#D9D4C7',
  shoe: '#F7F3E8',
  sole: '#1E4E7A',
  eyeWhite: '#F7F3E8',
  pupil: '#2F3B2F',
  ink: '#111111',
} as const;

const OUTLINE_MATERIAL = withVertexSnap(new THREE.MeshBasicMaterial({color: MASCOT_COLORS.ink, side: THREE.BackSide}));
const materials = new Map<string, THREE.Material>();

function material(color: string): THREE.Material {
  let m = materials.get(color);
  if (!m) {
    m = withVertexSnap(new THREE.MeshLambertMaterial({color, flatShading: true}));
    materials.set(color, m);
  }
  return m;
}

function part(name: string, geometry: THREE.BufferGeometry, color: string, outline = true): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material(color));
  mesh.name = name;
  if (outline) {
    const shell = new THREE.Mesh(geometry, OUTLINE_MATERIAL);
    shell.name = `${name}-outline`;
    shell.scale.setScalar(1.08);
    shell.userData.outline = true;
    mesh.add(shell);
  }
  return mesh;
}

function starGeometry(outer: number, inner: number): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

const HAIR_BLOBS: Array<[x: number, y: number, z: number, r: number]> = [
  [0, 0.45, -0.05, 0.55],
  [-0.55, 0.4, -0.1, 0.5],
  [0.55, 0.4, -0.1, 0.5],
  [-0.4, 0.85, -0.2, 0.5],
  [0.4, 0.85, -0.2, 0.5],
  [0, 0.4, -0.45, 0.6],
  [0, 1.0, -0.15, 0.5],
];

/** Original low-poly mascot: big bubbly hair, hoodie, star-patch denim, arms crossed. */
export function buildMascot(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'mascot';

  for (const side of [-1, 1] as const) {
    const suffix = side < 0 ? 'L' : 'R';
    const leg = part(`leg${suffix}`, new THREE.CylinderGeometry(0.24, 0.3, 0.9, 6), MASCOT_COLORS.denim);
    leg.position.set(0.26 * side, 0.6, 0);
    const star = part(`star${suffix}`, starGeometry(0.12, 0.05), MASCOT_COLORS.patch, false);
    star.position.set(0, 0.05, 0.29);
    leg.add(star);
    root.add(leg);

    const shoe = part(`shoe${suffix}`, new THREE.BoxGeometry(0.34, 0.18, 0.55), MASCOT_COLORS.shoe);
    shoe.position.set(0.26 * side, 0.12, 0.08);
    root.add(shoe);
    const sole = part(`sole${suffix}`, new THREE.BoxGeometry(0.36, 0.06, 0.57), MASCOT_COLORS.sole, false);
    sole.position.set(0.26 * side, 0.03, 0.08);
    root.add(sole);

    const arm = part(`arm${suffix}`, new THREE.BoxGeometry(0.95, 0.24, 0.26), MASCOT_COLORS.sleeve);
    arm.position.set(0, 1.55 + side * 0.06, 0.68);
    arm.rotation.z = side * 0.18;
    root.add(arm);
    const hand = part(`hand${suffix}`, new THREE.BoxGeometry(0.2, 0.2, 0.2), MASCOT_COLORS.skin);
    hand.position.set(0.5 * side, 1.6, 0.7);
    root.add(hand);
  }

  const torso = part('torso', new THREE.CylinderGeometry(0.5, 0.62, 1.0, 8), MASCOT_COLORS.hoodie);
  torso.position.y = 1.5;
  root.add(torso);

  const collar = part('collar', new THREE.TorusGeometry(0.36, 0.11, 3, 8), MASCOT_COLORS.collar);
  collar.position.y = 2.0;
  collar.rotation.x = Math.PI / 2;
  root.add(collar);

  const head = new THREE.Group();
  head.name = 'head';
  head.position.y = 2.55;
  root.add(head);

  const skull = part('skull', new THREE.IcosahedronGeometry(0.55, 1), MASCOT_COLORS.skin);
  skull.scale.set(1, 1.05, 0.95);
  head.add(skull);

  for (const side of [-1, 1] as const) {
    const suffix = side < 0 ? 'L' : 'R';
    const ear = part(`ear${suffix}`, new THREE.IcosahedronGeometry(0.12, 0), MASCOT_COLORS.skin);
    ear.position.set(0.55 * side, 0, 0);
    head.add(ear);

    const eye = new THREE.Group();
    eye.name = `eye${suffix}`;
    eye.position.set(0.2 * side, 0.05, 0.5);
    const white = part(`eyeWhite${suffix}`, new THREE.BoxGeometry(0.2, 0.12, 0.04), MASCOT_COLORS.eyeWhite, false);
    const pupil = part(`pupil${suffix}`, new THREE.BoxGeometry(0.08, 0.08, 0.02), MASCOT_COLORS.pupil, false);
    pupil.position.z = 0.03;
    eye.add(white, pupil);
    head.add(eye);

    const brow = part(`brow${suffix}`, new THREE.BoxGeometry(0.24, 0.05, 0.04), MASCOT_COLORS.ink, false);
    brow.position.set(0.2 * side, 0.2, 0.52);
    brow.rotation.z = side * 0.3;
    head.add(brow);
  }

  const mouth = part('mouth', new THREE.BoxGeometry(0.14, 0.035, 0.03), MASCOT_COLORS.ink, false);
  mouth.position.set(0, -0.25, 0.52);
  head.add(mouth);

  HAIR_BLOBS.forEach(([x, y, z, r], i) => {
    const blob = part(`hair${i}`, new THREE.IcosahedronGeometry(r, 0), MASCOT_COLORS.hair);
    blob.position.set(x, y, z);
    head.add(blob);
  });

  return root;
}

export function countTriangles(object: THREE.Object3D, {includeOutlines = false} = {}): number {
  let total = 0;
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (!includeOutlines && child.userData.outline === true) return;
    const g = child.geometry as THREE.BufferGeometry;
    total += (g.index ? g.index.count : g.getAttribute('position').count) / 3;
  });
  return total;
}
