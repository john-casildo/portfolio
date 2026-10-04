import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {buttonClass} from '@/components/ui/button';
import {Doodle} from '@/components/zine/Doodle';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="ink-shadow font-display text-6xl text-red">{t('title')}</h1>
      <p className="text-lg">{t('body')}</p>
      <Doodle kind="arrow" color="red" className="w-24 rotate-180" />
      <Link href="/" className={buttonClass('primary')}>{t('cta')}</Link>
    </section>
  );
}
