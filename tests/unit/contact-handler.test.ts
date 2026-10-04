import {beforeEach, describe, expect, test, vi} from 'vitest';
import {createContactHandler} from '@/lib/contact-handler';
import {createRateLimiter} from '@/lib/rate-limit';
import {createResendSender} from '@/lib/contact-email';

const valid = {name: 'Ana', email: 'ana@example.com', message: 'I need a website for my bakery.'};

function post(body: unknown, ip = '1.2.3.4') {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: {'content-type': 'application/json', 'x-forwarded-for': ip},
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('contact handler', () => {
  const send = vi.fn<(m: {name: string; email: string; message: string}) => Promise<void>>();
  let handler: (req: Request) => Promise<Response>;

  beforeEach(() => {
    send.mockReset().mockResolvedValue(undefined);
    handler = createContactHandler({
      send,
      limiter: createRateLimiter({limit: 5, windowMs: 600_000}),
      getIp: (req) => req.headers.get('x-forwarded-for') ?? 'unknown',
    });
  });

  test('valid → 200 and sends trimmed message', async () => {
    const res = await handler(post({...valid, name: ' Ana '}));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ok: true});
    expect(send).toHaveBeenCalledWith(valid);
  });

  test('invalid fields → 400 with field list', async () => {
    const res = await handler(post({...valid, email: 'nope'}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({error: 'invalid', fields: ['email']});
    expect(send).not.toHaveBeenCalled();
  });

  test.each(['not json', '', '[]', 'null'])('malformed body %j → 400', async (body) => {
    const res = await handler(post(body));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid');
  });

  test('honeypot → silent 200, nothing sent', async () => {
    const res = await handler(post({...valid, company: 'Spam Inc'}));
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  test('6th request from same IP → 429', async () => {
    for (let i = 0; i < 5; i++) expect((await handler(post(valid))).status).toBe(200);
    const res = await handler(post(valid));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({error: 'rate_limited'});
  });

  test('provider failure → 500 without leaking details', async () => {
    send.mockRejectedValue(new Error('API key sk_live_secret invalid'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await handler(post(valid));
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({error: 'send_failed'});
    expect(text).not.toContain('sk_live');
  });
});

describe('createResendSender', () => {
  test('rejects when not configured', async () => {
    const send = createResendSender({apiKey: undefined, to: 'me@x.com', from: 'site@x.com'});
    await expect(send(valid)).rejects.toThrow(/not configured/);
  });
});
