import {getTranslations} from 'next-intl/server';
import {buttonClass} from '@/components/ui/button';
import {HeroMascot} from '@/components/three/HeroMascot';

export async function Hero() {
  const t = await getTranslations('Hero');
  return (
    <section id="top" data-section aria-labelledby="top-title" className="relative">
      <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-6xl items-center gap-6 px-4 py-10 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-ink bg-paper/95 p-6 shadow-[6px_6px_0_var(--color-ink)] md:p-8">
          <p aria-hidden="true" className="font-tag text-2xl text-denim">{t('tag')}</p>
          <h1 id="top-title" className="font-display text-5xl leading-[0.95] break-words sm:text-7xl lg:text-8xl">
            {t('name')}
          </h1>
          <p className="mt-4 max-w-md text-lg">{t('valueProp')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#work" className={buttonClass('primary')}>{t('ctaWork')}</a>
            <a href="#contact" className={buttonClass('secondary')}>{t('ctaContact')}</a>
          </div>
        </div>
        <div data-slot="mascot" className="relative h-[45svh] md:h-[70svh]">
          <HeroMascot alt={t('mascotAlt')} />
        </div>
      </div>
    </section>
  );
}
