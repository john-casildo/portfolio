import {expect, test} from '@playwright/test';

test('graffiti wall band with pieces and tags, decorative', async ({page}) => {
  await page.goto('/en');
  const wall = page.getByTestId('graffiti-wall');
  await expect(wall).toHaveAttribute('aria-hidden', 'true');
  await wall.scrollIntoViewIfNeeded();
  expect(await wall.locator('[data-graffiti]').count()).toBeGreaterThanOrEqual(5);
  await expect(wall.locator('[data-graffiti="throwup"]').first()).toBeVisible();
  await expect(wall.locator('[data-graffiti="tag"]').first()).toBeVisible();
});

test('desktop sections carry throw-ups', async ({page, isMobile}) => {
  test.skip(isMobile);
  await page.goto('/en');
  for (const text of ['HIRE ME', 'PURA VIDA', 'FRESH']) {
    await expect(page.locator(`main [data-graffiti][data-text="${text}"]`)).toHaveCount(1);
  }
});

test('404 gets a throw-up', async ({page}) => {
  await page.goto('/en/nope');
  await expect(page.locator('[data-graffiti][data-text="404"]')).toBeVisible();
});
