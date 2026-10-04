import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {JCStamp} from '@/components/zine/JCStamp';
import {LocaleToggle} from './LocaleToggle';

const SECTIONS = ['services', 'work', 'about', 'contact'] as const;

export async function Header() {
  const t = await getTranslations('Nav');
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-4 py-2 md:py-3">
        <Link href="/#top" aria-label="JC" className="inline-flex min-h-12 items-center gap-2">
          <JCStamp rough={false} className="h-9 w-9 text-red" />
          <span className="font-display text-3xl leading-none">JC</span>
        </Link>
        <nav aria-label={t('label')} className="order-last flex w-full justify-between md:order-none md:w-auto md:justify-center md:gap-2">
          {SECTIONS.map((id) => (
            <Link key={id} href={`/#${id}`} className="inline-flex min-h-12 items-center px-1 font-tag text-sm hover:text-blood sm:px-3 sm:text-base">
              {t(id)}
            </Link>
          ))}
        </nav>
        <LocaleToggle />
      </div>
    </header>
  );
}
