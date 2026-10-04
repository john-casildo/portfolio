import {getTranslations} from 'next-intl/server';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {hasWhatsApp, site, whatsappUrl} from '@/lib/site';
import {ContactForm} from './ContactForm';
import {DirectLinks} from './DirectLinks';

export async function Contact() {
  const t = await getTranslations('Contact');
  const links = (
    <DirectLinks
      whatsappHref={hasWhatsApp() ? whatsappUrl(t('whatsappPrefill')) : null}
      whatsappLabel={t('whatsapp')}
      email={site.email}
      emailLabel={t('emailCta')}
    />
  );
  return (
    <section id="contact" data-section aria-labelledby="contact-title" className="border-t-2 border-ink bg-paper/90">
      <div data-reveal className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
        <div>
          <SectionHeading id="contact" tag={t('tag')} title={t('title')} />
          <p className="mt-6 text-lg">{t('intro')}</p>
          <p className="mt-8 font-bold">{t('direct')}</p>
          <div className="mt-3">{links}</div>
        </div>
        <div className="rounded-2xl border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_var(--color-ink)]">
          <ContactForm directLinks={links} />
        </div>
      </div>
    </section>
  );
}
