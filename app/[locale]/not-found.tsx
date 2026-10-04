import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {buttonClass} from '@/components/ui/button';
import {Doodle} from '@/components/zine/Doodle';
import {ThrowUp} from '@/components/zine/Graffiti';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
      <ThrowUp text="404" fill="#E10600" shade="#FFE600" tilt={-4} className="relative w-56" />
      <h1 className="ink-shadow font-display text-6xl text-red">{t('title')}</h1>
      <p className="text-lg">{t('body')}</p>
      <Doodle kind="arrow" color="red" className="w-24 rotate-180" />
      <Link href="/" className={buttonClass('primary')}>{t('cta')}</Link>
    </section>
  );
}
