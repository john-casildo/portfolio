export function Badge({children}: {children: React.ReactNode}) {
  return (
    <span className="inline-flex items-center rounded-full border-2 border-ink bg-paper px-3 py-1 text-sm font-medium">
      {children}
    </span>
  );
}
