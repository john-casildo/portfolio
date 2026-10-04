import {expect, test} from '@playwright/test';

test('desktop shows the sticker pack, all decorative', async ({page, isMobile}) => {
  test.skip(isMobile);
  await page.goto('/en');
  const stickers = page.locator('[data-sticker]');
  expect(await stickers.count()).toBeGreaterThanOrEqual(8);
  for (const kind of ['bubble-jc', 'eight-ball', 'stop', 'spray-can', 'dice', 'code']) {
    await expect(page.locator(`[data-sticker="${kind}"]`).first()).toBeVisible();
  }
  const notHidden = await stickers.evaluateAll((els) => els.filter((el) => el.getAttribute('aria-hidden') !== 'true').length);
  expect(notHidden).toBe(0);
});

test.describe('phone', () => {
  test.use({viewport: {width: 375, height: 812}});
  test('a few small stickers, none covering text or controls', async ({page}) => {
    await page.goto('/en');
    const visible = await page.locator('[data-sticker]').evaluateAll((els) => els.filter((el) => (el as HTMLElement).offsetParent !== null));
    expect(visible.length).toBeGreaterThanOrEqual(2);
    const overlaps = await page.evaluate(() => {
      const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      const stickers = Array.from(document.querySelectorAll('[data-sticker]')).filter((el) => (el as HTMLElement).offsetParent !== null);
      // Text blocks are measured by their text (block boxes span the full row); controls by their box.
      const rectOf = (el: Element) => {
        if (/^(A|BUTTON|INPUT|TEXTAREA)$/.test(el.tagName)) return el.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect();
      };
      const content = Array.from(document.querySelectorAll('main h1, main h2, main h3, main p, main a, main button, main input, main textarea, main li'));
      return stickers.flatMap((s) => content.filter((c) => hit(s.getBoundingClientRect(), rectOf(c))).map((c) => `${s.getAttribute('data-sticker')} × ${c.tagName}:${(c.textContent ?? '').slice(0, 20)}`));
    });
    expect(overlaps).toEqual([]);
  });
});
