import {getLocale, getTranslations} from 'next-intl/server';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {hasWhatsApp, resumeUrl, site, whatsappUrl} from '@/lib/site';
import {ThrowUp} from '@/components/zine/Graffiti';
import {Tape} from '@/components/zine/Tape';
import {Doodle} from '@/components/zine/Doodle';
import {NumberSticker} from '@/components/zine/NumberSticker';
import {Sticker} from '@/components/zine/Sticker';
import {SocialLinks} from '@/components/ui/SocialLinks';
import {buttonClass} from '@/components/ui/button';
import {ContactForm} from './ContactForm';
import {DirectLinks} from './DirectLinks';

export async function Contact() {
  const t = await getTranslations('Contact');
  const tSocial = await getTranslations('Social');
  const cvHref = resumeUrl(await getLocale());
  // Shown only if the form fails to send, as a fallback.
  const links = (
    <DirectLinks
      whatsappHref={hasWhatsApp() ? whatsappUrl(t('whatsappPrefill')) : null}
      whatsappLabel={t('whatsapp')}
      email={site.email}
      emailLabel={t('emailCta')}
    />
  );
  return (
    <section id="contact" data-section aria-labelledby="contact-title" className="relative overflow-hidden border-t-[3px] border-ink">
      <NumberSticker n={5} className="absolute left-4 top-6" />
      <Doodle kind="zigzag" color="red" className="absolute bottom-6 right-6 w-24" />
      <ThrowUp text="HIRE ME" fill="#FFE600" shade="#FF3EA5" tilt={-5} className="right-6 top-3 hidden w-52 md:block" />
      <Sticker kind="dice" tilt={6} className="left-[40%] top-8 hidden w-28 md:block" />
      <Sticker kind="code" tilt={-5} className="bottom-3 left-6 hidden w-36 md:block" />
      <div data-reveal className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
        <div>
          <SectionHeading id="contact" tag={t('tag')} title={t('title')} />
          <p className="mt-6 text-lg">{t('intro')}</p>
          <p className="mt-8 font-tag text-xl">{tSocial('label')}</p>
          <SocialLinks className="mt-6" />
          <a data-testid="cv-open" data-cv-open href={cvHref} target="_blank" rel="noopener noreferrer" className={`${buttonClass('secondary')} mt-8`}>
            {tSocial('viewCv')}
          </a>
        </div>
        <div className="sticker notebook tilt-r relative p-6">
          <Tape />
          <ContactForm directLinks={links} />
        </div>
      </div>
    </section>
  );
}
