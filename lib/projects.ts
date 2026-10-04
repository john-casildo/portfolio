import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {z} from 'zod';
import {routing, type AppLocale} from '@/i18n/routing';

export const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects');

const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  role: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  cover: z.string().startsWith('/'),
  repo: z.url().optional(),
  live: z.url().optional(),
  featured: z.boolean(),
  order: z.number().int(),
});

export type Project = z.infer<typeof frontmatterSchema> & {slug: string; locale: AppLocale; body: string};

const SLUG_RE = /^[a-z0-9-]+$/;
const FILE_RE = /^([a-z0-9-]+)\.([a-z]{2})\.mdx$/;

type ParseResult = {ok: true; project: Project} | {ok: false; error: string};

function entries(dir: string) {
  return fs
    .readdirSync(dir)
    .map((file) => FILE_RE.exec(file))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({slug: m[1] as string, locale: m[2] as string}));
}

function parse(dir: string, slug: string, locale: AppLocale): ParseResult {
  const raw = fs.readFileSync(path.join(dir, `${slug}.${locale}.mdx`), 'utf8');
  const {data, content} = matter(raw);
  const fm = frontmatterSchema.safeParse(data);
  if (!fm.success) return {ok: false, error: z.prettifyError(fm.error)};
  return {ok: true, project: {...fm.data, slug, locale, body: content}};
}

export function getSlugs(dir: string = CONTENT_DIR): string[] {
  return [...new Set(entries(dir).map((e) => e.slug))].sort();
}

export function validateContent(dir: string = CONTENT_DIR): void {
  const found = entries(dir);
  const problems: string[] = [];
  for (const slug of getSlugs(dir)) {
    for (const locale of routing.locales) {
      if (!found.some((e) => e.slug === slug && e.locale === locale)) {
        problems.push(`${slug}: missing ${locale}`);
        continue;
      }
      const result = parse(dir, slug, locale);
      if (!result.ok) problems.push(`${slug}.${locale}: ${result.error}`);
    }
  }
  if (problems.length > 0) throw new Error(`Invalid project content:\n${problems.join('\n')}`);
}

export function getProject(slug: string, locale: AppLocale, dir: string = CONTENT_DIR): Project | null {
  if (!SLUG_RE.test(slug)) return null;
  if (!fs.existsSync(path.join(dir, `${slug}.${locale}.mdx`))) return null;
  const result = parse(dir, slug, locale);
  if (!result.ok) throw new Error(`${slug}.${locale}: ${result.error}`);
  return result.project;
}

export function getProjects(locale: AppLocale, dir: string = CONTENT_DIR): Project[] {
  return getSlugs(dir)
    .map((slug) => getProject(slug, locale, dir))
    .filter((p): p is Project => p !== null)
    .sort((a, b) => a.order - b.order);
}
