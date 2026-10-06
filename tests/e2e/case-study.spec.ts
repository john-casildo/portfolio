import {expect, test} from '@playwright/test';

const SLUGS = ['presencia', 'maruchan-university', 'stub'];

for (const locale of ['en', 'es']) {
  for (const slug of SLUGS) {
    test(`${locale}/${slug} renders`, async ({page}) => {
      const res = await page.goto(`/${locale}/projects/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.getByRole('heading', {level: 1})).toBeVisible();
      await expect(page.getByRole('heading', {level: 2}).first()).toBeVisible();
    });
  }
}

test('project card opens case study, toggle keeps the project', async ({page}) => {
  await page.goto('/en');
  await page.getByRole('link', {name: /View case study: Presencia/}).click();
  await expect(page).toHaveURL(/\/en\/projects\/presencia$/);
  await expect(page.getByRole('heading', {level: 2, name: 'Problem'})).toBeVisible();
  await page.getByTestId('locale-toggle').click();
  await expect(page).toHaveURL(/\/es\/projects\/presencia$/);
  await expect(page.getByRole('heading', {level: 2, name: 'Problema'})).toBeVisible();
});

for (const path of ['/en/projects/nope', '/es/whatever/deep', '/en/projects/..%2Fsecret']) {
  test(`${path} is a styled 404`, async ({page}) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', {name: 'GAME OVER'})).toBeVisible();
  });
}

test('sitemap lists both locales and projects', async ({request}) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain('/es/projects/presencia');
  expect(xml).toContain('/en</loc>');
});

test('home has localized metadata', async ({page}) => {
  await page.goto('/es');
  await expect(page).toHaveTitle(/Sitios y aplicaciones web/);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
});

test('case study ends with a call to action to the contact section', async ({page}) => {
  await page.goto('/es/projects/presencia');
  const cta = page.getByTestId('case-cta');
  await expect(cta.getByRole('heading', {name: 'Construyamos el tuyo'})).toBeVisible();
  await cta.getByRole('link', {name: /Hablemos/}).click();
  await expect(page).toHaveURL(/\/es#contact$/);
  await expect(page.locator('#contact').getByTestId('social-whatsapp')).toBeVisible();
});
