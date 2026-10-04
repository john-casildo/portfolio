import {getTranslations} from 'next-intl/server';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {Tape} from '@/components/zine/Tape';
import {NumberSticker} from '@/components/zine/NumberSticker';
import {Sticker} from '@/components/zine/Sticker';
import {ThrowUp} from '@/components/zine/Graffiti';
import {ServiceIcon} from './ServiceIcon';

const KINDS = ['websites', 'webapps', 'backends'] as const;

export async function Services() {
  const t = await getTranslations('Services');
  return (
    <section id="services" data-section aria-labelledby="services-title" className="relative overflow-hidden border-t-[3px] border-ink">
      <NumberSticker n={2} className="absolute left-4 top-6" />
      <Sticker kind="eight-ball" tilt={10} className="right-4 top-6 w-20 md:right-10 md:w-32" />
      <ThrowUp text="FRESH" fill="#FF7A00" shade="#8B5CFF" tilt={6} className="bottom-4 right-8 hidden w-44 md:block" />
      <Sticker kind="crown" tilt={-12} className="bottom-8 left-6 hidden w-14 md:block" />
      <div className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading id="services" tag={t('tag')} title={t('title')} />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {KINDS.map((kind, i) => (
            <li key={kind} data-reveal className={`sticker relative p-6 ${i % 2 ? 'tilt-r' : 'tilt-l'}`}>
              <Tape />
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
