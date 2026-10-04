import {getTranslations} from 'next-intl/server';
import {Badge} from '@/components/ui/Badge';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {buttonClass} from '@/components/ui/button';
import {site} from '@/lib/site';

export async function About() {
  const t = await getTranslations('About');
  return (
    <section id="about" data-section aria-labelledby="about-title" className="border-t-2 border-ink bg-paper/90">
      <div data-reveal className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading id="about" tag={t('tag')} title={t('title')} />
        <p className="mt-6 max-w-2xl text-lg">{t('bio')}</p>
        <h3 className="mt-8 font-bold">{t('stackTitle')}</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {site.stack.map((s) => (
            <li key={s}><Badge>{s}</Badge></li>
          ))}
        </ul>
        <a href={site.github} target="_blank" rel="noopener noreferrer" className={`${buttonClass('secondary')} mt-8`}>
          {t('github')}
        </a>
      </div>
    </section>
  );
}
