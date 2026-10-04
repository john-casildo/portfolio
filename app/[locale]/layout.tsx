import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {fontVariables} from '@/app/fonts';
import {Header} from '@/components/ui/Header';
import {Footer} from '@/components/ui/Footer';
import {site} from '@/lib/site';
import '@/app/globals.css';

type Props = {children: React.ReactNode; params: Promise<{locale: string}>};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({locale, namespace: 'Meta'});
  return {
    metadataBase: new URL(site.url),
    title: t('title'),
    description: t('description'),
    alternates: {canonical: `/${locale}`, languages: {en: '/en', es: '/es', 'x-default': '/en'}},
    openGraph: {title: t('title'), description: t('description'), siteName: site.name, type: 'website', locale: locale === 'es' ? 'es_ES' : 'en_US'},
  };
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <body className="bg-paper font-sans text-ink antialiased">
        <NextIntlClientProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
