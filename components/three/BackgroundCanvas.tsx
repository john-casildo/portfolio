'use client';

import {Canvas} from '@react-three/fiber';
import {TriangleField} from './TriangleField';

export default function BackgroundCanvas({reducedMotion}: {reducedMotion: boolean}) {
  return (
    <div aria-hidden="true" data-testid="bg-canvas" className="pointer-events-none fixed inset-0 -z-10 opacity-55">
      <Canvas
        orthographic
        camera={{position: [0, 0, 10], zoom: 1, near: 0.1, far: 100}}
        dpr={[1, 1.5]}
        gl={{antialias: false, alpha: true, powerPreference: 'low-power'}}
        frameloop="demand"
      >
        <TriangleField reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
