import Image from 'next/image';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {buttonClass} from '@/components/ui/button';
import {Tape} from '@/components/zine/Tape';
import type {Project} from '@/lib/projects';

type Labels = {featured: string; viewCase: string; stack: string; live: string; liveLabel: string};

export function ProjectCard({project, labels}: {project: Project; labels: Labels}) {
  return (
    <article
      data-testid="project-card"
      data-reveal
      className={`sticker relative flex flex-col ${project.featured ? 'tilt-l md:col-span-2' : 'tilt-r'}`}
    >
      <Tape />
      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="live-badge"
          aria-label={`${labels.liveLabel}: ${project.title}`}
          className="absolute right-3 top-3 z-10 inline-flex rotate-3 items-center gap-1.5 border-2 border-ink bg-ink px-2 py-0.5 font-tag text-sm uppercase text-paper shadow-[2px_2px_0_var(--color-red)] hover:bg-red"
        >
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red" />
          </span>
          {labels.live}
        </a>
      )}
      <Image src={project.cover} alt="" width={1200} height={750} unoptimized className="aspect-[16/10] w-full border-b-[3px] border-ink object-cover" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {project.featured && <span className="w-fit -rotate-2 bg-red px-2 py-0.5 font-tag text-sm text-white">{labels.featured}</span>}
        <h3 className="text-2xl font-bold">{project.title}</h3>
        <p>{project.summary}</p>
        <ul aria-label={labels.stack} className="flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <li key={s}><Badge>{s}</Badge></li>
          ))}
        </ul>
        <Link
          href={`/projects/${project.slug}`}
          aria-label={`${labels.viewCase}: ${project.title}`}
          className={`${buttonClass('secondary')} mt-auto w-fit`}
        >
          {labels.viewCase}
        </Link>
      </div>
    </article>
  );
}
