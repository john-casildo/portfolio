import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {JCStamp} from '@/components/zine/JCStamp';
import {site} from '@/lib/site';
import {LocaleToggle} from './LocaleToggle';
import {MobileMenu} from './MobileMenu';

const SECTIONS = ['services', 'work', 'about', 'contact'] as const;

export async function Header() {
  const t = await getTranslations('Nav');
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-4 px-4 py-2 md:py-3">
        <Link href="/#top" aria-label={site.name} className="inline-flex min-h-12 min-w-12 items-center">
          <JCStamp rough={false} className="h-10 w-10 text-red" />
        </Link>
        <nav aria-label={t('label')} className="hidden gap-2 md:flex">
          {SECTIONS.map((id) => (
            <Link key={id} href={`/#${id}`} className="inline-flex min-h-12 items-center px-3 font-tag text-base hover:text-blood">
              {t(id)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleToggle />
          <MobileMenu
            items={SECTIONS.map((id) => ({id, label: t(id)}))}
            navLabel={t('label')}
            openLabel={t('open')}
            closeLabel={t('close')}
          />
        </div>
      </div>
    </header>
  );
}
