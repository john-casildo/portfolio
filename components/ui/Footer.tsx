import {getTranslations} from 'next-intl/server';
import {site} from '@/lib/site';
import {SocialLinks} from '@/components/ui/SocialLinks';

export async function Footer() {
  const t = await getTranslations('Footer');
  return (
    <footer className="border-t-2 border-ink bg-paper px-4 py-8 text-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} {site.name}. {t('rights')}</p>
        <div className="flex flex-wrap items-center gap-4">
          <a href={`mailto:${site.email}`} className="inline-flex min-h-12 items-center px-2 underline">{site.email}</a>
          <SocialLinks size="sm" />
        </div>
      </div>
    </footer>
  );
}
