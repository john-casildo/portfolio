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
  await page.locator('audio[data-boombox]').evaluate((a: HTMLAudioElement) => {
    a.currentTime = a.duration - 0.2;
  });
  await expect(page.getByRole('button', {name: /play music/i})).toHaveAttribute('aria-pressed', 'false', {timeout: 3000});
});

test('spanish labels', async ({page}) => {
  await page.goto('/es');
  await expect(page.getByRole('button', {name: /reproducir música/i})).toBeVisible();
});
