import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {LocaleToggle} from './LocaleToggle';

const SECTIONS = ['services', 'work', 'about', 'contact'] as const;

export async function Header() {
  const t = await getTranslations('Nav');
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="inline-flex min-h-12 items-center font-display text-3xl leading-none">
          JC
        </Link>
        <nav aria-label={t('label')} className="hidden gap-2 md:flex">
          {SECTIONS.map((id) => (
            <Link key={id} href={`/#${id}`} className="inline-flex min-h-12 items-center px-3 font-medium hover:text-denim">
              {t(id)}
            </Link>
          ))}
        </nav>
        <LocaleToggle />
      </div>
    </header>
  );
}
