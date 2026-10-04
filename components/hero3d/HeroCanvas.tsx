'use client';

import {useEffect, useRef, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {HeroCharacter} from './HeroCharacter';

const ANCHOR_Y = 3.35;
const CONTEXT_RESTORE_GRACE_MS = 1000;

export default function HeroCanvas({reducedMotion, alt}: {reducedMotion: boolean; alt: string}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const lostTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(lostTimer.current), []);

  // A context the browser never restores (common after mobile GPU resets) would leave a blank stage;
  // throwing hands control to the error boundary, which shows the still image.
  if (contextLost) throw new Error('WebGL context lost');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} role="img" aria-label={alt} data-testid="mascot-canvas" className="relative h-full w-full">
      <Canvas
        flat
        dpr={[1, 1.75]}
        gl={{antialias: true, alpha: true}}
        camera={{position: [0, 1.05, 8.4], fov: 30}}
        frameloop={inView && !reducedMotion ? 'always' : 'demand'}
        onCreated={({camera, gl}) => {
          camera.lookAt(0, 1.05, 0);
          gl.domElement.addEventListener('webglcontextlost', () => {
            lostTimer.current = setTimeout(() => setContextLost(true), CONTEXT_RESTORE_GRACE_MS);
          });
          gl.domElement.addEventListener('webglcontextrestored', () => clearTimeout(lostTimer.current));
        }}
      >
        <group position={[0, ANCHOR_Y, 0]}>
          <HeroCharacter reducedMotion={reducedMotion} />
        </group>
      </Canvas>
    </div>
  );
}
