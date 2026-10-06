import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {MDXRemote} from 'next-mdx-remote/rsc';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getProject, getProjects, getSlugs, validateContent} from '@/lib/projects';
import {Badge} from '@/components/ui/Badge';
import {Tape} from '@/components/zine/Tape';
import {buttonClass} from '@/components/ui/button';
import {mdxComponents} from '@/components/mdx';

type Params = {locale: string; slug: string};

export function generateStaticParams(): Params[] {
  validateContent();
  return routing.locales.flatMap((locale) => getSlugs().map((slug) => ({locale, slug})));
}

export async function generateMetadata({params}: {params: Promise<Params>}): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const project = getProject(slug, locale);
  if (!project) return {};
  return {
    title: `${project.title} — John Casildo`,
    description: project.summary,
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/projects/${slug}`])),
    },
  };
}

export default async function ProjectPage({params}: {params: Promise<Params>}) {
  const {locale, slug} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const project = getProject(slug, locale);
  if (!project) notFound();

  const t = await getTranslations('Case');
  const all = getProjects(locale);
  const next = all[(all.findIndex((p) => p.slug === slug) + 1) % all.length];

  return (
    <article className="bg-paper/90">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/#work" className="inline-flex min-h-12 items-center font-medium underline">← {t('back')}</Link>
        <h1 className="mt-4 font-display text-5xl leading-none md:text-7xl">{project.title}</h1>
        <p className="mt-4 text-xl">{project.summary}</p>
        <Image src={project.cover} alt="" width={1200} height={750} unoptimized priority className="mt-8 w-full rounded-2xl border-2 border-ink" />
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div><dt className="font-bold">{t('role')}</dt><dd>{project.role}</dd></div>
          <div>
            <dt className="font-bold">{t('stack')}</dt>
            <dd className="mt-1 flex flex-wrap gap-2">{project.stack.map((s) => <Badge key={s}>{s}</Badge>)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          {project.live && <a href={project.live} target="_blank" rel="noopener noreferrer" className={buttonClass('primary')}>{t('live')}</a>}
          {project.repo && <a href={project.repo} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary')}>{t('repo')}</a>}
        </div>
        <div className="mt-4">
          <MDXRemote source={project.body} components={mdxComponents} />
        </div>
        <aside data-testid="case-cta" className="sticker tilt-l relative mt-14 p-6">
          <Tape />
          <p className="font-tag text-lg">{t('ctaTag')}</p>
          <h2 className="ink-shadow mt-1 font-display text-4xl leading-none text-red">{t('ctaTitle')}</h2>
          <p className="mt-3 text-lg">{t('ctaText')}</p>
          <Link href="/#contact" className={`${buttonClass('primary')} mt-5`}>
            {t('ctaButton')} →
          </Link>
        </aside>
        {next && next.slug !== slug && (
          <Link href={`/projects/${next.slug}`} className={`${buttonClass('primary')} mt-12`}>
            {t('next')}: {next.title} →
          </Link>
        )}
      </div>
    </article>
  );
}
