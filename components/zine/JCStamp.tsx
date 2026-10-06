import {useId} from 'react';

/**
 * "Stencil slap" emblem geometry (viewBox 0 0 100 100), shared with the link-preview image and app icons.
 * A red slap sticker with JC cut as a stencil and the bottom-right corner peeled back.
 */
export const EMBLEM = {
  viewBox: '0 0 100 100',
  colors: {sticker: '#E10600', letters: '#F2EFE8', outline: '#0B0B0B', flap: '#8F0000'},
  outlineWidth: 3,
  letterWidth: 12,
  sticker: '6,6 94,6 94,74 74,94 6,94',
  flap: '94,74 74,94 77,77',
  letters: [
    'M14 28 H42',
    'M34 28 V56 Q34 72 22 72 Q17 72 15 68',
    'M82 31 Q78 26 70 26 Q54 26 54 49 Q54 72 70 72 Q76 72 80 67',
  ],
  // Stencil bridges, painted in the sticker colour over the letters: [x, y, width, height].
  bridges: [
    [24, 45, 18, 4],
    [44, 48, 18, 4],
    [67, 16, 4, 18],
  ] as Array<[number, number, number, number]>,
} as const;

/**
 * The emblem's shapes, for an `<svg viewBox={EMBLEM.viewBox}>`. A plain function (no hooks) so the
 * OG image and app icons can call it directly.
 */
export function emblemShapes(sticker: string = EMBLEM.colors.sticker) {
  const {colors} = EMBLEM;
  return (
    <g strokeLinejoin="round">
      <polygon points={EMBLEM.sticker} fill={sticker} stroke={colors.outline} strokeWidth={EMBLEM.outlineWidth} />
      <g fill="none" stroke={colors.letters} strokeWidth={EMBLEM.letterWidth} strokeLinejoin="miter">
        {EMBLEM.letters.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill={sticker}>
        {EMBLEM.bridges.map(([x, y, width, height]) => (
          <rect key={`${x}${y}`} x={x} y={y} width={width} height={height} />
        ))}
      </g>
      <polygon points={EMBLEM.flap} fill={colors.flap} stroke={colors.outline} strokeWidth={EMBLEM.outlineWidth} />
    </g>
  );
}

/**
 * Stencil-slap JC emblem. The sticker takes `currentColor`; `rough` wears the edges like a weathered street sticker.
 */
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
      <g filter={rough ? `url(#${id})` : undefined}>{emblemShapes('currentColor')}</g>
    </svg>
  );
}
