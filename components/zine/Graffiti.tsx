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
export function ThrowUp({text, fill, shade, className = '', tilt = 0}: Props & {fill: string; shade: string}) {
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
  const dripAt = [solid[1], solid[solid.length - 2]].filter(Boolean);
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
            <Drip key={`drip${i}`} x={(l?.x ?? 0) + BUBBLE_ADVANCE * 0.45} y={112} h={i ? 22 : 34} color={fill} />
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
