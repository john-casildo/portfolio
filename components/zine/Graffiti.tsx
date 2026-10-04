import {useId} from 'react';

const INK = '#0B0B0B';
const WHITE = '#FFFFFF';

const BUBBLE = 'var(--font-knewave), Impact, sans-serif';
const HANDSTYLE = 'var(--font-tagstyle), var(--font-marker), cursive';

const BUBBLE_SIZE = 100;
const BUBBLE_ADVANCE = 0.64 * BUBBLE_SIZE;
const TAG_SIZE = 64;
const TAG_ADVANCE = 0.5 * TAG_SIZE;

type Props = {text: string; className?: string; tilt?: number};

function useFilterId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

function Sparkle({x, y, r}: {x: number; y: number; r: number}) {
  return <path d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`} fill={WHITE} />;
}

function Drip({x, y, h, color}: {x: number; y: number; h: number; color: string}) {
  return <path d={`M${x - 6} ${y} L${x - 5} ${y + h} A6 6 0 0 0 ${x + 7} ${y + h} L${x + 6} ${y} Z`} fill={color} stroke={INK} strokeWidth="3.5" />;
}

/**
 * Bubble-letter throw-up: fat letters with a black outline, a colored 3D drop, a white outer cut and a black
 * outer line (SVG filter), shine marks, sparkles and drips. Original lettering; decorative only.
 */
export function ThrowUp({text, fill, shade, className = '', tilt = 0, drippy = false}: Props & {fill: string; shade: string; drippy?: boolean}) {
  const id = useFilterId('throwup');
  const chars = Array.from(text);
  const width = Math.round(chars.reduce((w, c) => w + (c === ' ' ? BUBBLE_ADVANCE * 0.45 : BUBBLE_ADVANCE), 0) + 70);
  let cursor = 32;
  const letters = chars.map((c) => {
    const x = cursor;
    cursor += c === ' ' ? BUBBLE_ADVANCE * 0.45 : BUBBLE_ADVANCE;
    return {c, x};
  });
  const solid = letters.filter((l) => l.c !== ' ');
  // Drippy pieces melt under every letter; regular ones drip twice.
  const dripAt = drippy ? solid : [solid[1], solid[solid.length - 2]].filter(Boolean);
  return (
    <span
      aria-hidden="true"
      data-graffiti="throwup"
      data-text={text}
      className={`peel pointer-events-none absolute block [@media(hover:hover)]:pointer-events-auto ${className}`}
      style={{'--tilt': `${tilt}deg`} as React.CSSProperties}
    >
      <svg viewBox={`0 0 ${width} 160`} className="block h-auto w-full overflow-visible">
        <defs>
          <filter id={id} x="-15%" y="-25%" width="130%" height="150%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="inner" />
            <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="outer" />
            <feFlood floodColor={INK} />
            <feComposite in2="outer" operator="in" result="outerInk" />
            <feFlood floodColor={WHITE} />
            <feComposite in2="inner" operator="in" result="cut" />
            <feMerge>
              <feMergeNode in="outerInk" />
              <feMergeNode in="cut" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#${id})`}>
          {dripAt.map((l, i) => (
            <Drip key={`drip${i}`} x={(l?.x ?? 0) + BUBBLE_ADVANCE * 0.45} y={112} h={drippy ? [30, 18, 38, 24, 34][i % 5]! : i ? 22 : 34} color={fill} />
          ))}
          <text x="32" y="118" fontFamily={BUBBLE} fontSize={BUBBLE_SIZE} fill={shade} stroke={INK} strokeWidth="12" strokeLinejoin="round" paintOrder="stroke" transform="translate(7 8)">
            {text}
          </text>
          <text x="32" y="118" fontFamily={BUBBLE} fontSize={BUBBLE_SIZE} fill={fill} stroke={INK} strokeWidth="12" strokeLinejoin="round" paintOrder="stroke">
            {text}
          </text>
          {solid.map((l) => (
            <ellipse key={`shine${l.x}`} cx={l.x + BUBBLE_ADVANCE * 0.32} cy={52} rx="7" ry="3.5" fill={WHITE} transform={`rotate(-28 ${l.x + BUBBLE_ADVANCE * 0.32} 52)`} />
          ))}
        </g>
        <Sparkle x={18} y={26} r={11} />
        <Sparkle x={width - 16} y={30} r={9} />
        <Sparkle x={width * 0.55} y={142} r={7} />
      </svg>
    </span>
  );
}

/** Handstyle tag: fast signature lettering with a swoosh underline, drips and an optional crown. */
export function Tag({text, color, className = '', tilt = 0, crown = false}: Props & {color: string; crown?: boolean}) {
  const chars = Array.from(text);
  const width = Math.round(chars.length * TAG_ADVANCE + 50);
  return (
    <span
      aria-hidden="true"
      data-graffiti="tag"
      data-text={text}
      className={`pointer-events-none absolute block ${className}`}
      style={{transform: `rotate(${tilt}deg)`}}
    >
      <svg viewBox={`0 0 ${width} 120`} className="block h-auto w-full overflow-visible">
        {crown && <path d="M18 30 L22 8 L32 20 L40 4 L48 20 L58 8 L62 30 Z" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" />}
        <text x="16" y="84" fontFamily={HANDSTYLE} fontSize={TAG_SIZE} fill={color}>
          {text}
        </text>
        <path d={`M10 100 C${width * 0.35} 88 ${width * 0.65} 112 ${width - 8} 92`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <path d={`M${width - 26} 84 L${width - 8} 92 L${width - 24} 102`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="30" y="80" width="3" height="18" rx="1.5" fill={color} />
        <rect x={width * 0.6} y="78" width="3" height="26" rx="1.5" fill={color} />
      </svg>
    </span>
  );
}

const PINK = '#FF3EA5';
const YELLOW = '#FFE600';
const CYAN = '#00D1FF';
const LIME = '#B6FF2E';
const RED = '#E10600';

/** Full-width black wall band covered in pieces and tags between sections. Decorative only. */
export function GraffitiWall() {
  return (
    <div
      aria-hidden="true"
      data-testid="graffiti-wall"
      className="relative h-[220px] overflow-hidden border-y-[3px] border-ink bg-ink sm:h-[300px]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 12% 30%, rgb(255 62 165 / 0.35) 0 6px, transparent 7px), radial-gradient(circle at 80% 70%, rgb(0 209 255 / 0.3) 0 9px, transparent 10px), radial-gradient(circle at 64% 18%, rgb(255 230 0 / 0.3) 0 4px, transparent 5px), repeating-linear-gradient(0deg, transparent 0 59px, rgb(255 255 255 / 0.04) 59px 61px)',
      }}
    >
      <ThrowUp text="WEB DEV" fill={RED} shade={YELLOW} tilt={-4} className="left-1/2 top-1/2 w-[86%] max-w-[760px] -translate-x-1/2 -translate-y-1/2 sm:w-[64%]" />
      <Tag text="JC" color={WHITE} crown tilt={-10} className="left-[4%] top-3 w-20 sm:w-28" />
      <Tag text="Costa Rica" color={LIME} tilt={6} className="bottom-2 right-[4%] w-36 sm:w-52" />
      <Tag text="code kid" color={PINK} tilt={-6} className="bottom-3 left-[6%] hidden w-44 sm:block" />
      <Tag text="2026" color={CYAN} tilt={8} className="right-[8%] top-3 w-24 sm:w-32" />
      <ThrowUp text="CR" fill={CYAN} shade={PINK} tilt={10} className="right-[22%] top-2 hidden w-24 lg:block" />
    </div>
  );
}

const MINT = '#3DF5C8';
const ORANGE = '#FF7A00';
const PURPLE = '#8B5CFF';

type EdgePiece =
  | {kind: 'throwup'; text: string; fill: string; shade: string; drippy?: boolean; tilt: number; top: string; width: string}
  | {kind: 'tag'; text: string; color: string; crown?: boolean; tilt: number; top: string; width: string};

const LEFT: EdgePiece[] = [
  {kind: 'throwup', text: 'SMILE', fill: YELLOW, shade: CYAN, drippy: true, tilt: -12, top: '3%', width: '11rem'},
  {kind: 'tag', text: 'mae', color: PINK, tilt: -8, top: '9%', width: '6rem'},
  {kind: 'throwup', text: 'KING', fill: ORANGE, shade: PURPLE, tilt: 8, top: '15%', width: '9.5rem'},
  {kind: 'throwup', text: 'TICO', fill: MINT, shade: PINK, drippy: true, tilt: -6, top: '27%', width: '9.5rem'},
  {kind: 'tag', text: 'JC', color: INK, crown: true, tilt: 10, top: '35%', width: '5rem'},
  {kind: 'throwup', text: 'WILD', fill: PINK, shade: YELLOW, tilt: 12, top: '41%', width: '9.5rem'},
  {kind: 'throwup', text: 'DEPLOY', fill: LIME, shade: RED, tilt: -90, top: '52%', width: '12rem'},
  {kind: 'throwup', text: 'BOOM', fill: CYAN, shade: RED, tilt: -10, top: '66%', width: '10rem'},
  {kind: 'tag', text: 'tuanis', color: LIME, tilt: 6, top: '74%', width: '7rem'},
  {kind: 'throwup', text: 'VIBES', fill: LIME, shade: PURPLE, drippy: true, tilt: 7, top: '80%', width: '11rem'},
  {kind: 'throwup', text: 'LOOP', fill: PURPLE, shade: LIME, tilt: -7, top: '91%', width: '9.5rem'},
];

const RIGHT: EdgePiece[] = [
  {kind: 'throwup', text: 'DRIP', fill: PINK, shade: CYAN, drippy: true, tilt: 10, top: '5%', width: '9.5rem'},
  {kind: 'throwup', text: 'HOLA', fill: YELLOW, shade: RED, tilt: -8, top: '14%', width: '9.5rem'},
  {kind: 'tag', text: 'diay', color: CYAN, tilt: -10, top: '21%', width: '6rem'},
  {kind: 'throwup', text: 'LUCKY', fill: LIME, shade: PINK, tilt: 9, top: '28%', width: '11rem'},
  {kind: 'throwup', text: 'NEXT', fill: CYAN, shade: YELLOW, tilt: -12, top: '39%', width: '9.5rem'},
  {kind: 'throwup', text: 'ART', fill: RED, shade: YELLOW, drippy: true, tilt: 6, top: '49%', width: '8rem'},
  {kind: 'tag', text: 'pura vida', color: PINK, tilt: 8, top: '57%', width: '8.5rem'},
  {kind: 'throwup', text: 'BUGS', fill: ORANGE, shade: CYAN, tilt: -9, top: '63%', width: '9.5rem'},
  {kind: 'throwup', text: 'ZERO', fill: PURPLE, shade: YELLOW, drippy: true, tilt: 11, top: '73%', width: '9.5rem'},
  {kind: 'throwup', text: 'SHIP', fill: MINT, shade: PURPLE, tilt: -6, top: '84%', width: '9.5rem'},
  {kind: 'tag', text: 'JC', color: RED, crown: true, tilt: -12, top: '93%', width: '5rem'},
];

function EdgeColumn({pieces, side}: {pieces: EdgePiece[]; side: 'left' | 'right'}) {
  return (
    <>
      {pieces.map((p) => {
        // Inner edge stays 1.5rem outside the 72rem content column; the rest runs off-screen, so wider
        // screens reveal more of each piece and narrower ones show slivers.
        const offset = `calc((100vw - 72rem) / 2 - 1.5rem - ${p.width})`;
        const style: React.CSSProperties = {[side]: offset, top: p.top, width: p.width};
        return p.kind === 'throwup' ? (
          <span key={`${side}${p.text}`} className="absolute block" style={style}>
            <ThrowUp text={p.text} fill={p.fill} shade={p.shade} drippy={p.drippy} tilt={p.tilt} className="relative w-full" />
          </span>
        ) : (
          <span key={`${side}${p.text}${p.top}`} className="absolute block" style={style}>
            <Tag text={p.text} color={p.color} crown={p.crown} tilt={p.tilt} className="relative w-full" />
          </span>
        );
      })}
    </>
  );
}

/**
 * Throw-ups and tags crammed into the page margins, half off-screen. Only on screens wide enough to have a
 * margin beside the 72rem content column, so nothing ever sits on top of text. Decorative only.
 */
export function EdgeGraffiti() {
  return (
    <div aria-hidden="true" data-testid="edge-graffiti" className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden xl:block">
      <EdgeColumn pieces={LEFT} side="left" />
      <EdgeColumn pieces={RIGHT} side="right" />
    </div>
  );
}
