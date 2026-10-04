'use client';

import {useEffect, useRef, useState} from 'react';
import {Canvas, useThree} from '@react-three/fiber';
import {Mascot} from './Mascot';

const INTERNAL_HEIGHT = 240;

/** Renders at ~240px tall and lets CSS upscale with pixelated sampling (PS1 look). */
function LowResolution() {
  const height = useThree((s) => s.size.height);
  const setDpr = useThree((s) => s.setDpr);
  useEffect(() => {
    if (height > 0) setDpr(INTERNAL_HEIGHT / height);
  }, [height, setDpr]);
  return null;
}

export default function MascotCanvas({reducedMotion}: {reducedMotion: boolean}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" data-testid="mascot-canvas" className="pixelated h-full w-full">
      <Canvas
        flat
        gl={{antialias: false, alpha: true}}
        camera={{position: [0, 1.95, 6.8], fov: 35}}
        frameloop={inView && !reducedMotion ? 'always' : 'demand'}
        onCreated={({camera}) => camera.lookAt(0, 1.9, 0)}
      >
        <LowResolution />
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <Mascot reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
