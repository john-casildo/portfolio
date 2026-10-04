import {expect, test, type Page} from '@playwright/test';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

/** Moves the pointer until the deferred 3D mounts (the first move can land before hydration). */
async function wake3D(page: Page) {
  let step = 0;
  await expect(async () => {
    step++;
    await page.mouse.move(100 + step * 7, 100 + step * 5);
    await expect(page.getByTestId('bg-canvas').locator('canvas')).toBeAttached({timeout: 500});
  }).toPass();
}

async function disableWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.includes('webgl')) return null;
      return Reflect.apply(original, this, [type, ...rest]);
    } as typeof original;
  });
}

test('3D waits for the first interaction, showing static art until then', async ({page}) => {
  await page.goto('/en');
  await expect(page.getByTestId('hero-fallback')).toBeVisible();
  await expect(page.getByTestId('bg-fallback')).toBeAttached();
  await page.waitForTimeout(1500);
  await expect(page.getByTestId('bg-canvas')).toHaveCount(0);
  await expect(page.getByTestId('mascot-canvas')).toHaveCount(0);
  await wake3D(page);
  await expect(page.getByTestId('mascot-canvas').locator('canvas')).toBeAttached();
});

test('background canvas renders without errors', async ({page}) => {
  const errors = collectErrors(page);
  await page.goto('/en');
  await wake3D(page);
  await expect(page.getByTestId('mascot-canvas').locator('canvas')).toBeAttached();
  await page.mouse.move(400, 300);
  await page.locator('#work').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test('without WebGL the static pattern shows and content is readable', async ({page}) => {
  const errors = collectErrors(page);
  await disableWebGL(page);
  await page.goto('/en');
  await expect(page.getByTestId('bg-fallback')).toBeAttached();
  await expect(page.getByTestId('bg-canvas')).toHaveCount(0);
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  const fallback = page.getByTestId('hero-fallback');
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute('alt', /mascot/i);
  expect(await fallback.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(errors).toEqual([]);
});

test('reduced motion renders a still frame without errors', async ({page}) => {
  const errors = collectErrors(page);
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/en');
  await wake3D(page);
  await expect(page.getByTestId('mascot-canvas').locator('canvas')).toBeAttached();
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(page.locator('#about [data-reveal]')).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test.describe('phone width', () => {
  test.use({viewport: {width: 375, height: 812}});
  test('canvases cause no horizontal scroll', async ({page}) => {
    await page.goto('/en');
    await wake3D(page);
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
