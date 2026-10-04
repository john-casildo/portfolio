const TEETH = 24;
const points = Array.from({length: TEETH + 1}, (_, i) => `${(i / TEETH) * 100},${i % 2 === 0 ? 0 : 100}`).join(' ');

/** Zigzag torn-paper strip; inherits the panel color via `currentColor`. */
export function TornEdge({position, className = ''}: {position: 'top' | 'bottom'; className?: string}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`pointer-events-none block h-3 w-full ${position === 'top' ? 'rotate-180' : ''} ${className}`}
    >
      <polygon points={`0,0 ${points} 100,0`} fill="currentColor" />
    </svg>
  );
}
