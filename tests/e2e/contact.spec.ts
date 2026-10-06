import {expect, test, type Page} from '@playwright/test';

async function fill(page: Page, {name = 'Ana', email = 'ana@example.com', message = 'I need a website for my bakery.'} = {}) {
  const form = page.getByTestId('contact-form');
  // Submit is disabled until hydration; typing earlier can race React under heavy parallel load.
  await expect(form.getByRole('button', {name: 'Send message'})).toBeEnabled();
  await form.getByLabel('Name').fill(name);
  await form.getByLabel('Email').fill(email);
  await form.getByLabel('Message').fill(message);
  return form;
}

test('client validation blocks bad input without a request', async ({page}) => {
  let requests = 0;
  await page.route('**/api/contact', (route) => {
    requests++;
    return route.fulfill({json: {ok: true}});
  });
  await page.goto('/en#contact');
  const form = await fill(page, {name: '   ', email: 'nope', message: '          '});
  await form.getByRole('button', {name: 'Send message'}).click();
  await expect(form.getByText('Enter your name')).toBeVisible();
  await expect(form.getByText('Enter a valid email')).toBeVisible();
  await expect(form.getByText('Write at least 10 characters')).toBeVisible();
  await expect(form.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
  expect(requests).toBe(0);
});

test('success path', async ({page}) => {
  let payload: unknown;
  await page.route('**/api/contact', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({json: {ok: true}});
  });
  await page.goto('/en#contact');
  const form = await fill(page);
  await form.getByRole('button', {name: 'Send message'}).click();
  await expect(page.getByTestId('contact-success')).toContainText('Message sent');
  expect(payload).toMatchObject({name: 'Ana', email: 'ana@example.com', company: ''});
});

test('server failure shows direct links', async ({page}) => {
  await page.route('**/api/contact', (route) => route.fulfill({status: 500, json: {error: 'send_failed'}}));
  await page.goto('/en#contact');
  const form = await fill(page);
  await form.getByRole('button', {name: 'Send message'}).click();
  const failure = page.getByTestId('contact-failure');
  await expect(failure).toContainText("Couldn't send");
  await expect(failure.getByTestId('email-link')).toHaveAttribute('href', /^mailto:/);
});

test('rate limited message', async ({page}) => {
  await page.route('**/api/contact', (route) => route.fulfill({status: 429, json: {error: 'rate_limited'}}));
  await page.goto('/en#contact');
  const form = await fill(page);
  await form.getByRole('button', {name: 'Send message'}).click();
  await expect(page.getByTestId('contact-failure')).toContainText('Too many messages');
});

test('contact column uses the icons, not duplicate WhatsApp/email buttons', async ({page}) => {
  await page.goto('/en#contact');
  const section = page.locator('#contact');
  await expect(section.getByTestId('social-whatsapp')).toHaveAttribute('href', /^https:\/\/wa\.me\/50661090625/);
  await expect(section.getByTestId('whatsapp-link')).toHaveCount(0);
  await expect(section.getByTestId('email-link')).toHaveCount(0);
});

test('hovering an icon shows its name', async ({page, isMobile}) => {
  test.skip(isMobile, 'phones have no hover');
  await page.goto('/es#contact');
  const linkedin = page.locator('#contact').getByTestId('social-linkedin');
  const tip = linkedin.locator('.social-tip');
  await expect(tip).toBeHidden();
  await linkedin.hover();
  await expect(tip).toBeVisible();
  await expect(tip).toHaveText('LinkedIn');
  await page.locator('#contact').getByTestId('social-resume').hover();
  await expect(page.locator('#contact').getByTestId('social-resume').locator('.social-tip')).toHaveText('Ver y descargar mi CV');
});

test('social icons link out with accessible names', async ({page}) => {
  await page.goto('/en#contact');
  const social = page.locator('#contact').getByRole('list', {name: 'Find me online'});
  const github = social.getByRole('link', {name: 'GitHub'});
  await expect(github).toHaveAttribute('href', 'https://github.com/john-casildo');
  await expect(github).toHaveAttribute('target', '_blank');
  await expect(social.getByRole('link', {name: 'LinkedIn'})).toHaveAttribute('href', 'https://www.linkedin.com/in/john-casildo/');
  await expect(social.getByRole('link', {name: 'X (Twitter)'})).toHaveAttribute('href', 'https://x.com/John_Casildo');
  await expect(social.getByRole('link', {name: 'WhatsApp'})).toHaveAttribute('href', 'https://wa.me/50661090625');
  await expect(social.getByRole('link', {name: 'Email'})).toHaveAttribute('href', 'mailto:johnbsns@outlook.com');
  // Contact links appear once: in the contact section, not again in the footer.
  await expect(page.locator('footer').getByRole('link')).toHaveCount(0);
});

test('CV opens in a viewer with a download button, in each language', async ({page, request}) => {
  for (const [locale, file, heading] of [['en', 'John_Casildo_CV_EN.pdf', 'My CV'], ['es', 'John_Casildo_CV_ES.pdf', 'Mi CV']]) {
    await page.goto(`/${locale}#contact`);
    const dialog = page.getByTestId('cv-dialog');
    await expect(dialog).toBeHidden();

    // The résumé icon opens the viewer instead of navigating away.
    await page.locator('#contact').getByTestId('social-resume').click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', {name: heading})).toBeVisible();
    await expect(dialog.getByRole('img')).toBeVisible();
    const download = dialog.getByTestId('cv-download');
    await expect(download).toHaveAttribute('href', `/cv/${file}`);
    await expect(download).toHaveAttribute('download', 'John_Casildo_CV.pdf');
    await expect(page).toHaveURL(new RegExp(`/${locale}#contact$`));
    // Focus goes to the CV, not the download button (whose focus ring would show).
    await expect(dialog.getByTestId('cv-scroll')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    // Focus goes back to the icon that opened it.
    await expect(page.locator('#contact').getByTestId('social-resume')).toBeFocused();

    // The hero CV button opens the same viewer; the close button shuts it.
    await page.getByTestId('hero-cv').click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', {name: locale === 'es' ? 'Cerrar' : 'Close'}).click();
    await expect(dialog).toBeHidden();

    const res = await request.get(`/cv/${file}`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
  }
});

test('there is no separate View CV button', async ({page}) => {
  await page.goto('/es#contact');
  await expect(page.locator('#contact').getByRole('link', {name: 'Ver CV'})).toHaveCount(0);
});

test('CV viewer: click outside closes it and Tab stays inside', async ({page, isMobile}) => {
  test.skip(isMobile, 'keyboard and pointer behaviour checked on desktop');
  await page.goto('/en');
  await page.getByTestId('hero-cv').click();
  const dialog = page.getByTestId('cv-dialog');
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
  await page.mouse.click(10, 10); // on the dark overlay
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('cv-overlay')).toBeHidden();
  await expect(page.getByTestId('hero-cv')).toBeFocused();
});

test('CV links still point at the PDF for no-JS visitors', async ({page}) => {
  await page.goto('/en#contact');
  await expect(page.locator('#contact').getByTestId('social-resume')).toHaveAttribute('href', '/cv/John_Casildo_CV_EN.pdf');
  await expect(page.getByTestId('hero-cv')).toHaveAttribute('href', '/cv/John_Casildo_CV_EN.pdf');
});

test('spanish labels', async ({page}) => {
  await page.goto('/es#contact');
  const form = page.getByTestId('contact-form');
  await expect(form.getByLabel('Nombre')).toBeVisible();
  await expect(form.getByRole('button', {name: 'Enviar mensaje'})).toBeVisible();
});
