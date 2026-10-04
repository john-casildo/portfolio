import {Resend} from 'resend';
import type {SendEmail} from './contact-handler';

type Env = {apiKey?: string; to?: string; from?: string};

export function createResendSender({apiKey, to, from}: Env): SendEmail {
  return async ({name, email, message}) => {
    if (!apiKey || !to || !from) throw new Error('contact email not configured');
    const {error} = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Portfolio] ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    });
    if (error) throw new Error(error.message);
  };
}
