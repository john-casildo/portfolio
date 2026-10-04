import {createContactHandler} from '@/lib/contact-handler';
import {createResendSender} from '@/lib/contact-email';
import {createRateLimiter} from '@/lib/rate-limit';

export const runtime = 'nodejs';

export const POST = createContactHandler({
  send: createResendSender({
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.CONTACT_TO_EMAIL,
    from: process.env.CONTACT_FROM_EMAIL,
  }),
  limiter: createRateLimiter({limit: 5, windowMs: 10 * 60_000}),
  getIp: (req) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
});
