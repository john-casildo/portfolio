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
  for (const text of ['HIRE ME', 'SHIP IT', 'FRESH']) {
    await expect(page.locator(`main [data-graffiti][data-text="${text}"]`)).toHaveCount(1);
  }
});

test('404 gets a throw-up', async ({page}) => {
  await page.goto('/en/nope');
  await expect(page.locator('[data-graffiti][data-text="404"]')).toBeVisible();
});

test.describe('edge graffiti', () => {
  test.use({viewport: {width: 1280, height: 900}});
  test('fills both page edges without touching any text or controls', async ({page}) => {
    await page.goto('/en');
    const edges = page.getByTestId('edge-graffiti');
    await expect(edges).toHaveAttribute('aria-hidden', 'true');
    expect(await edges.locator('[data-graffiti]').count()).toBeGreaterThanOrEqual(20);
    const overlaps = await page.evaluate(() => {
      const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      const rectOf = (el: Element) => {
        if (/^(A|BUTTON|INPUT|TEXTAREA)$/.test(el.tagName)) return el.getBoundingClientRect();
        const r = document.createRange();
        r.selectNodeContents(el);
        return r.getBoundingClientRect();
      };
      const vw = window.innerWidth;
      const pieces = Array.from(document.querySelectorAll('[data-testid=edge-graffiti] [data-graffiti]')).map((el) => {
        const r = el.getBoundingClientRect();
        // Only the on-screen part matters; the rest is clipped at the viewport edge.
        return new DOMRect(Math.max(r.left, 0), r.top, Math.min(r.right, vw) - Math.max(r.left, 0), r.height);
      });
      const content = Array.from(document.querySelectorAll('main h1, main h2, main h3, main p, main a, main button, main input, main textarea, main li, header a, footer a, footer p'));
      return pieces.flatMap((p, i) => content.filter((c) => hit(p, rectOf(c))).map((c) => `#${i} × ${c.tagName}:${(c.textContent ?? '').slice(0, 20)}`));
    });
    expect(overlaps).toEqual([]);
  });
});

test.describe('edge graffiti on smaller screens', () => {
  test.use({viewport: {width: 1024, height: 800}});
  test('is hidden where there is no margin', async ({page}) => {
    await page.goto('/en');
    await expect(page.getByTestId('edge-graffiti')).toBeHidden();
  });
});
