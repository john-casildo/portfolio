import {buttonClass} from '@/components/ui/button';

type Props = {whatsappHref: string | null; whatsappLabel: string; email: string; emailLabel: string};

export function DirectLinks({whatsappHref, whatsappLabel, email, emailLabel}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {whatsappHref && (
        <a data-testid="whatsapp-link" href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary')}>
          {whatsappLabel}
        </a>
      )}
      <a data-testid="email-link" href={`mailto:${email}`} className={buttonClass('secondary')}>
        {emailLabel}
      </a>
    </div>
  );
}
