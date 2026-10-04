'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {buttonClass} from './button';

export function LocaleToggle() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const other = locale === 'en' ? 'es' : 'en';

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      aria-label={t('switchLabel')}
      data-testid="locale-toggle"
      className={buttonClass('secondary')}
    >
      {t('switchTo')}
    </Link>
  );
}
