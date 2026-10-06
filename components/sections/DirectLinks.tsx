import {buttonClass} from '@/components/ui/button';

type Props = {whatsappHref: string | null; whatsappLabel: string; email: string; emailLabel: string; resumeHref?: string; resumeLabel?: string};

export function DirectLinks({whatsappHref, whatsappLabel, email, emailLabel, resumeHref, resumeLabel}: Props) {
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
      {resumeHref && resumeLabel && (
        <a data-testid="resume-download" href={resumeHref} download="John_Casildo_CV.pdf" className={buttonClass('secondary')}>
          {resumeLabel}
        </a>
      )}
    </div>
  );
}
