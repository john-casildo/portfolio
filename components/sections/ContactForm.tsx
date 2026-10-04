'use client';

import {useEffect, useState, type FormEvent, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {buttonClass} from '@/components/ui/button';
import {contactSchema, fieldErrors, type ContactField} from '@/lib/contact-schema';

type Status = 'idle' | 'sending' | 'success' | 'failure' | 'rate_limited';

const inputClass =
  'mt-1 block min-h-12 w-full rounded-sm border-2 border-ink bg-paper px-3 py-2 text-base aria-[invalid=true]:border-red';

export function ContactForm({directLinks}: {directLinks: ReactNode}) {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<ContactField[]>([]);
  // Until hydration a click would trigger a native GET submit that puts the message in the URL.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  function showErrors(form: HTMLFormElement, fields: ContactField[]) {
    setErrors(fields);
    // Move focus to the first problem so keyboard and screen-reader users land on it.
    if (fields[0]) form.querySelector<HTMLElement>(`#contact-${fields[0]}`)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      showErrors(form, fieldErrors(parsed.error));
      return;
    }
    setErrors([]);
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        form.reset();
        setStatus('success');
      } else if (res.status === 429) {
        setStatus('rate_limited');
      } else if (res.status === 400) {
        const body: {fields?: ContactField[]} | null = await res.json().catch(() => null);
        const fields = body?.fields ?? [];
        if (fields.length > 0) {
          showErrors(form, fields);
          setStatus('idle');
        } else {
          setStatus('failure');
        }
      } else {
        setStatus('failure');
      }
    } catch {
      setStatus('failure');
    }
  }

  const field = (name: ContactField, input: ReactNode) => (
    <div>
      <label htmlFor={`contact-${name}`} className="font-bold">{t(name)}</label>
      {input}
      {errors.includes(name) && (
        <p id={`contact-${name}-error`} className="mt-1 font-medium text-ink underline decoration-red decoration-2">
          {t(`errors.${name}`)}
        </p>
      )}
    </div>
  );
  const a11y = (name: ContactField) => ({
    id: `contact-${name}`,
    name,
    'aria-invalid': errors.includes(name),
    'aria-describedby': errors.includes(name) ? `contact-${name}-error` : undefined,
  });

  return (
    <form data-testid="contact-form" noValidate onSubmit={onSubmit} className="relative grid gap-4">
      {field('name', <input {...a11y('name')} type="text" autoComplete="name" maxLength={100} className={inputClass} />)}
      {field('email', <input {...a11y('email')} type="email" autoComplete="email" maxLength={254} className={inputClass} />)}
      {field('message', <textarea {...a11y('message')} rows={5} maxLength={2000} className={inputClass} />)}
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0">
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button type="submit" disabled={!hydrated || status === 'sending'} className={`${buttonClass('primary')} w-fit disabled:opacity-60`}>
        {status === 'sending' ? t('sending') : t('send')}
      </button>
      <div role="status" aria-live="polite">
        {status === 'success' && <p data-testid="contact-success" className="font-bold">{t('success')}</p>}
        {(status === 'failure' || status === 'rate_limited') && (
          <div data-testid="contact-failure" className="grid gap-3">
            <p className="font-bold">{status === 'rate_limited' ? t('rateLimited') : t('failure')}</p>
            {directLinks}
          </div>
        )}
      </div>
    </form>
  );
}
