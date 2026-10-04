import {
  siDocker,
  siFastapi,
  siJetpackcompose,
  siNextdotjs,
  siPostgresql,
  siReact,
  siSupabase,
  siSwift,
  siTailwindcss,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons';

/** Official logos (Simple Icons, CC0) keyed by the names in `site.stack`. SwiftUI uses the Swift mark. */
const ICONS: Record<string, SimpleIcon> = {
  'Next.js': siNextdotjs,
  React: siReact,
  TypeScript: siTypescript,
  'Tailwind CSS': siTailwindcss,
  Supabase: siSupabase,
  PostgreSQL: siPostgresql,
  FastAPI: siFastapi,
  Docker: siDocker,
  SwiftUI: siSwift,
  'Jetpack Compose': siJetpackcompose,
};

/** Tool logos as tilted sticker tiles; names show on hover (desktop) or under each logo (phones). */
export function StackLogos({items, label}: {items: readonly string[]; label: string}) {
  return (
    <ul aria-label={label} className="mt-4 flex flex-wrap gap-x-4 gap-y-5">
      {items.map((name, i) => {
        const icon = ICONS[name];
        if (!icon) return null;
        return (
          <li key={name} className={`group relative flex w-16 flex-col items-center ${i % 2 ? 'rotate-3' : '-rotate-3'}`}>
            <span className="sticker flex h-16 w-16 items-center justify-center rounded-xl bg-white transition-transform duration-150 group-hover:-translate-y-1 group-hover:rotate-0 motion-reduce:transition-none">
              <svg role="img" aria-label={name} viewBox="0 0 24 24" className="h-9 w-9" fill={`#${icon.hex}`}>
                <path d={icon.path} />
              </svg>
            </span>
            <span
              aria-hidden="true"
              className="mt-2 whitespace-nowrap text-center font-tag text-[11px] leading-tight md:invisible md:absolute md:left-1/2 md:top-full md:z-10 md:-translate-x-1/2 md:rounded-sm md:bg-ink md:px-2 md:py-0.5 md:text-xs md:text-paper md:group-hover:visible"
            >
              {name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
