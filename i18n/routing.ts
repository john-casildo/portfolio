import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // hreflang alternates come from page metadata (consistent with canonical URLs)
  alternateLinks: false,
});

export type AppLocale = (typeof routing.locales)[number];
