export function Tape({className = ''}: {className?: string}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 border border-ink/20 bg-white/60 shadow-sm ${className}`}
    />
  );
}
