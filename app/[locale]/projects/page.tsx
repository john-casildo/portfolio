import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getProjects} from '@/lib/projects';
import {ProjectCard} from '@/components/sections/ProjectCard';
import {featuredFirst} from '@/components/sections/ProjectsSection';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({locale, namespace: 'Projects'});
  return {
    title: `${t('allTitle')} — John Casildo`,
    description: t('allDescription'),
    alternates: {
      canonical: `/${locale}/projects`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/projects`])),
    },
  };
}

export default async function ProjectsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Projects');
  const labels = {featured: t('featured'), viewCase: t('viewCase'), stack: t('stack'), live: t('live'), liveLabel: t('liveLabel')};

  return (
    <section className="bg-paper/90">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Link href="/#work" className="inline-flex min-h-12 items-center font-medium underline">← {t('backHome')}</Link>
        <p aria-hidden="true" className="mt-6 w-fit -rotate-2 font-tag text-xl">{t('tag')}</p>
        <h1 className="red-shadow font-display text-5xl leading-none md:text-7xl">{t('allTitle')}</h1>
        <p className="mt-4 text-xl">{t('allDescription')}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {featuredFirst(getProjects(locale)).map((project) => (
            <ProjectCard key={project.slug} project={project} labels={labels} />
          ))}
        </div>
      </div>
    </section>
  );
}
