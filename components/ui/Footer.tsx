import {getTranslations} from 'next-intl/server';
import {site} from '@/lib/site';

// Contact links live once, in the contact section; the footer stays minimal.
export async function Footer() {
  const t = await getTranslations('Footer');
  return (
    <footer className="border-t-2 border-ink bg-paper px-4 py-8 text-sm">
      <div className="mx-auto max-w-6xl">
        <p>© {new Date().getFullYear()} {site.name}. {t('rights')}</p>
      </div>
    </footer>
  );
}
