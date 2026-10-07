import path from 'node:path';
import {describe, expect, test} from 'vitest';
import {getProject, getProjects, getSlugs, validateContent} from '@/lib/projects';

const fixtures = (name: string) => path.join(__dirname, '..', 'fixtures', 'projects', name);

describe('project loader', () => {
  test('lists unique slugs', () => {
    expect(getSlugs(fixtures('good'))).toEqual(['alpha', 'beta']);
  });

  test('getProjects returns localized projects sorted by order', () => {
    const projects = getProjects('es', fixtures('good'));
    expect(projects.map((p) => p.slug)).toEqual(['beta', 'alpha']);
    expect(projects[1]).toMatchObject({title: 'Alfa', locale: 'es', featured: true});
    expect(projects[1]?.body).toContain('Cuerpo alfa');
  });

  test('getProject returns null for unknown or unsafe slugs', () => {
    expect(getProject('nope', 'en', fixtures('good'))).toBeNull();
    expect(getProject('../good/alpha', 'en', fixtures('good'))).toBeNull();
  });

  test('validateContent accepts complete content', () => {
    expect(() => validateContent(fixtures('good'))).not.toThrow();
  });

  test('validateContent reports a missing locale', () => {
    expect(() => validateContent(fixtures('missing-locale'))).toThrow(/gamma: missing es/);
  });

  test('validateContent reports invalid frontmatter with file name', () => {
    expect(() => validateContent(fixtures('bad-frontmatter'))).toThrow(/delta\.es/);
  });

  test('real content is valid and Presencia is the featured project', () => {
    expect(() => validateContent()).not.toThrow();
    const en = getProjects('en');
    expect(en.map((p) => p.slug).sort()).toEqual(['encore', 'maruchan-university', 'mynursedex', 'presencia', 'stub']);
    expect(en.filter((p) => p.featured).map((p) => p.slug)).toEqual(['presencia']);
  });
});
