import {ImageResponse} from 'next/og';
import {getTranslations} from 'next-intl/server';

export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export default async function OpenGraphImage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Hero'});
  return new ImageResponse(
    (
      <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#F2EFE8', color: '#0B0B0B', borderBottom: '40px solid #0B0B0B'}}>
        <div style={{fontSize: 40, color: '#0B0B0B'}}>{t('tag')}</div>
        <div style={{fontSize: 120, fontWeight: 900, color: '#E10600', textShadow: '6px 6px 0 #0B0B0B'}}>JOHN CASILDO</div>
        <div style={{fontSize: 36, maxWidth: 900}}>{t('valueProp')}</div>
      </div>
    ),
    size,
  );
}
