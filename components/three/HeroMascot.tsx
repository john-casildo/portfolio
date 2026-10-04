'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import {useReducedMotion} from '@/hooks/useReducedMotion';
import {WebGLGate} from './WebGLGate';

function MascotImage({alt, priority = false}: {alt: string; priority?: boolean}) {
  return (
    <Image
      src="/hero-fallback.png"
      alt={alt}
      width={522}
      height={648}
      priority={priority}
      data-testid="hero-fallback"
      className="relative h-full w-full object-contain"
    />
  );
}

const HeroCanvas = dynamic(() => import('@/components/hero3d/HeroCanvas'), {ssr: false, loading: () => <MascotImage alt="" />});

export function HeroMascot({alt}: {alt: string}) {
  const reducedMotion = useReducedMotion();
  const image = <MascotImage alt={alt} priority />;
  return (
    <WebGLGate fallback={image} pending={image}>
      <HeroCanvas reducedMotion={reducedMotion} alt={alt} />
    </WebGLGate>
  );
}
