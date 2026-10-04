import {useId} from 'react';

/** Spray-painted JC emblem: a rough ring with drippy JC letters, roughened by an SVG displacement filter. */
export function JCStamp({className = '', rough = true}: {className?: string; rough?: boolean}) {
  const id = `spray-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="-62 -62 124 124" aria-hidden="true" className={`pointer-events-none overflow-visible ${className}`} fill="currentColor">
      {rough && (
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="3.5" />
        </filter>
      )}
      <g filter={rough ? `url(#${id})` : undefined}>
        <circle r="50" fill="none" stroke="currentColor" strokeWidth="8" />
        <text x="2" y="22" textAnchor="middle" fontFamily="var(--font-knewave), Impact, sans-serif" fontSize="62">
          JC
        </text>
        {rough && (
          <>
            <path d="M-20 24 L-19 40 A3 3 0 0 0 -13 40 L-14 24 Z" />
            <path d="M14 22 L15 34 A3 3 0 0 0 21 34 L20 22 Z" />
            <path d="M-38 34 L-37 52 A2.5 2.5 0 0 0 -32 52 L-33 30 Z" />
            {[[44, -34, 2.2], [52, -20, 1.4], [-48, -30, 1.8], [40, 44, 1.6], [-30, -52, 1.2]].map(([x, y, r]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r={r} />
            ))}
          </>
        )}
      </g>
    </svg>
  );
}
