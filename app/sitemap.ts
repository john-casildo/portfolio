import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {getSlugs} from '@/lib/projects';
import {site} from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/projects', ...getSlugs().map((slug) => `/projects/${slug}`)];
  return paths.flatMap((p) =>
    routing.locales.map((locale) => ({
      url: `${site.url}/${locale}${p}`,
      alternates: {languages: Object.fromEntries(routing.locales.map((l) => [l, `${site.url}/${l}${p}`]))},
    })),
  );
}
