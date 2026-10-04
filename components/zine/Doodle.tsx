type Kind = 'arrow' | 'arrow-curve' | 'circle-scribble' | 'star' | 'x' | 'spiral' | 'crown' | 'zigzag' | 'underline';

const PATHS: Record<Kind, string[]> = {
  arrow: ['M8 60 C30 40 55 38 88 42', 'M74 30 L90 42 L76 54'],
  'arrow-curve': ['M10 85 C20 30 70 15 88 30', 'M74 22 L89 31 L80 46'],
  'circle-scribble': ['M50 10 C80 8 95 35 88 60 C80 88 40 95 18 75 C2 58 10 22 40 12 C60 6 85 18 92 30'],
  star: ['M50 8 L61 38 L94 40 L68 60 L77 92 L50 74 L23 92 L32 60 L6 40 L39 38 Z'],
  x: ['M20 20 L80 80', 'M80 18 L22 82'],
  spiral: ['M50 50 C54 46 58 52 54 57 C48 63 40 55 43 47 C47 36 62 36 66 48 C71 63 56 74 42 70 C24 64 26 38 42 30 C62 20 82 36 80 58'],
  crown: ['M12 72 L20 30 L38 52 L50 20 L62 52 L80 30 L88 72 Z'],
  zigzag: ['M5 60 L20 40 L35 60 L50 40 L65 60 L80 40 L95 60'],
  underline: ['M5 55 C30 47 60 65 95 50', 'M12 70 C40 62 70 76 90 68'],
};

export function Doodle({kind, color = 'ink', className = ''}: {kind: Kind; color?: 'ink' | 'red'; className?: string}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none ${color === 'red' ? 'text-red' : 'text-ink'} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[kind].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
