'use client';

import dynamic from 'next/dynamic';
import {useReducedMotion} from '@/hooks/useReducedMotion';
import {WebGLGate} from './WebGLGate';

const BackgroundCanvas = dynamic(() => import('./BackgroundCanvas'), {ssr: false});

export function Background() {
  const reducedMotion = useReducedMotion();
  return (
    <WebGLGate fallback={<div data-testid="bg-fallback" aria-hidden="true" className="triangle-fallback pointer-events-none fixed inset-0 -z-10" />}>
      <BackgroundCanvas reducedMotion={reducedMotion} />
    </WebGLGate>
  );
}
