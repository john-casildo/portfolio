'use client';

import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {damp, dropOffset, headLook, sway, twist} from '@/lib/hero-motion';
import {buildHero} from './buildHero';

const WEB_LENGTH = 0.6;

export function HeroCharacter({reducedMotion}: {reducedMotion: boolean}) {
  const hero = useMemo(() => buildHero({webLength: WEB_LENGTH}), []);
  const parts = useMemo(
    () => ({
      pivot: hero.getObjectByName('pivot'),
      web: hero.getObjectByName('web'),
      body: hero.getObjectByName('body'),
      head: hero.getObjectByName('head'),
    }),
    [hero],
  );
  const pointer = useRef({x: 0, y: 0, active: false});
  const start = useRef<number | null>(null);

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
      hero.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
    },
    [hero],
  );

  useFrame(({clock}, delta) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    start.current ??= t;
    const drop = dropOffset(t - start.current);
    const length = Math.max(0.1, WEB_LENGTH - drop);
    if (parts.web) {
      parts.web.scale.y = length;
      parts.web.position.y = -length / 2;
    }
    if (parts.body) {
      parts.body.position.y = -length;
      parts.body.rotation.y = twist(t);
    }
    if (parts.pivot) parts.pivot.rotation.z = sway(t);
    const target = pointer.current.active ? headLook(pointer.current.x, pointer.current.y) : headLook(Math.sin(t * 0.4) * 0.5, 0);
    if (parts.head) {
      parts.head.rotation.y = damp(parts.head.rotation.y, target.yaw, 5, delta);
      parts.head.rotation.x = damp(parts.head.rotation.x, target.pitch, 5, delta);
    }
  });

  return <primitive object={hero} />;
}
