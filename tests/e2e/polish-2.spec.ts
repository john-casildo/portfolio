import {expect, test, type Page} from '@playwright/test';

async function wake3D(page: Page) {
  let step = 0;
  await expect(async () => {
    step++;
    await page.mouse.move(100 + step * 7, 100 + step * 5);
    await expect(page.getByTestId('mascot-canvas').locator('canvas')).toBeAttached({timeout: 500});
  }).toPass();
}

test('a WebGL context lost for good falls back to the still image', async ({page}) => {
  await page.goto('/en');
  await wake3D(page);
  await page.waitForTimeout(500);
  await page.getByTestId('mascot-canvas').locator('canvas').evaluate((c: HTMLCanvasElement) => {
    c.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
  });
  await expect(page.getByTestId('hero-fallback')).toBeVisible({timeout: 4000});
  await expect(page.getByTestId('mascot-canvas')).toHaveCount(0);
});

test('ticker loops seamlessly: the track is exactly two identical halves', async ({page}) => {
  await page.goto('/en');
  const [half, firstHalf] = await page.getByTestId('ticker').first().locator('.ticker-track').evaluate((track) => {
    const spans = Array.from(track.children) as HTMLElement[];
    const n = spans.length / 2;
    const sum = spans.slice(0, n).reduce((acc, s) => acc + s.getBoundingClientRect().width, 0);
    return [track.getBoundingClientRect().width / 2, sum];
  });
  expect(Math.abs(half - firstHalf)).toBeLessThan(1);
});

test('reduced motion keeps the sticker tilt', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/en');
  const card = page.locator('#services li').first();
  await card.scrollIntoViewIfNeeded();
  const transform = await card.evaluate((el) => getComputedStyle(el).transform);
  expect(transform).not.toBe('none');
});

test('root 404 uses the zine palette', async ({page}) => {
  const res = await page.goto('/missing.page');
  expect(res?.status()).toBe(404);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(242, 239, 232)');
});
