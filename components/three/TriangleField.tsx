'use client';

import {useEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {QUILT} from '@/lib/palette';
import {buildQuilt, currentOrientation, isFieldAnimating, repattern} from '@/lib/quilt';
import {mulberry32} from '@/lib/random';
import {subscribeActiveSection} from '@/lib/section-store';

const TARGET_CELL = 64;
const TRANSITION_SECONDS = 0.8;
const POINTER_ACTIVE_SECONDS = 1.5;
const MAX_FRAME_DELTA = 0.05;

const nowSeconds = () => performance.now() / 1000;

const vertexShader = /* glsl */ `
  attribute vec2 aCenter;
  attribute vec3 aColor;
  attribute float aOrient;
  attribute float aOrientNext;
  attribute float aSeed;
  uniform float uTime;
  uniform float uMix;
  uniform float uCell;
  uniform float uRadius;
  uniform vec2 uPointer;
  varying vec3 vColor;
  const float HALF_PI = 1.5707963;
  const float PI = 3.1415926;

  void main() {
    float local = clamp(uMix * 1.6 - aSeed * 0.6, 0.0, 1.0);
    float eased = local * local * (3.0 - 2.0 * local);
    float delta = mod(aOrientNext - aOrient + 4.0, 4.0);
    if (delta > 2.0) delta -= 4.0;
    float angle = (aOrient + delta * eased) * HALF_PI;
    float c = cos(angle);
    float s = sin(angle);
    vec2 p = mat2(c, s, -s, c) * position.xy;

    float dist = distance(aCenter, uPointer);
    float ripple = 1.0 - smoothstep(0.0, uRadius, dist);
    float wave = 0.5 + 0.5 * sin(uTime * 3.0 - dist * 0.04 + aSeed * 6.2831);
    p.x *= cos(ripple * wave * PI);

    vColor = mix(aColor, vec3(1.0), ripple * 0.35);
    vec2 world = aCenter + p * uCell;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

export function TriangleField({reducedMotion}: {reducedMotion: boolean}) {
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const rand = useMemo(() => mulberry32(11), []);
  const transitioning = useRef(false);
  const activeUntil = useRef(0);

  // Cover the full screen height so mobile toolbar show/hide (a viewport-height change) doesn't rebuild the quilt.
  const coverHeight = Math.max(size.height, window.screen.height);
  const quilt = useMemo(() => buildQuilt(size.width, coverHeight, TARGET_CELL, mulberry32(7), QUILT.length), [size.width, coverHeight]);

  const geometry = useMemo(() => {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0]), 3));
    const colors = new Float32Array(quilt.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < quilt.count; i++) {
      color.set(QUILT[quilt.colorIndex[i] ?? 0] ?? QUILT[0]);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    g.setAttribute('aCenter', new THREE.InstancedBufferAttribute(quilt.centers, 2));
    g.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
    g.setAttribute('aOrient', new THREE.InstancedBufferAttribute(quilt.orient.slice(), 1));
    g.setAttribute('aOrientNext', new THREE.InstancedBufferAttribute(quilt.orient.slice(), 1));
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(quilt.seeds, 1));
    g.instanceCount = quilt.count;
    return g;
  }, [quilt]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        depthWrite: false,
        uniforms: {
          uTime: {value: 0},
          uMix: {value: 1},
          uCell: {value: TARGET_CELL},
          uRadius: {value: 200},
          uPointer: {value: new THREE.Vector2(1e5, 1e5)},
        },
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    material.uniforms.uCell!.value = quilt.cell;
    material.uniforms.uRadius!.value = 0.15 * Math.max(size.width, size.height);
  }, [material, quilt, size.width, size.height]);

  useEffect(() => {
    if (reducedMotion) return;
    const pointer = material.uniforms.uPointer!.value as THREE.Vector2;
    const onMove = (e: PointerEvent) => {
      pointer.set(e.clientX - size.width / 2, size.height / 2 - e.clientY);
      activeUntil.current = nowSeconds() + POINTER_ACTIVE_SECONDS;
      invalidate();
    };
    const onLeave = () => {
      pointer.set(1e5, 1e5);
      invalidate();
    };
    window.addEventListener('pointermove', onMove, {passive: true});
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [material, size.width, size.height, reducedMotion, invalidate]);

  useEffect(() => {
    if (reducedMotion) return;
    return subscribeActiveSection(() => {
      const current = geometry.getAttribute('aOrient') as THREE.InstancedBufferAttribute;
      const next = geometry.getAttribute('aOrientNext') as THREE.InstancedBufferAttribute;
      const currentArray = current.array as Float32Array;
      const nextArray = next.array as Float32Array;
      // Start from the visible pose: mid-transition triangles continue from where they are.
      currentArray.set(
        transitioning.current
          ? currentOrientation(currentArray, nextArray, quilt.seeds, material.uniforms.uMix!.value as number)
          : nextArray,
      );
      (next.array as Float32Array).set(repattern(currentArray, rand));
      current.needsUpdate = true;
      next.needsUpdate = true;
      material.uniforms.uMix!.value = 0;
      transitioning.current = true;
      invalidate();
    });
  }, [geometry, material, quilt, rand, reducedMotion, invalidate]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    // On-demand rendering: after idle, `delta` spans the whole pause, so cap it.
    const step = Math.min(delta, MAX_FRAME_DELTA);
    material.uniforms.uTime!.value += step;
    if (transitioning.current) {
      const mix = Math.min(1, material.uniforms.uMix!.value + step / TRANSITION_SECONDS);
      material.uniforms.uMix!.value = mix;
      if (mix >= 1) transitioning.current = false;
    }
    if (isFieldAnimating(nowSeconds(), activeUntil.current, transitioning.current)) invalidate();
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}
