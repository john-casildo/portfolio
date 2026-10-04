import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {ImageResponse} from 'next/og';
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';

export const size = {width: 1200, height: 630};
export const contentType = 'image/png';

// Render at build time: the fonts and hero PNG are read from disk, which a serverless function may not ship.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

const PAPER = '#F2EFE8';
const INK = '#0B0B0B';
const RED = '#E10600';

const LEGS = ['M-4 -10 L-12 -30 L-9 -56', 'M-6 -5 L-28 -18 L-38 -44', 'M-6 6 L-30 16 L-42 42', 'M-4 13 L-14 36 L-9 58'];

const asset = (...parts: string[]) => readFile(join(process.cwd(), ...parts));

/** Link-preview card in the zine style. Fonts are bundled because the OG renderer can't load web fonts. */
export default async function OpenGraphImage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({locale, namespace: 'Hero'});
  // ✱ isn't in Permanent Marker; the OG renderer would try to download a fallback font for it.
  const ticker = (await getTranslations({locale, namespace: 'Ticker'}))('text').replaceAll('✱', '*');

  const [knewave, marker, grotesk, hero] = await Promise.all([
    asset('assets', 'fonts', 'Knewave-Regular.ttf'),
    asset('assets', 'fonts', 'PermanentMarker-Regular.ttf'),
    asset('assets', 'fonts', 'SpaceGrotesk-Medium.ttf'),
    asset('public', 'hero-fallback.png'),
  ]);
  const heroSrc = `data:image/png;base64,${hero.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PAPER, color: INK}}>
        <div style={{display: 'flex', flex: 1, position: 'relative'}}>
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 72px', width: 760}}>
            <div style={{fontFamily: 'Marker', fontSize: 40, transform: 'rotate(-3deg)', marginBottom: 8}}>{t('tag')}</div>
            <div style={{display: 'flex', flexDirection: 'column', fontFamily: 'Knewave', fontSize: 132, lineHeight: 0.95, color: RED, textShadow: `7px 7px 0 ${INK}`}}>
              <span>JOHN</span>
              <span>CASILDO</span>
            </div>
            <div style={{fontFamily: 'Grotesk', fontSize: 30, lineHeight: 1.3, marginTop: 24, maxWidth: 640}}>{t('valueProp')}</div>
          </div>
          <div style={{display: 'flex', position: 'absolute', right: 40, top: 10, width: 420, height: 520, alignItems: 'center', justifyContent: 'center'}}>
            <svg viewBox="-62 -62 124 124" width="420" height="420" style={{position: 'absolute', opacity: 0.2}}>
              <circle r="41" fill="none" stroke={RED} strokeWidth="7" />
              <ellipse cy="10" rx="9" ry="15" fill={RED} />
              <ellipse cy="-8" rx="7" ry="8" fill={RED} />
              {[1, -1].map((side) =>
                LEGS.map((d) => <path key={`${side}${d}`} d={d} transform={`scale(${side} 1)`} fill="none" stroke={RED} strokeWidth="5" strokeLinecap="round" />),
              )}
            </svg>
            <img src={heroSrc} width={420} height={521} alt="" style={{position: 'absolute', top: -6}} />
          </div>
        </div>
        <div style={{display: 'flex', height: 72, alignItems: 'center', background: INK, color: PAPER, fontFamily: 'Marker', fontSize: 30, whiteSpace: 'nowrap', overflow: 'hidden', paddingLeft: 24}}>
          {`${ticker} ${ticker}`}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {name: 'Knewave', data: knewave, weight: 400, style: 'normal'},
        {name: 'Marker', data: marker, weight: 400, style: 'normal'},
        {name: 'Grotesk', data: grotesk, weight: 500, style: 'normal'},
      ],
    },
  );
}
