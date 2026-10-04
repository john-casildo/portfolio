import {useId} from 'react';

/**
 * JC emblem geometry (viewBox -70 -70 140 140), shared with the link-preview image.
 * Like a spider-logo: a ring with the letters crossing out past it.
 */
export const EMBLEM = {
  viewBox: '-70 -70 140 140',
  ring: {r: 52, width: 8},
  letterWidth: 12,
  // J: top bar crosses the ring on the left; the hook swings out below it.
  j: 'M-64 -30 L-12 -30 M-30 -30 L-30 18 Q-30 40 -48 40 Q-62 40 -67 26',
  // C: wide arc whose ends poke out past the ring on the right.
  c: 'M64 -26 Q50 -40 26 -38 Q-4 -34 -6 0 Q-4 34 26 38 Q50 40 64 26',
  drips: [
    'M-50 -26 L-49 -10 A3 3 0 0 0 -43 -10 L-44 -26 Z',
    'M18 40 L19 58 A3 3 0 0 0 25 58 L24 40 Z',
    'M-34 52 L-33 64 A2.5 2.5 0 0 0 -28 64 L-29 52 Z',
  ],
  specks: [
    [54, -44, 2.4],
    [62, -8, 1.6],
    [-58, -54, 1.8],
    [46, 56, 2],
    [-62, 56, 1.4],
    [8, -62, 1.6],
  ] as Array<[number, number, number]>,
} as const;

/** Spray-painted JC emblem. `rough` adds the spray displacement, drips and specks. */
export function JCStamp({className = '', rough = true}: {className?: string; rough?: boolean}) {
  const id = `spray-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox={EMBLEM.viewBox} aria-hidden="true" className={`pointer-events-none overflow-visible ${className}`}>
      {rough && (
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="3.5" />
        </filter>
      )}
      <g filter={rough ? `url(#${id})` : undefined} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle r={EMBLEM.ring.r} strokeWidth={EMBLEM.ring.width} />
        <path d={EMBLEM.j} strokeWidth={EMBLEM.letterWidth} />
        <path d={EMBLEM.c} strokeWidth={EMBLEM.letterWidth} />
        {rough && (
          <g fill="currentColor" stroke="none">
            {EMBLEM.drips.map((d) => (
              <path key={d} d={d} />
            ))}
            {EMBLEM.specks.map(([x, y, r]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={r} />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}
