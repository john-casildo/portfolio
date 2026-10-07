import {expect, test} from '@playwright/test';

// Whole words only: decorative lettering like "SMILE" drawn twice reads "SMILESMILE".
const EXCLUDED = /\b(spider|miles|morales|marvel|sony)\b/i;

for (const locale of ['en', 'es']) {
  test(`${locale}: no third-party character names anywhere`, async ({page}) => {
    await page.goto(`/${locale}`);
    const head = await page.evaluate(() => document.head.innerHTML);
    expect(head).not.toMatch(EXCLUDED);
    const body = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('script, style, template').forEach((el) => el.remove());
      const labels = Array.from(clone.querySelectorAll('[alt],[aria-label]')).map((el) => `${el.getAttribute('alt') ?? ''} ${el.getAttribute('aria-label') ?? ''}`);
      return `${clone.innerText} ${labels.join(' ')}`;
    });
    expect(body).not.toMatch(EXCLUDED);
  });
}

test('ticker is decorative and stops under reduced motion', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/en');
  const ticker = page.getByTestId('ticker').first();
  await expect(ticker).toHaveAttribute('aria-hidden', 'true');
  const animation = await ticker.locator('.ticker-track').evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe('none');
});

test.describe('phone width', () => {
  test.use({viewport: {width: 375, height: 812}});
  for (const path of ['/en', '/es', '/en/projects/presencia']) {
    test(`${path}: nothing sticks out past the viewport`, async ({page}) => {
      await page.goto(path);
      await page.waitForTimeout(300);
      const offenders = await page.evaluate(() => {
        const vw = window.innerWidth;
        const clipped = (el: Element) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const s = getComputedStyle(p);
            if (['hidden', 'clip', 'auto', 'scroll'].includes(s.overflowX)) {
              const r = p.getBoundingClientRect();
              if (r.left >= -1 && r.right <= vw + 1) return true;
            }
          }
          return false;
        };
        return Array.from(document.body.querySelectorAll('*'))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !clipped(el);
          })
          .slice(0, 5)
          .map((el) => `${el.tagName}.${(el.getAttribute('class') ?? '').slice(0, 60)}`);
      });
      expect(offenders).toEqual([]);
    });
  }
});

test('nav link hover stays readable (dark red, not brand red)', async ({page, isMobile}) => {
  test.skip(isMobile, 'hover only');
  await page.goto('/en');
  const link = page.getByRole('navigation').getByRole('link', {name: 'Work'});
  await link.hover();
  await expect(link).toHaveCSS('color', 'rgb(143, 0, 0)');
});
