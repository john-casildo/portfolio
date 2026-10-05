import {expect, test} from '@playwright/test';

test('boombox plays the 10-second clip on click and stops on second click', async ({page}) => {
  await page.goto('/en');
  const boombox = page.getByRole('button', {name: /play music/i});
  await expect(boombox).toHaveAttribute('aria-pressed', 'false');
  const audio = page.locator('audio[data-boombox]');
  await expect(audio).toHaveAttribute('preload', 'none');

  await boombox.click();
  await expect(page.getByRole('button', {name: /stop music/i})).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => !a.paused)).toBe(true);
  const duration = await audio.evaluate((a: HTMLAudioElement) => a.duration);
  expect(duration).toBeGreaterThan(9.5);
  expect(duration).toBeLessThan(10.5);

  await page.getByRole('button', {name: /stop music/i}).click();
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
  await expect(page.getByRole('button', {name: /play music/i})).toHaveAttribute('aria-pressed', 'false');
});

test('boombox resets when the clip ends', async ({page}) => {
  await page.goto('/en');
  await page.getByRole('button', {name: /play music/i}).click();
  const audio = page.locator('audio[data-boombox]');
  // preload="none": wait until the clip's metadata has loaded before seeking.
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.duration)).toBeGreaterThan(9);
  await audio.evaluate((a: HTMLAudioElement) => {
    a.currentTime = a.duration - 0.2;
  });
  await expect(page.getByRole('button', {name: /play music/i})).toHaveAttribute('aria-pressed', 'false', {timeout: 10_000});
});

test('spanish labels', async ({page}) => {
  await page.goto('/es');
  await expect(page.getByRole('button', {name: /reproducir música/i})).toBeVisible();
});

test('the whole boombox is clickable, corners included, and it is a comfortable size', async ({page, isMobile}) => {
  await page.goto('/en');
  const art = page.locator('.boombox svg');
  await art.scrollIntoViewIfNeeded();
  const box = await art.boundingBox();
  if (!box) throw new Error('no boombox');
  expect(box.width).toBeGreaterThanOrEqual(isMobile ? 150 : 190);
  for (const [fx, fy] of [[0.04, 0.06], [0.96, 0.94], [0.96, 0.06], [0.04, 0.94]]) {
    const before = await page.locator('.boombox').getAttribute('aria-pressed');
    await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    await expect(page.locator('.boombox')).not.toHaveAttribute('aria-pressed', before ?? '');
  }
});
