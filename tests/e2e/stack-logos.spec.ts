import {expect, test} from '@playwright/test';

// Smooth scrolling (html { scroll-behavior: smooth }) can leave the page mid-scroll when a test measures
// positions under load; jump instantly instead.
test.beforeEach(async ({page}) => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important'));
  });
});

const STACK = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'FastAPI', 'Docker', 'SwiftUI', 'Jetpack Compose', 'Figma'];

test('about shows a logo for every tool, each with its name for screen readers', async ({page}) => {
  await page.goto('/en');
  const list = page.locator('#about').getByRole('list', {name: 'Tools I use'});
  await list.scrollIntoViewIfNeeded();
  for (const name of STACK) {
    const logo = list.getByRole('img', {name});
    await expect(logo).toBeVisible();
    await expect(logo.locator('path')).toHaveCount(1);
  }
  await expect(list.locator('li')).toHaveCount(STACK.length);
});

test('hovering a logo shows its name', async ({page, isMobile}) => {
  test.skip(isMobile, 'hover only');
  await page.goto('/en');
  const tile = page.locator('#about li').filter({has: page.getByRole('img', {name: 'Docker'})});
  await tile.scrollIntoViewIfNeeded();
  await tile.hover();
  await expect(tile.getByText('Docker', {exact: true})).toBeVisible();
});
