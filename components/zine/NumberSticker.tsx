export function NumberSticker({n, className = ''}: {n: number; className?: string}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-paper font-tag text-lg leading-none ${className}`}
    >
      {n}
    </span>
  );
}
