import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {buttonClass} from '@/components/ui/button';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Project} from '@/lib/projects';
import {Doodle} from '@/components/zine/Doodle';
import {NumberSticker} from '@/components/zine/NumberSticker';
import {Sticker} from '@/components/zine/Sticker';
import {ProjectCard} from './ProjectCard';

// Featured projects first, then the rest in their content order.
export function featuredFirst(projects: Project[]): Project[] {
  return [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
}

// The home page shows the first `limit` projects and links to /projects for the rest.
export async function ProjectsSection({projects, limit}: {projects: Project[]; limit?: number}) {
  const t = await getTranslations('Projects');
  const ordered = featuredFirst(projects);
  const shown = limit ? ordered.slice(0, limit) : ordered;
  const labels = {featured: t('featured'), viewCase: t('viewCase'), stack: t('stack')};
  return (
    <section id="work" data-section aria-labelledby="work-title" className="relative overflow-hidden border-t-[3px] border-ink">
      <NumberSticker n={3} className="absolute left-4 top-6" />
      <Doodle kind="circle-scribble" color="red" className="absolute left-[38%] top-8 hidden w-24 md:block" />
      <div aria-hidden="true" className="halftone pointer-events-none absolute -right-10 top-24 h-56 w-56 rounded-full opacity-15" />
      <Sticker kind="stop" tilt={-8} className="right-4 top-6 w-20 md:right-12 md:w-36" />
      <Sticker kind="heart" tilt={10} className="bottom-6 right-[30%] hidden w-12 md:block" />
      <div className="relative mx-auto max-w-6xl px-4 py-20">
        <SectionHeading id="work" tag={t('tag')} title={t('title')} />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {shown.map((project) => (
            <ProjectCard key={project.slug} project={project} labels={labels} />
          ))}
        </div>
        {shown.length < ordered.length && (
          <Link href="/projects" data-testid="view-all-projects" className={`${buttonClass('primary')} mt-10`}>
            {t('viewAll', {count: ordered.length})} →
          </Link>
        )}
      </div>
    </section>
  );
}
