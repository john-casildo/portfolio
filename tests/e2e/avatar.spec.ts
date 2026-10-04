import {expect, test} from '@playwright/test';

test('avatar sticker: click cycles poses, no 3D on the page', async ({page}) => {
  await page.goto('/en');
  const avatar = page.getByRole('button', {name: /John.*change pose/i});
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute('data-pose', 'crossed');
  await avatar.click();
  await expect(avatar).toHaveAttribute('data-pose', 'facepalm');
  await avatar.press('Enter');
  await expect(avatar).toHaveAttribute('data-pose', 'thinking');
  await avatar.click();
  await expect(avatar).toHaveAttribute('data-pose', 'peace');
  await avatar.click();
  await expect(avatar).toHaveAttribute('data-pose', 'crossed');
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('pupils follow the cursor', async ({page, isMobile}) => {
  test.skip(isMobile, 'pointer only');
  await page.goto('/en');
  const pupil = page.locator('[data-pupil]').first();
  await expect(pupil).toBeAttached();
  const box = await page.getByRole('button', {name: /change pose/i}).boundingBox();
  if (!box) throw new Error('no avatar');
  const pupilX = () => pupil.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);
  // Keep nudging inside the viewport: the first move can land before hydration attaches the listener.
  let n = 0;
  await expect(async () => {
    await page.mouse.move(1270 - (n++ % 3), box.y + 60);
    expect(await pupilX()).toBeGreaterThan(1);
  }).toPass({timeout: 5000});
  await expect(async () => {
    await page.mouse.move(10 + (n++ % 3), box.y + 60);
    expect(await pupilX()).toBeLessThan(-1);
  }).toPass({timeout: 5000});
});

test('reduced motion keeps the pupils centered', async ({page, isMobile}) => {
  test.skip(isMobile, 'pointer only');
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/en');
  await page.mouse.move(1200, 100);
  await page.waitForTimeout(300);
  const x = await page.locator('[data-pupil]').first().evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);
  expect(x).toBe(0);
});

test('spanish label', async ({page}) => {
  await page.goto('/es');
  await expect(page.getByRole('button', {name: /cambiar pose/i})).toBeVisible();
});
