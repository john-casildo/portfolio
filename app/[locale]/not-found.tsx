import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {buttonClass} from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-6xl">{t('title')}</h1>
      <p className="text-lg">{t('body')}</p>
      <Link href="/" className={buttonClass('primary')}>{t('cta')}</Link>
    </section>
  );
}
