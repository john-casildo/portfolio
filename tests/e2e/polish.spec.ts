import {expect, test, type Page} from '@playwright/test';

async function wake3D(page: Page) {
  let step = 0;
  await expect(async () => {
    step++;
    await page.mouse.move(100 + step * 7, 100 + step * 5);
    await expect(page.getByTestId('bg-canvas').locator('canvas')).toBeAttached({timeout: 500});
  }).toPass();
}

test('skip link is the first tab stop and jumps to main content', async ({page, browserName}) => {
  test.skip(browserName !== 'chromium');
  await page.goto('/en');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', {name: 'Skip to content'});
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await skip.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('spanish skip link', async ({page}) => {
  await page.goto('/es');
  await expect(page.getByRole('link', {name: 'Saltar al contenido'})).toBeAttached();
});

test('mascot keeps its description after the 3D loads', async ({page}) => {
  await page.goto('/en');
  await wake3D(page);
  await expect(page.getByTestId('mascot-canvas').locator('canvas')).toBeAttached();
  await expect(page.getByRole('img', {name: /mascot/i})).toBeVisible();
});

test('logo returns to the top of the home page', async ({page}) => {
  await page.goto('/en/projects/presencia');
  await page.getByRole('link', {name: 'JC'}).click();
  await expect(page).toHaveURL(/\/en#top$/);
});

test('invalid contact submit focuses the first invalid field', async ({page}) => {
  await page.goto('/en#contact');
  const form = page.getByTestId('contact-form');
  await form.getByLabel('Email').fill('nope');
  await form.getByRole('button', {name: 'Send message'}).click();
  await expect(form.getByLabel('Name')).toBeFocused();
});

test('server 400 without field details shows the failure message', async ({page}) => {
  await page.route('**/api/contact', (route) => route.fulfill({status: 400, json: {error: 'invalid', fields: []}}));
  await page.goto('/en#contact');
  const form = page.getByTestId('contact-form');
  await form.getByLabel('Name').fill('Ana');
  await form.getByLabel('Email').fill('ana@example.com');
  await form.getByLabel('Message').fill('I need a website for my bakery.');
  await form.getByRole('button', {name: 'Send message'}).click();
  await expect(page.getByTestId('contact-failure')).toBeVisible();
});

test('OG image for an unknown locale is a 404', async ({request}) => {
  const res = await request.get('/fr/opengraph-image', {maxRedirects: 0});
  expect([307, 308, 404]).toContain(res.status());
  const followed = await request.get('/fr/opengraph-image');
  expect(followed.status()).toBe(404);
  expect((await request.get('/es/opengraph-image')).status()).toBe(200);
});
