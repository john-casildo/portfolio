import {expect, test} from '@playwright/test';

const EXCLUDED = /spider|miles|morales|marvel|sony/i;

for (const [locale, line] of [
  ['en', 'Fan art. Not affiliated with Marvel or Sony.'],
  ['es', 'Fan art. Sin afiliación con Marvel o Sony.'],
] as const) {
  test(`${locale}: fan-art line in footer, names nowhere else`, async ({page}) => {
    await page.goto(`/${locale}`);
    await expect(page.locator('footer')).toContainText(line);
    const head = await page.evaluate(() => document.head.innerHTML);
    expect(head).not.toMatch(EXCLUDED);
    const outsideFooter = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.querySelector('footer')?.remove();
      clone.querySelectorAll('script, style, template').forEach((el) => el.remove());
      const alts = Array.from(clone.querySelectorAll('[alt],[aria-label]')).map((el) => `${el.getAttribute('alt') ?? ''} ${el.getAttribute('aria-label') ?? ''}`);
      return `${clone.innerText} ${alts.join(' ')}`;
    });
    expect(outsideFooter).not.toMatch(EXCLUDED);
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
            if (['hidden', 'clip'].includes(s.overflowX)) {
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
