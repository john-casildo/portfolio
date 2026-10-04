import {expect, test} from '@playwright/test';

for (const [locale, services, work, about] of [
  ['en', 'Services', 'Work', 'About'],
  ['es', 'Servicios', 'Proyectos', 'Sobre mí'],
] as const) {
  test(`${locale} home renders hero and sections`, async ({page}) => {
    await page.goto(`/${locale}`);
    await expect(page.getByRole('heading', {level: 1, name: 'JOHN CASILDO'})).toBeVisible();
    await expect(page.locator('#services').getByRole('heading', {level: 2})).toHaveText(services);
    await expect(page.locator('#work').getByRole('heading', {level: 2})).toHaveText(work);
    await expect(page.locator('#about').getByRole('heading', {level: 2})).toHaveText(about);
    await expect(page.getByTestId('project-card')).toHaveCount(3);
    await expect(page.getByTestId('project-card').first()).toContainText('Presencia');
  });
}

test('hero CTA scrolls to work section', async ({page}) => {
  await page.goto('/en');
  await page.getByRole('link', {name: 'See work'}).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('#work')).toBeInViewport();
});

test.describe('phone width', () => {
  test.use({viewport: {width: 375, height: 812}});
  test('no horizontal scroll', async ({page}) => {
    for (const locale of ['en', 'es']) {
      await page.goto(`/${locale}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const h1Box = await page.getByRole('heading', {level: 1}).boundingBox();
      expect(h1Box && h1Box.x + h1Box.width).toBeLessThanOrEqual(375);
    }
  });
});
