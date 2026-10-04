import {getTranslations} from 'next-intl/server';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {ServiceIcon} from './ServiceIcon';

const KINDS = ['websites', 'webapps', 'backends'] as const;

export async function Services() {
  const t = await getTranslations('Services');
  return (
    <section id="services" data-section aria-labelledby="services-title" className="border-t-2 border-ink bg-paper/90">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading id="services" tag={t('tag')} title={t('title')} />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {KINDS.map((kind) => (
            <li key={kind} data-reveal className="rounded-2xl border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_var(--color-ink)]">
              <ServiceIcon kind={kind} />
              <h3 className="mt-4 text-2xl font-bold">{t(`${kind}.title`)}</h3>
              <p className="mt-2">{t(`${kind}.body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
