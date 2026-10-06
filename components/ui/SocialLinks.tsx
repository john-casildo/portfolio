import {getLocale, getTranslations} from 'next-intl/server';
import {SocialIcon, type SocialKind} from '@/components/zine/SocialIcon';
import {resumeUrl, socialLinks} from '@/lib/site';

// Alternating tilts so the row reads like stickers slapped on, not a toolbar.
const TILTS = [-4, 3, -2, 4, -3, 2];

export async function SocialLinks({size = 'md', className = ''}: {size?: 'sm' | 'md'; className?: string}) {
  const t = await getTranslations('Social');
  const links = [...socialLinks(), {kind: 'resume' as const, href: resumeUrl(await getLocale()), external: true}];
  const box = size === 'sm' ? 'size-12' : 'size-14';
  const icon = size === 'sm' ? 30 : 36;

  return (
    <ul aria-label={t('label')} className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((link, i) => (
        <li key={link.kind}>
          <a
            data-testid={`social-${link.kind}`}
            href={link.href}
            {...(link.external && {target: '_blank', rel: 'noopener noreferrer'})}
            aria-label={t(link.kind as SocialKind)}
            title={t(link.kind as SocialKind)}
            className={`social-badge ${box}`}
            style={{'--tilt': `${TILTS[i % TILTS.length]}deg`} as React.CSSProperties}
          >
            <SocialIcon kind={link.kind} size={icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
