import {getTranslations, setRequestLocale} from 'next-intl/server';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Hero');
  return <h1 className="px-4 py-20 font-display text-6xl">{t('name')}</h1>;
}
