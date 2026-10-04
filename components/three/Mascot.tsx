'use client';

import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {BLINK_DURATION, blinkScale, breathScale, damp, lookTarget, nextBlinkDelay} from '@/lib/mascot-motion';
import {mulberry32} from '@/lib/random';
import {buildMascot} from './buildMascot';

type Pointer = {x: number; y: number; active: boolean};

export function Mascot({reducedMotion}: {reducedMotion: boolean}) {
  const mascot = useMemo(() => buildMascot(), []);
  const parts = useMemo(
    () => ({
      head: mascot.getObjectByName('head'),
      torso: mascot.getObjectByName('torso'),
      eyeL: mascot.getObjectByName('eyeL'),
      eyeR: mascot.getObjectByName('eyeR'),
    }),
    [mascot],
  );
  const rand = useMemo(() => mulberry32(42), []);
  const pointer = useRef<Pointer>({x: 0, y: 0, active: false});
  const blink = useRef({next: 3, start: -1});

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current = {x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1), active: true};
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      pointer.current = {x: e.gamma / 30, y: (45 - e.beta) / 30, active: true};
    };
    window.addEventListener('pointermove', onMove, {passive: true});
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [reducedMotion]);

  useEffect(
    () => () => {
      mascot.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
    },
    [mascot],
  );

  useFrame(({clock}, delta) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    parts.torso?.scale.setY(breathScale(t));

    const target = pointer.current.active ? lookTarget(pointer.current.x, pointer.current.y) : lookTarget(Math.sin(t * 0.5) * 0.4, 0);
    if (parts.head) {
      parts.head.rotation.y = damp(parts.head.rotation.y, target.yaw, 6, delta);
      parts.head.rotation.x = damp(parts.head.rotation.x, target.pitch, 6, delta);
    }

    const b = blink.current;
    if (t >= b.next) {
      b.start = t;
      b.next = t + BLINK_DURATION + nextBlinkDelay(rand);
    }
    const eyeScale = blinkScale(t - b.start);
    parts.eyeL?.scale.setY(eyeScale);
    parts.eyeR?.scale.setY(eyeScale);
  });

  return <primitive object={mascot} />;
}
