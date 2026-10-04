import {getTranslations} from 'next-intl/server';
import {buttonClass} from '@/components/ui/button';
import {Avatar} from '@/components/avatar/Avatar';
import {Boombox} from '@/components/zine/Boombox';
import {Doodle} from '@/components/zine/Doodle';
import {NumberSticker} from '@/components/zine/NumberSticker';
import {JCStamp} from '@/components/zine/JCStamp';
import {Sticker} from '@/components/zine/Sticker';

export async function Hero() {
  const t = await getTranslations('Hero');
  return (
    <section id="top" data-section aria-labelledby="top-title" className="relative overflow-hidden">
      <Doodle kind="star" color="red" className="absolute left-[46%] top-10 hidden w-10 md:block" />
      <Doodle kind="x" className="absolute bottom-16 left-6 w-8" />
      <Sticker kind="star" tilt={12} className="bottom-8 left-[44%] hidden w-12 md:block" />
      <Doodle kind="spiral" className="absolute right-4 top-6 hidden w-14 sm:block" />
      <div className="relative mx-auto grid min-h-[calc(100svh-7.5rem)] max-w-6xl items-center gap-6 px-4 py-10 md:grid-cols-[1.1fr_1fr]">
        <div className="relative">
          <NumberSticker n={1} className="absolute -top-8 left-0" />
          <Sticker kind="bubble-jc" tilt={-8} className="-top-16 right-0 hidden w-40 lg:block" />
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
          {/* Poster layout: emblem off to the left so the JC reads beside the avatar, not hidden behind it. */}
          <div data-stamp className="pointer-events-none absolute inset-y-0 left-0 flex w-[70%] items-center">
            <JCStamp className="w-full text-red opacity-35" />
          </div>
          <div className="absolute inset-y-0 right-0 w-[64%]">
            <Avatar label={t('mascotAlt')} />
          </div>
          <Boombox playLabel={t('boomboxPlay')} stopLabel={t('boomboxStop')} className="bottom-2 left-0 w-28 sm:w-36" />
          <p aria-hidden="true" className="pointer-events-none absolute left-1 top-2 flex rotate-[-6deg] items-center gap-1 font-tag text-lg">
            {t('tapHint')}
            <Doodle kind="arrow" className="h-6 w-10 rotate-[20deg]" />
          </p>
        </div>
      </div>
    </section>
  );
}
