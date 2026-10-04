import {useId} from 'react';

const LEGS = [
  'M-4 -10 L-12 -30 L-9 -56',
  'M-6 -5 L-28 -18 L-38 -44',
  'M-6 6 L-30 16 L-42 42',
  'M-4 13 L-14 36 L-9 58',
];

/** Spray-painted spider emblem drawn from scratch: ring + spider, roughened with an SVG displacement filter. */
export function SpiderStamp({className = '', rough = true}: {className?: string; rough?: boolean}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="-62 -62 124 124" aria-hidden="true" className={`pointer-events-none ${className}`} fill="currentColor">
      {rough && (
        <filter id={`spray-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="3.5" />
        </filter>
      )}
      <g filter={rough ? `url(#spray-${id})` : undefined}>
        <circle r="41" fill="none" stroke="currentColor" strokeWidth="7" />
        <ellipse cy="10" rx="9" ry="15" />
        <ellipse cy="-8" rx="7" ry="8" />
        <path d="M-3 -16 L-5 -22 M3 -16 L5 -22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {[1, -1].map((side) => (
          <g key={side} transform={`scale(${side} 1)`}>
            {LEGS.map((d) => (
              <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
