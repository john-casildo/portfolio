'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import {useReducedMotion} from '@/hooks/useReducedMotion';
import {WebGLGate} from './WebGLGate';

function MascotImage({alt, priority = false}: {alt: string; priority?: boolean}) {
  return (
    <Image
      src="/mascot-fallback.png"
      alt={alt}
      width={480}
      height={640}
      priority={priority}
      data-testid="hero-fallback"
      className="pixelated h-full w-full object-contain"
    />
  );
}

const MascotCanvas = dynamic(() => import('./MascotCanvas'), {ssr: false, loading: () => <MascotImage alt="" />});

export function HeroMascot({alt}: {alt: string}) {
  const reducedMotion = useReducedMotion();
  const image = <MascotImage alt={alt} priority />;
  return (
    <WebGLGate fallback={image} pending={image}>
      <MascotCanvas reducedMotion={reducedMotion} alt={alt} />
    </WebGLGate>
  );
}
