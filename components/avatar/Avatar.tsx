'use client';

import {useEffect, useId, useRef, useState, type ReactNode} from 'react';
import {useReducedMotion} from '@/hooks/useReducedMotion';
import {nextPose, pupilOffset, type Pose} from '@/lib/avatar';

const INK = '#0B0B0B';
const SKIN = '#7A4A2E';
const SKIN_SHADE = '#5A331D';
const HAIR = '#1A120E';
const SWEAT = '#4E2B22';
const SWEAT_SHADE = '#3A1F18';
const PRINT = '#EADFCB';
const DENIM = '#7096C8';
const DENIM_SHADE = '#5277AC';
const DENIM_LIGHT = '#A5BFE0';
const SNEAKER = '#F7F4EE';
const SOLE = '#CFC9BF';
const CHAIN = '#D3D7DD';
const LIP = '#4A2418';
const LIP_LOW = '#6A3626';
const EYE_WHITE = '#F2EADF';
const IRIS = '#24150D';

const OUTLINE = 6;
const PUPIL_TRAVEL = 4;
/** Eyes are animated "on twos": 12 updates per second, snapping with no tweening (comic-book feel). */
const ON_TWOS_MS = 1000 / 12;
const EYES = [
  {id: 'L', cx: 176, cy: 166, shape: 'M161 166 Q176 157 191 165 Q176 172.5 161 166 Z'},
  {id: 'R', cx: 224, cy: 166, shape: 'M209 165 Q224 157 239 166 Q224 172.5 209 165 Z'},
] as const;

/** A sleeve as an outlined tube: ink stroke underneath, fabric stroke on top. */
function Sleeve({d}: {d: string}) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={46} />
      <path d={d} stroke={SWEAT} strokeWidth={34} />
    </g>
  );
}

function Fist({x, y, rotate = 0}: {x: number; y: number; rotate?: number}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-17" y="-13" width="34" height="26" rx="12" fill={SKIN} stroke={INK} strokeWidth={4} />
      <path d="M-8 -12 L-8 -2 M0 -13 L0 -2 M8 -12 L8 -2" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

function HangingHand({x, y}: {x: number; y: number}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-13 -10 Q-15 14 -4 20 Q8 22 12 10 L13 -10 Z" fill={SKIN} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-5 4 L-5 16 M3 4 L3 17" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
}

function OpenPalm({x, y, rotate}: {x: number; y: number; rotate: number}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d="M-20 26 L-21 -18 Q-21 -30 -13 -30 Q-6 -30 -6 -20 L-6 -30 Q-6 -40 2 -40 Q9 -40 9 -30 L9 -26 Q9 -35 16 -34 Q22 -33 22 -24 L22 22 Q20 34 0 34 Q-18 34 -20 26 Z" fill={SKIN} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-6 -20 L-6 -4 M9 -26 L9 -6" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
}

function PeaceHand({x, y}: {x: number; y: number}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-15" y="-34" width="11" height="34" rx="5.5" fill={SKIN} stroke={INK} strokeWidth={4} transform="rotate(-12 -9 -2)" />
      <rect x="2" y="-36" width="11" height="36" rx="5.5" fill={SKIN} stroke={INK} strokeWidth={4} transform="rotate(10 7 -2)" />
      <rect x="-17" y="-8" width="34" height="28" rx="12" fill={SKIN} stroke={INK} strokeWidth={4} />
      <path d="M-6 -2 Q4 4 12 -2" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

/** Arms for each pose. Back pieces first so the front arm overlaps them. */
const ARMS: Record<Pose, ReactNode> = {
  crossed: (
    <>
      <Sleeve d="M268 274 Q292 314 282 352 Q222 364 152 344" />
      <Fist x={146} y={340} rotate={-8} />
      <Sleeve d="M132 274 Q108 314 118 352 Q180 362 250 340" />
      <Fist x={258} y={336} rotate={8} />
    </>
  ),
  facepalm: (
    <>
      <Sleeve d="M268 274 Q294 340 286 418" />
      <HangingHand x={286} y={432} />
      <Sleeve d="M132 274 Q98 330 124 356 Q150 300 166 214" />
      <OpenPalm x={170} y={178} rotate={-14} />
    </>
  ),
  thinking: (
    <>
      <Sleeve d="M268 274 Q290 322 272 364 Q212 374 160 362" />
      <Fist x={152} y={362} rotate={-4} />
      <Sleeve d="M132 274 Q108 334 146 362 Q176 300 190 252" />
      <Fist x={194} y={240} rotate={-70} />
    </>
  ),
  peace: (
    <>
      <Sleeve d="M132 274 Q106 342 114 418" />
      <HangingHand x={114} y={432} />
      <Sleeve d="M268 274 Q322 284 320 236 Q316 210 302 194" />
      <PeaceHand x={298} y={182} />
    </>
  ),
};

function Hair() {
  // Union of bumps: all outlines first, then all fills, so only the outer silhouette gets a line.
  const bumps: Array<[number, number, number]> = [
    [150, 128, 17], [146, 108, 17], [154, 88, 18], [170, 72, 19], [190, 64, 19], [210, 64, 19],
    [230, 72, 19], [246, 88, 18], [254, 108, 17], [250, 128, 17], [176, 96, 26], [200, 90, 28], [224, 96, 26],
  ];
  return (
    <g>
      {bumps.map(([x, y, r]) => (
        <circle key={`o${x}${y}`} cx={x} cy={y} r={r} fill={INK} stroke={INK} strokeWidth={OUTLINE * 2} />
      ))}
      {bumps.map(([x, y, r]) => (
        <circle key={`f${x}${y}`} cx={x} cy={y} r={r} fill={HAIR} />
      ))}
      {/* curl texture */}
      {[[162, 84], [186, 74], [214, 76], [236, 90], [158, 112], [244, 116], [200, 100], [178, 108], [222, 108]].map(([x, y]) => (
        <path key={`c${x}${y}`} d={`M${x - 5} ${y} q5 -7 10 0`} fill="none" stroke="#3B2A22" strokeWidth={2.5} strokeLinecap="round" />
      ))}
    </g>
  );
}

/** Curly hairline over the forehead: a row of curls unioned with the afro (outline only on the outside). */
function Fringe() {
  const curls: Array<[number, number, number]> = [
    [156, 132, 9], [160, 120, 11], [172, 113, 11], [186, 110, 11], [200, 109, 11], [214, 110, 11], [228, 113, 11], [240, 120, 11], [244, 132, 9],
  ];
  return (
    <g>
      {curls.map(([x, y, r]) => (
        <circle key={`o${x}`} cx={x} cy={y} r={r} fill={INK} stroke={INK} strokeWidth={5} />
      ))}
      <path d="M150 128 Q152 96 200 92 Q248 96 250 128 L250 112 Q200 80 150 112 Z" fill={HAIR} />
      {curls.map(([x, y, r]) => (
        <circle key={`f${x}`} cx={x} cy={y} r={r} fill={HAIR} />
      ))}
      {curls.slice(1, -1).map(([x, y]) => (
        <path key={`c${x}`} d={`M${x - 4} ${y + 2} q4 -6 8 0`} fill="none" stroke="#3B2A22" strokeWidth={2} strokeLinecap="round" />
      ))}
    </g>
  );
}

function Head({pupils}: {pupils: Array<{x: number; y: number}>}) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <g>
      <ellipse cx="151" cy="168" rx="9" ry="14" fill={SKIN} stroke={INK} strokeWidth={4} />
      <ellipse cx="249" cy="168" rx="9" ry="14" fill={SKIN} stroke={INK} strokeWidth={4} />
      <Hair />
      <path d="M154 122 Q156 98 200 98 Q244 98 246 122 L246 172 Q244 210 222 228 Q200 240 178 228 Q156 210 154 172 Z" fill={SKIN} stroke={INK} strokeWidth={OUTLINE} strokeLinejoin="round" />
      {/* cel shadow down one side of the face + under the hairline */}
      <path d="M232 112 Q246 120 246 140 L246 172 Q244 208 222 228 Q214 233 208 235 Q232 206 236 168 Q238 132 232 112 Z" fill={SKIN_SHADE} />
      <Fringe />
      {/* brows */}
      <path d="M160 150 Q174 143 190 149" fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
      <path d="M210 149 Q226 143 240 150" fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
      {/* eyes: almond, heavy upper lids for the sleepy look */}
      <defs>
        {EYES.map((e) => (
          <clipPath key={e.id} id={`eye${e.id}${clip}`}>
            <path d={e.shape} />
          </clipPath>
        ))}
      </defs>
      {EYES.map((e, i) => (
        <g key={e.id}>
          <path d={e.shape} fill={EYE_WHITE} />
          <g clipPath={`url(#eye${e.id}${clip})`}>
            <g data-pupil={e.id} style={{transform: `translate(${pupils[i]?.x ?? 0}px, ${pupils[i]?.y ?? 0}px)`}}>
              <circle cx={e.cx} cy={e.cy + 1} r={5.6} fill={IRIS} />
              <circle cx={e.cx + 1.6} cy={e.cy - 0.8} r={1.4} fill={EYE_WHITE} />
            </g>
          </g>
          <path d={e.shape} fill="none" stroke={INK} strokeWidth={2} />
          <path d={e.id === 'L' ? 'M159 166 Q176 155 193 164' : 'M207 164 Q224 155 241 166'} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
          <path d={e.id === 'L' ? 'M163 160 Q177 153 189 158' : 'M211 158 Q223 153 237 160'} fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      ))}
      {/* nose */}
      <path d="M198 172 Q196 186 189 194 Q194 201 200 199 Q206 201 211 194" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {/* thin mustache */}
      <path d="M182 206 Q191 201 200 203 Q209 201 218 206 Q209 204.5 200 205.5 Q191 204.5 182 206 Z" fill={HAIR} stroke={INK} strokeWidth={1.4} />
      {/* lips */}
      <path d="M184 210 Q192 206.5 200 208.5 Q208 206.5 216 210 Q200 213 184 210 Z" fill={LIP} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <path d="M186 211 Q200 223 214 211 Q200 215 186 211 Z" fill={LIP_LOW} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      {/* chin beard */}
      <path d="M193 224 Q200 233 207 224 Q200 228 193 224 Z" fill={HAIR} stroke={INK} strokeWidth={1.4} />
    </g>
  );
}

function Body() {
  return (
    <g strokeLinejoin="round">
      {/* sneakers */}
      {[0, 1].map((side) => (
        <g key={side} transform={side ? 'translate(400 0) scale(-1 1)' : undefined}>
          <path d="M116 602 Q118 584 150 584 Q176 584 190 594 Q198 606 194 618 Q192 626 180 626 L124 626 Q110 624 116 602 Z" fill={SNEAKER} stroke={INK} strokeWidth={OUTLINE} />
          <path d="M116 614 L194 614" stroke={SOLE} strokeWidth={5} />
          <path d="M140 594 L170 590" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}
      {/* baggy jeans */}
      {[0, 1].map((side) => (
        <g key={`leg${side}`} transform={side ? 'translate(400 0) scale(-1 1)' : undefined}>
          <path d="M138 418 L200 418 L198 596 Q180 604 146 602 Q124 600 120 592 Q122 520 138 418 Z" fill={DENIM} stroke={INK} strokeWidth={OUTLINE} />
          <path d="M150 440 Q148 490 152 540" stroke={DENIM_LIGHT} strokeWidth={10} strokeLinecap="round" fill="none" />
          <path d="M184 430 Q190 520 186 596" stroke={DENIM_SHADE} strokeWidth={8} strokeLinecap="round" fill="none" />
          <path d="M128 566 Q150 574 176 566 M126 584 Q156 592 190 582" stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        </g>
      ))}
      <path d="M200 420 L200 470" stroke={INK} strokeWidth={2.5} />
      {/* neck */}
      <path d="M186 220 L186 254 L214 254 L214 220 Z" fill={SKIN_SHADE} stroke={INK} strokeWidth={4} />
      {/* oversized crewneck */}
      <path d="M134 262 Q154 246 200 244 Q246 246 266 262 Q284 300 284 380 Q284 412 280 430 Q240 446 200 446 Q160 446 120 430 Q116 412 116 380 Q116 300 134 262 Z" fill={SWEAT} stroke={INK} strokeWidth={OUTLINE} />
      <path d="M248 270 Q270 310 272 420 Q262 430 246 434 Q254 360 248 270 Z" fill={SWEAT_SHADE} />
      <path d="M122 420 Q200 438 278 420 L280 432 Q240 448 200 448 Q160 448 120 432 Z" fill={SWEAT_SHADE} stroke={INK} strokeWidth={3} />
      {[136, 152, 168, 184, 200, 216, 232, 248, 264].map((x) => (
        <path key={`rib${x}`} d={`M${x} ${426 + Math.abs(200 - x) * -0.03} l0 14`} stroke={INK} strokeWidth={1.3} opacity={0.5} />
      ))}
      {/* collar with white tee peeking */}
      <path d="M172 250 Q200 266 228 250 Q228 260 200 268 Q172 260 172 250 Z" fill={SNEAKER} stroke={INK} strokeWidth={3} />
      <path d="M166 250 Q200 276 234 250" fill="none" stroke={INK} strokeWidth={4} />
      {/* chest print */}
      <text x="200" y="324" textAnchor="middle" fontFamily="var(--font-knewave), Impact, sans-serif" fontSize="38" fill={PRINT} stroke={INK} strokeWidth={1.5}>
        JC
      </text>
      <text x="200" y="344" textAnchor="middle" fontFamily="var(--font-grotesk), system-ui, sans-serif" fontWeight="700" fontSize="11" letterSpacing="2" fill={PRINT}>
        WEB DEV · CR
      </text>
      {/* chain + cross */}
      <path d="M176 254 Q200 300 224 254" fill="none" stroke={CHAIN} strokeWidth={2.4} />
      <path d="M200 280 L200 298 M194 286 L206 286" stroke={CHAIN} strokeWidth={3.2} strokeLinecap="round" />
    </g>
  );
}

/**
 * John as a 2D comic sticker. Body stays still; pupils follow the pointer; click/tap/Enter cycles poses.
 */
export function Avatar({label}: {label: string}) {
  const reducedMotion = useReducedMotion();
  const [pose, setPose] = useState<Pose>('crossed');
  const [pupils, setPupils] = useState([{x: 0, y: 0}, {x: 0, y: 0}]);
  const svgRef = useRef<SVGSVGElement>(null);
  const filterId = `die-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  useEffect(() => {
    if (reducedMotion) {
      setPupils([{x: 0, y: 0}, {x: 0, y: 0}]);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let latest = {x: 0, y: 0};
    const onMove = (e: PointerEvent) => {
      latest = {x: e.clientX, y: e.clientY};
      if (timer) return;
      timer = setTimeout(() => {
        timer = undefined;
        const svg = svgRef.current;
        const ctm = svg?.getScreenCTM();
        if (!svg || !ctm) return;
        const toScreen = (x: number, y: number) => new DOMPoint(x, y).matrixTransform(ctm);
        setPupils(
          EYES.map((eye) => {
            const center = toScreen(eye.cx, eye.cy);
            const max = PUPIL_TRAVEL * ctm.a;
            const o = pupilOffset({x: center.x, y: center.y}, latest, max);
            // back to SVG units, flatten vertical travel (eyes are narrow)
            return {x: o.x / ctm.a, y: (o.y / ctm.a) * 0.45};
          }),
        );
      }, ON_TWOS_MS);
    };
    window.addEventListener('pointermove', onMove, {passive: true});
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reducedMotion]);

  return (
    <button
      type="button"
      aria-label={label}
      data-pose={pose}
      onClick={() => setPose((p) => nextPose(p))}
      className="group relative block h-full w-full cursor-pointer rounded-xl"
    >
      <svg ref={svgRef} viewBox="60 40 300 610" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-15%" y="-10%" width="130%" height="120%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="cut" />
            <feFlood floodColor="#FFFFFF" />
            <feComposite in2="cut" operator="in" result="border" />
            <feOffset in="cut" dx="7" dy="8" result="drop" />
            <feFlood floodColor={INK} />
            <feComposite in2="drop" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="border" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g key={pose} filter={`url(#${filterId})`} className={reducedMotion ? undefined : 'pose-pop'}>
          <Body />
          <Head pupils={pupils} />
          {ARMS[pose]}
        </g>
      </svg>
    </button>
  );
}
