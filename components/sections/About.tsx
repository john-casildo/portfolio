import {getTranslations} from 'next-intl/server';
import {Badge} from '@/components/ui/Badge';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {buttonClass} from '@/components/ui/button';
import {site} from '@/lib/site';
import {TornEdge} from '@/components/zine/TornEdge';
import {ThrowUp} from '@/components/zine/Graffiti';
import {Sticker} from '@/components/zine/Sticker';
import {NumberSticker} from '@/components/zine/NumberSticker';


export async function About() {
  const t = await getTranslations('About');
  return (
    <section id="about" data-section aria-labelledby="about-title" className="relative overflow-hidden py-10">
      <NumberSticker n={4} className="absolute left-4 top-4 z-10" />
      <Sticker kind="spray-can" tilt={14} className="right-10 top-16 z-10 hidden w-24 md:block" />
      <ThrowUp text="SHIP IT" fill="#B6FF2E" shade="#00D1FF" tilt={-6} className="bottom-12 right-16 z-10 hidden w-72 md:block" />
      <div className="relative text-[#E6E1D6]">
        <TornEdge position="top" />
        <div className="bg-[#E6E1D6] text-ink">
          <div data-reveal className="mx-auto max-w-6xl px-4 py-16">
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
        </div>
        <TornEdge position="bottom" />
      </div>
    </section>
  );
}
