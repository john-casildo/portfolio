export function Badge({children}: {children: React.ReactNode}) {
  return (
    <span className="inline-flex items-center rounded-sm border-2 border-ink bg-paper px-2.5 py-0.5 font-tag text-sm">
      {children}
    </span>
  );
}
