import {getTranslations} from 'next-intl/server';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Project} from '@/lib/projects';
import {ProjectCard} from './ProjectCard';

export async function ProjectsSection({projects}: {projects: Project[]}) {
  const t = await getTranslations('Projects');
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
  const labels = {featured: t('featured'), viewCase: t('viewCase'), stack: t('stack')};
  return (
    <section id="work" data-section aria-labelledby="work-title" className="border-t-2 border-ink bg-paper/90">
      <div className="mx-auto max-w-6xl px-4 py-20">
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
