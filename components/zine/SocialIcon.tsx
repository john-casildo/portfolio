export type SocialKind = 'whatsapp' | 'linkedin' | 'x' | 'github' | 'email' | 'resume';

const INK = '#0B0B0B';
// `currentColor` is the accent (red at rest, ink on hover); inner marks stay paper.
const ACCENT = 'currentColor';
const PAPER = '#F2EFE8';

const line = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round'} as const;
const thin = {...line, strokeWidth: 2} as const;

const ART: Record<SocialKind, React.ReactNode> = {
  resume: (
    <>
      <path d="M10 5 H30 L39 14 V43 H10 Z" fill={PAPER} {...line} />
      <path d="M30 5 V14 H39 Z" fill={ACCENT} {...line} />
      <path d="M15 20 H27 M15 26 H33 M15 32 H33 M15 38 H24" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx="35" cy="38" r="7" fill={ACCENT} {...line} strokeWidth={2.5} />
      <path d="M32 38 L34.5 40.5 L38.5 35.5" fill="none" stroke={PAPER} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M9 42 L12.5 31 L21 37 Z" fill={ACCENT} {...line} />
      <circle cx="25" cy="23" r="16" fill={ACCENT} {...line} />
      <path
        transform="translate(25 23) scale(0.6) translate(-27 -25)"
        d="M17 15 c2-2 4-1 5 1 l2 4 c1 2 0 3-1 4 c1 3 3 5 6 6 c1-1 2-2 4-1 l4 2 c2 1 3 3 1 5 c-2 3-6 4-10 2 c-6-3-10-7-13-13 c-2-4-1-8 2-10z"
        fill={PAPER}
        {...line}
        strokeWidth={4}
      />
    </>
  ),
  linkedin: (
    <>
      <rect x="6" y="6" width="36" height="36" rx="7" fill={ACCENT} {...line} />
      <circle cx="15.5" cy="15.5" r="3.2" fill={PAPER} {...thin} />
      <rect x="12.5" y="21" width="6" height="15" rx="1" fill={PAPER} {...thin} />
      <path d="M22 36 V21 h5.5 v2.5 c1.5-2 3.5-3 6-3 c4 0 5.5 2.6 5.5 7 V36 h-6 v-8 c0-2-.8-3-2.4-3 c-1.8 0-2.6 1.2-2.6 3.2 V36 Z" fill={PAPER} {...thin} />
    </>
  ),
  x: (
    <>
      <path d="M7 8 H18 L41 40 H30 Z" fill={ACCENT} {...line} strokeWidth={2.5} />
      <path d="M39 8 L28.5 20 M19.5 28.5 L9 40" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </>
  ),
  github: (
    <path
      d="M24 7 c-9.4 0-17 7.6-17 17 c0 7.5 4.9 13.9 11.6 16.1 v-5.3 c-4.4 1-5.4-2-5.4-2 c-.9-2.1-2.1-2.7-2.1-2.7 c-1.5-1.1.1-1 .1-1 c1.6.1 2.5 1.7 2.5 1.7 c1.4 2.4 3.8 1.7 4.7 1.3 c.1-1 .6-1.7 1-2.1 c-3.6-.4-7.3-1.8-7.3-7.9 c0-1.8.6-3.2 1.7-4.4 c-.2-.4-.7-2 .2-4.3 c0 0 1.4-.4 4.5 1.7 a15.5 15.5 0 0 1 8.2 0 c3.1-2.1 4.5-1.7 4.5-1.7 c.9 2.2.3 3.9.2 4.3 c1.1 1.2 1.7 2.6 1.7 4.4 c0 6.1-3.7 7.5-7.3 7.9 c.6.5 1.1 1.5 1.1 3 v5.8 c6.7-2.2 11.6-8.6 11.6-16.1 c0-9.4-7.6-17-17-17 Z"
      fill={ACCENT}
      {...line}
      strokeWidth={2.5}
    />
  ),
  email: (
    <>
      <rect x="6" y="12" width="36" height="25" rx="3" fill={PAPER} {...line} />
      <path d="M7.5 13.5 L24 28 L40.5 13.5 Z" fill={ACCENT} {...line} />
    </>
  ),
};

/** Hand-inked social glyph in the zine palette. Decorative: the link carries the accessible name. */
export function SocialIcon({kind, size = 28}: {kind: SocialKind; size?: number}) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="overflow-visible">
      {ART[kind]}
    </svg>
  );
}
