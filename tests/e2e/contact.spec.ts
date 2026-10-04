import {expect, test, type Page} from '@playwright/test';

async function fill(page: Page, {name = 'Ana', email = 'ana@example.com', message = 'I need a website for my bakery.'} = {}) {
  const form = page.getByTestId('contact-form');
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

test('WhatsApp button hidden while number is a placeholder', async ({page}) => {
  await page.goto('/en#contact');
  await expect(page.getByTestId('whatsapp-link')).toHaveCount(0);
  await expect(page.locator('#contact').getByTestId('email-link').first()).toBeVisible();
});

test('spanish labels', async ({page}) => {
  await page.goto('/es#contact');
  const form = page.getByTestId('contact-form');
  await expect(form.getByLabel('Nombre')).toBeVisible();
  await expect(form.getByRole('button', {name: 'Enviar mensaje'})).toBeVisible();
});
