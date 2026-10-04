import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {getProjects} from '@/lib/projects';
import {Hero} from '@/components/sections/Hero';
import {Services} from '@/components/sections/Services';
import {ProjectsSection} from '@/components/sections/ProjectsSection';
import {About} from '@/components/sections/About';
import {Contact} from '@/components/sections/Contact';
import {SectionObserver} from '@/components/SectionObserver';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Services />
      <ProjectsSection projects={getProjects(locale)} />
      <About />
      <Contact />
      <SectionObserver />
    </>
  );
}
