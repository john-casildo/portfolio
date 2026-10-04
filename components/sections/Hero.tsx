import {getTranslations} from 'next-intl/server';
import {buttonClass} from '@/components/ui/button';
import {HeroMascot} from '@/components/three/HeroMascot';
import {Doodle} from '@/components/zine/Doodle';
import {NumberSticker} from '@/components/zine/NumberSticker';
import {SpiderStamp} from '@/components/zine/SpiderStamp';

export async function Hero() {
  const t = await getTranslations('Hero');
  return (
    <section id="top" data-section aria-labelledby="top-title" className="relative overflow-hidden">
      <Doodle kind="star" color="red" className="absolute left-[46%] top-10 hidden w-10 md:block" />
      <Doodle kind="x" className="absolute bottom-16 left-6 w-8" />
      <Doodle kind="spiral" className="absolute right-4 top-6 hidden w-14 sm:block" />
      <div className="relative mx-auto grid min-h-[calc(100svh-7.5rem)] max-w-6xl items-center gap-6 px-4 py-10 md:grid-cols-[1.1fr_1fr]">
        <div className="relative">
          <NumberSticker n={1} className="absolute -top-8 left-0" />
          <div className="flex items-end gap-2 pl-10">
            <p aria-hidden="true" className="-rotate-3 font-tag text-2xl">{t('tag')}</p>
            <Doodle kind="arrow-curve" className="w-12 rotate-90" />
          </div>
          <h1 id="top-title" className="ink-shadow mt-2 font-display text-[3.1rem] leading-[0.95] break-words text-red sm:text-7xl lg:text-8xl">
            {t('name')}
          </h1>
          <Doodle kind="underline" color="red" className="-mt-1 h-6 w-56" />
          <p className="mt-3 max-w-md text-lg">{t('valueProp')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#work" className={buttonClass('primary')}>{t('ctaWork')}</a>
            <a href="#contact" className={buttonClass('secondary')}>{t('ctaContact')}</a>
          </div>
        </div>
        <div data-slot="mascot" className="relative h-[55svh] md:h-[72svh]">
          <div data-stamp className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <SpiderStamp className="w-[88%] max-w-md text-red opacity-20" />
          </div>
          <HeroMascot alt={t('mascotAlt')} />
        </div>
      </div>
    </section>
  );
}
