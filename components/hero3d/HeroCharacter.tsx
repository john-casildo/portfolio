'use client';

import {useEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {damp, dropOffset, headLook, sway, twist} from '@/lib/hero-motion';
import {buildHero, disposeHero, restPose, setDotScale} from './buildHero';

const WEB_LENGTH = 0.6;

export function HeroCharacter({reducedMotion}: {reducedMotion: boolean}) {
  const hero = useMemo(() => buildHero({webLength: WEB_LENGTH}), []);
  const parts = useMemo(
    () => ({
      pivot: hero.getObjectByName('pivot'),
      body: hero.getObjectByName('body'),
      head: hero.getObjectByName('head'),
    }),
    [hero],
  );
  const dpr = useThree((s) => s.viewport.dpr);
  const invalidate = useThree((s) => s.invalidate);
  const pointer = useRef({x: 0, y: 0, active: false});
  const start = useRef<number | null>(null);

  useEffect(() => {
    setDotScale(hero, dpr);
    invalidate();
  }, [hero, dpr, invalidate]);

  // Turning reduced motion on mid-swing should land on the still pose, not freeze wherever it was.
  useEffect(() => {
    if (!reducedMotion) return;
    restPose(hero, WEB_LENGTH);
    invalidate();
  }, [hero, reducedMotion, invalidate]);

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

  useEffect(() => () => disposeHero(hero), [hero]);

  useFrame(({clock}, delta) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    start.current ??= t;
    if (parts.pivot) {
      // Drop-in slides the whole rig (web anchor is above the frame), so the full spring height is visible.
      parts.pivot.position.y = dropOffset(t - start.current);
      parts.pivot.rotation.z = sway(t);
    }
    if (parts.body) parts.body.rotation.y = twist(t);
    const target = pointer.current.active ? headLook(pointer.current.x, pointer.current.y) : headLook(Math.sin(t * 0.4) * 0.5, 0);
    if (parts.head) {
      parts.head.rotation.y = damp(parts.head.rotation.y, target.yaw, 5, delta);
      parts.head.rotation.x = damp(parts.head.rotation.x, target.pitch, 5, delta);
    }
  });

  return <primitive object={hero} />;
}
