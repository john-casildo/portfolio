import {getTranslations} from 'next-intl/server';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Project} from '@/lib/projects';
import {Doodle} from '@/components/zine/Doodle';
import {NumberSticker} from '@/components/zine/NumberSticker';
import {ProjectCard} from './ProjectCard';

export async function ProjectsSection({projects}: {projects: Project[]}) {
  const t = await getTranslations('Projects');
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
  const labels = {featured: t('featured'), viewCase: t('viewCase'), stack: t('stack')};
  return (
    <section id="work" data-section aria-labelledby="work-title" className="relative overflow-hidden border-t-[3px] border-ink">
      <NumberSticker n={3} className="absolute left-4 top-6" />
      <Doodle kind="circle-scribble" color="red" className="absolute left-[38%] top-8 hidden w-24 md:block" />
      <div aria-hidden="true" className="halftone pointer-events-none absolute -right-10 top-24 h-56 w-56 rounded-full opacity-15" />
      <div className="relative mx-auto max-w-6xl px-4 py-20">
        <SectionHeading id="work" tag={t('tag')} title={t('title')} />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ordered.map((project) => (
            <ProjectCard key={project.slug} project={project} labels={labels} />
          ))}
        </div>
      </div>
    </section>
  );
}
