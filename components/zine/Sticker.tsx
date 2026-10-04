import {useId, type ReactNode} from 'react';

export type StickerKind = 'bubble-jc' | 'eight-ball' | 'stop' | 'spray-can' | 'dice' | 'code' | 'crown' | 'heart' | 'year' | 'star';

const INK = '#0B0B0B';
const WHITE = '#FFFFFF';
const PINK = '#FF3EA5';
const YELLOW = '#FFE600';
const CYAN = '#00D1FF';
const LIME = '#B6FF2E';
const ORANGE = '#FF7A00';
const PURPLE = '#8B5CFF';
const RED = '#E10600';

const DISPLAY = 'var(--font-knewave), Impact, sans-serif';
const MARKER = 'var(--font-marker), "Comic Sans MS", cursive';
const SANS = 'var(--font-grotesk), system-ui, sans-serif';

function Sparkle({x, y, r = 8}: {x: number; y: number; r?: number}) {
  return <path d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`} fill={WHITE} />;
}

function Drip({x, y, h, color}: {x: number; y: number; h: number; color: string}) {
  return <path d={`M${x - 5} ${y} L${x - 4} ${y + h} A5 5 0 0 0 ${x + 6} ${y + h} L${x + 5} ${y} Z`} fill={color} stroke={INK} strokeWidth="3" />;
}

const ART: Record<StickerKind, {viewBox: string; art: ReactNode}> = {
  'bubble-jc': {
    viewBox: '0 0 240 170',
    art: (
      <>
        <Drip x={70} y={120} h={26} color={PINK} />
        <Drip x={150} y={118} h={36} color={PINK} />
        <text x="122" y="128" textAnchor="middle" fontFamily={DISPLAY} fontSize="130" fill={INK} transform="translate(7 7)">JC</text>
        <text x="122" y="128" textAnchor="middle" fontFamily={DISPLAY} fontSize="130" fill={PINK} stroke={INK} strokeWidth="9" strokeLinejoin="round" paintOrder="stroke">JC</text>
        <ellipse cx="72" cy="52" rx="9" ry="5" fill={WHITE} transform="rotate(-30 72 52)" />
        <ellipse cx="148" cy="48" rx="8" ry="4" fill={WHITE} transform="rotate(-25 148 48)" />
        <circle cx="178" cy="92" r="13" fill={YELLOW} stroke={INK} strokeWidth="3" />
        <path d="M172 95 Q178 101 184 95" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="174" cy="89" r="1.8" fill={INK} />
        <circle cx="182" cy="89" r="1.8" fill={INK} />
        <Sparkle x={34} y={40} r={11} />
        <Sparkle x={214} y={34} r={9} />
        <Sparkle x={110} y={100} r={7} />
      </>
    ),
  },
  'eight-ball': {
    viewBox: '0 0 200 220',
    art: (
      <>
        <Drip x={82} y={160} h={30} color={INK} />
        <Drip x={122} y={164} h={20} color={INK} />
        <circle cx="100" cy="92" r="78" fill={INK} />
        <ellipse cx="70" cy="56" rx="18" ry="9" fill="#3A3A48" transform="rotate(-35 70 56)" />
        <circle cx="104" cy="84" r="32" fill={WHITE} />
        <text x="104" y="100" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="46" fill={INK}>8</text>
        <text x="100" y="205" textAnchor="middle" fontFamily={MARKER} fontSize="40" fill={YELLOW} stroke={INK} strokeWidth="6" paintOrder="stroke">LUCK</text>
      </>
    ),
  },
  stop: {
    viewBox: '0 0 220 220',
    art: (
      <>
        <polygon points="66,8 154,8 212,66 212,154 154,212 66,212 8,154 8,66" fill={RED} stroke={WHITE} strokeWidth="8" />
        <polygon points="66,8 154,8 212,66 212,154 154,212 66,212 8,154 8,66" fill="none" stroke={INK} strokeWidth="3" />
        <text x="110" y="118" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="58" fill={WHITE} letterSpacing="-1">STOP</text>
        <text x="112" y="156" textAnchor="middle" fontFamily={MARKER} fontSize="24" fill={CYAN} stroke={INK} strokeWidth="4" paintOrder="stroke" transform="rotate(-6 112 150)">SCROLLING</text>
        <path d="M40 60 C60 40 80 70 100 48 S140 60 150 40" fill="none" stroke={CYAN} strokeWidth="4" strokeLinecap="round" />
        <g transform="rotate(8 166 176)">
          <rect x="132" y="160" width="70" height="38" rx="4" fill={WHITE} stroke={INK} strokeWidth="2.5" />
          <rect x="132" y="160" width="70" height="12" rx="4" fill={CYAN} />
          <text x="167" y="170" textAnchor="middle" fontFamily={SANS} fontWeight="700" fontSize="8" fill={WHITE}>HELLO my name is</text>
          <text x="167" y="192" textAnchor="middle" fontFamily={MARKER} fontSize="16" fill={INK}>JC</text>
        </g>
      </>
    ),
  },
  'spray-can': {
    viewBox: '0 0 170 240',
    art: (
      <>
        <circle cx="128" cy="26" r="12" fill="#E8E8E8" />
        <circle cx="146" cy="16" r="8" fill="#E8E8E8" />
        <circle cx="150" cy="38" r="6" fill="#E8E8E8" />
        <rect x="66" y="22" width="22" height="16" rx="3" fill={INK} />
        <path d="M54 40 Q77 26 100 40 L100 56 L54 56 Z" fill={INK} />
        <rect x="40" y="54" width="74" height="170" rx="18" fill={LIME} stroke={INK} strokeWidth="5" />
        <rect x="52" y="66" width="10" height="140" rx="5" fill={WHITE} opacity="0.55" />
        <text x="80" y="128" textAnchor="middle" fontFamily={DISPLAY} fontSize="48" fill={INK}>J</text>
        <text x="80" y="180" textAnchor="middle" fontFamily={DISPLAY} fontSize="48" fill={INK}>C</text>
      </>
    ),
  },
  dice: {
    viewBox: '0 0 240 200',
    art: (
      <>
        <path d="M30 150 C10 100 40 80 34 40 C60 70 64 30 90 10 C88 50 120 50 112 90 C140 70 150 40 176 26 C170 70 210 80 200 130 Z" fill={ORANGE} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M60 140 C50 110 70 100 66 76 C84 92 90 70 104 56 C104 84 128 88 122 112 C140 100 146 84 160 76 C160 104 180 112 172 140 Z" fill={YELLOW} />
        <g transform="rotate(-14 80 140)">
          <rect x="34" y="96" width="88" height="88" rx="16" fill={WHITE} stroke={INK} strokeWidth="5" />
          {[[56, 118], [100, 118], [78, 140], [56, 162], [100, 162]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="8" fill={INK} />)}
        </g>
        <g transform="rotate(12 170 140)">
          <rect x="128" y="100" width="80" height="80" rx="14" fill={WHITE} stroke={INK} strokeWidth="5" />
          {[[148, 120], [188, 120], [148, 160], [188, 160]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="7" fill={INK} />)}
        </g>
      </>
    ),
  },
  code: {
    viewBox: '0 0 260 120',
    art: (
      <>
        <text x="136" y="98" textAnchor="middle" fontFamily={DISPLAY} fontSize="96" fill={INK} transform="translate(6 6)">CODE</text>
        <text x="136" y="98" textAnchor="middle" fontFamily={DISPLAY} fontSize="96" fill={PURPLE} stroke={WHITE} strokeWidth="10" strokeLinejoin="round" paintOrder="stroke">CODE</text>
        <Sparkle x={24} y={28} r={10} />
        <Sparkle x={246} y={90} r={8} />
      </>
    ),
  },
  crown: {
    viewBox: '0 0 100 80',
    art: <path d="M8 70 L14 20 L34 44 L50 10 L66 44 L86 20 L92 70 Z" fill={YELLOW} stroke={INK} strokeWidth="5" strokeLinejoin="round" />,
  },
  heart: {
    viewBox: '0 0 100 90',
    art: <path d="M50 84 C10 56 4 30 22 16 C36 6 48 16 50 26 C52 16 64 6 78 16 C96 30 90 56 50 84 Z" fill={PINK} stroke={INK} strokeWidth="5" strokeLinejoin="round" />,
  },
  year: {
    viewBox: '0 0 140 70',
    art: (
      <text x="70" y="52" textAnchor="middle" fontFamily={MARKER} fontSize="46" fill={CYAN} stroke={INK} strokeWidth="6" paintOrder="stroke">2026</text>
    ),
  },
  star: {
    viewBox: '0 0 100 100',
    art: <path d="M50 6 L62 38 L96 40 L69 61 L79 94 L50 75 L21 94 L31 61 L4 40 L38 38 Z" fill={LIME} stroke={INK} strokeWidth="5" strokeLinejoin="round" />,
  },
};

/**
 * Original vinyl-style sticker: white die-cut border and a hard ink shadow (SVG filter), slight tilt,
 * peels up on hover. Purely decorative.
 */
export function Sticker({kind, tilt = 0, className = ''}: {kind: StickerKind; tilt?: number; className?: string}) {
  const id = `die-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const {viewBox, art} = ART[kind];
  return (
    <span
      aria-hidden="true"
      data-sticker={kind}
      className={`peel pointer-events-none absolute block [@media(hover:hover)]:pointer-events-auto ${className}`}
      style={{'--tilt': `${tilt}deg`} as React.CSSProperties}
    >
      <svg viewBox={viewBox} className="block h-auto w-full overflow-visible">
        <defs>
          <filter id={id} x="-25%" y="-25%" width="150%" height="150%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="7" result="cut" />
            <feFlood floodColor={WHITE} />
            <feComposite in2="cut" operator="in" result="border" />
            <feOffset in="cut" dx="5" dy="6" result="drop" />
            <feFlood floodColor={INK} />
            <feComposite in2="drop" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="border" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#${id})`}>{art}</g>
      </svg>
    </span>
  );
}
