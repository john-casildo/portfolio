import {contactSchema, fieldErrors} from './contact-schema';

export type ContactMessage = {name: string; email: string; message: string};
export type SendEmail = (msg: ContactMessage) => Promise<void>;

type Deps = {
  send: SendEmail;
  limiter: {check(key: string): boolean};
  getIp: (req: Request) => string;
};

export function createContactHandler({send, limiter, getIp}: Deps) {
  return async function handle(req: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({error: 'invalid', fields: []}, {status: 400});
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({error: 'invalid', fields: fieldErrors(parsed.error)}, {status: 400});
    }

    const {company, ...message} = parsed.data;
    if (company) return Response.json({ok: true});

    if (!limiter.check(getIp(req))) {
      return Response.json({error: 'rate_limited'}, {status: 429});
    }

    try {
      await send(message);
    } catch (error) {
      console.error('contact: send failed', error instanceof Error ? error.message : error);
      return Response.json({error: 'send_failed'}, {status: 500});
    }
    return Response.json({ok: true});
  };
}
