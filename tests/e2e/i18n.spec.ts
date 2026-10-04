import {expect, test} from '@playwright/test';

test.describe('English browser', () => {
  test.use({locale: 'en-US'});
  test('/ redirects to /en', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('Spanish browser', () => {
  test.use({locale: 'es-MX'});
  test('/ redirects to /es', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/es$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});

test('locale toggle switches language', async ({page}) => {
  await page.goto('/en');
  await page.getByTestId('locale-toggle').click();
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByTestId('locale-toggle')).toHaveText('EN');
});
