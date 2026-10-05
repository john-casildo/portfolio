import {expect, test} from '@playwright/test';

for (const [locale, services, work, about, contact] of [
  ['en', 'Services', 'Work', 'About', "Let's talk"],
  ['es', 'Servicios', 'Proyectos', 'Sobre mí', 'Hablemos'],
] as const) {
  test(`${locale} home renders hero and sections`, async ({page}) => {
    await page.goto(`/${locale}`);
    await expect(page.getByRole('heading', {level: 1, name: 'JOHN CASILDO'})).toBeVisible();
    await expect(page.locator('#services').getByRole('heading', {level: 2})).toHaveText(services);
    await expect(page.locator('#work').getByRole('heading', {level: 2})).toHaveText(work);
    await expect(page.locator('#about').getByRole('heading', {level: 2})).toHaveText(about);
    await expect(page.locator('#contact').getByRole('heading', {level: 2})).toHaveText(contact);
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
  for (const [locale, contact] of [['en', 'Contact'], ['es', 'Contacto']] as const) {
    test(`${locale} section nav is reachable on phones`, async ({page}) => {
      await page.goto(`/${locale}`);
      const toggle = page.getByRole('button', {name: /menu|menú/i});
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('dialog').getByRole('link').first()).toBeFocused();
      const link = page.getByRole('dialog').getByRole('link', {name: contact});
      await link.click();
      await expect(page).toHaveURL(/#contact$/);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('menu closes on Escape and returns focus to the button', async ({page}) => {
    await page.goto('/en');
    const toggle = page.getByRole('button', {name: /menu/i});
    await toggle.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(toggle).toBeFocused();
  });

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
