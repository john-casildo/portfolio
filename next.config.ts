import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // The OG image reads these from disk; make sure they ship with the function if it ever renders on demand.
  outputFileTracingIncludes: {
    '/[locale]/opengraph-image': ['./assets/fonts/**', './public/hero-fallback.png'],
  },
};

export default withNextIntl(nextConfig);
