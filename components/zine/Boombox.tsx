'use client';

import {useId, useRef, useState} from 'react';

const INK = '#0B0B0B';
const BODY = '#1E1E22';
const RED = '#E10600';
const YELLOW = '#FFE600';
const GREY = '#4A4A52';
const WHITE = '#FFFFFF';

const CLIP = '/audio/boombox.mp3';

function Speaker({cx}: {cx: number}) {
  return (
    <g className="speaker">
      <circle cx={cx} cy={96} r={34} fill={RED} stroke={INK} strokeWidth={4} />
      <circle cx={cx} cy={96} r={26} fill={GREY} stroke={INK} strokeWidth={3} />
      <circle cx={cx} cy={96} r={14} fill={BODY} stroke={INK} strokeWidth={3} />
      <circle cx={cx} cy={96} r={5} fill={RED} />
    </g>
  );
}

/** Sticker boombox: click plays a 10-second clip, click again (or let it end) to stop. Never autoplays. */
export function Boombox({playLabel, stopLabel, className = ''}: {playLabel: string; stopLabel: string; className?: string}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const filterId = `die-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  function toggle() {
    const el = audio.current;
    if (!el) return;
    if (playing) {
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
      return;
    }
    el.currentTime = 0;
    setPlaying(true);
    el.play().catch(() => setPlaying(false));
  }

  return (
    <div className={`absolute z-10 ${className}`}>
      <button
        type="button"
        aria-pressed={playing}
        aria-label={playing ? stopLabel : playLabel}
        data-playing={playing}
        onClick={toggle}
        className="boombox peel block w-full cursor-pointer"
        style={{'--tilt': '-6deg'} as React.CSSProperties}
      >
        <svg viewBox="0 0 240 150" className="block h-auto w-full overflow-visible" aria-hidden="true">
          <defs>
            <filter id={filterId} x="-15%" y="-20%" width="130%" height="140%">
              <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="cut" />
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
          <g filter={`url(#${filterId})`}>
            <path d="M60 36 L66 10 Q68 4 76 4 L164 4 Q172 4 174 10 L180 36" fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
            <rect x="8" y="32" width="224" height="112" rx="16" fill={BODY} stroke={INK} strokeWidth={5} />
            <rect x="8" y="32" width="224" height="12" rx="6" fill={RED} />
            <Speaker cx={52} />
            <Speaker cx={188} />
            {/* tape deck */}
            <rect x="92" y="58" width="56" height="38" rx="5" fill={YELLOW} stroke={INK} strokeWidth={3} />
            <circle cx="108" cy="77" r="7" fill={WHITE} stroke={INK} strokeWidth={2.5} />
            <circle cx="132" cy="77" r="7" fill={WHITE} stroke={INK} strokeWidth={2.5} />
            <text x="120" y="68" textAnchor="middle" fontFamily="var(--font-marker), cursive" fontSize="8" fill={INK}>
              JC MIX
            </text>
            {/* buttons: the play button lights up while playing */}
            {[98, 112, 126, 140].map((x, i) => (
              <rect key={x} x={x - 5} y="106" width="10" height="8" rx="2" fill={i === 1 && playing ? RED : GREY} stroke={INK} strokeWidth={2} />
            ))}
            <path d="M108 126 L108 136 L116 131 Z" fill={playing ? YELLOW : WHITE} />
          </g>
          {/* notes pop out while playing (stepped, "on twos") */}
          <text className="note" x="70" y="30" fontSize="24" fill={RED} stroke={INK} strokeWidth={1}>
            ♪
          </text>
          <text className="note note-late" x="160" y="26" fontSize="26" fill={YELLOW} stroke={INK} strokeWidth={1}>
            ♫
          </text>
        </svg>
      </button>
      <audio ref={audio} data-boombox src={CLIP} preload="none" onEnded={() => setPlaying(false)} />
    </div>
  );
}
