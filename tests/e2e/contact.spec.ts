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
  await expect(page.locator('#contact').getByTestId('social-resume').locator('.social-tip')).toHaveText('Ver mi CV (PDF)');
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
  await expect(page.locator('footer').getByTestId('social-github')).toBeVisible();
});

test('CV can be viewed and downloaded in each language', async ({page, request}) => {
  for (const [locale, file] of [['en', 'John_Casildo_CV_EN.pdf'], ['es', 'John_Casildo_CV_ES.pdf']]) {
    await page.goto(`/${locale}#contact`);
    const section = page.locator('#contact');
    await expect(section.getByTestId('social-resume')).toHaveAttribute('href', `/cv/${file}`);
    await expect(section.getByTestId('social-resume')).toHaveAttribute('target', '_blank');
    const download = section.getByTestId('resume-download').first();
    await expect(download).toHaveAttribute('href', `/cv/${file}`);
    await expect(download).toHaveAttribute('download', 'John_Casildo_CV.pdf');
    const res = await request.get(`/cv/${file}`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
  }
});

test('spanish labels', async ({page}) => {
  await page.goto('/es#contact');
  const form = page.getByTestId('contact-form');
  await expect(form.getByLabel('Nombre')).toBeVisible();
  await expect(form.getByRole('button', {name: 'Enviar mensaje'})).toBeVisible();
});
