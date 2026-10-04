import {ImageResponse} from 'next/og';
import {getTranslations} from 'next-intl/server';

export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

export default async function OpenGraphImage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Hero'});
  return new ImageResponse(
    (
      <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#F3C98B', color: '#111', borderBottom: '40px solid #FF4A1C'}}>
        <div style={{fontSize: 40, color: '#1E4E7A'}}>{t('tag')}</div>
        <div style={{fontSize: 120, fontWeight: 900}}>JOHN CASILDO</div>
        <div style={{fontSize: 36, maxWidth: 900}}>{t('valueProp')}</div>
      </div>
    ),
    size,
  );
}
