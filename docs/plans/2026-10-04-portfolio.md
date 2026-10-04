# Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a bilingual (EN/ES) freelance portfolio for John Casildo: a Next.js site with a PS1-style low-poly 3D mascot, an animated triangle-quilt background, graffiti typography, project case studies, and a working contact form, deployed on Vercel.

**Architecture:** Next.js 15 App Router with statically generated `[locale]` routes via next-intl. All copy lives in `messages/*.json`, and projects are MDX files loaded from `content/projects`. The 3D (React Three Fiber) is client-only and lazy-loaded behind a WebGL/reduced-motion gate, so server-rendered text stays the LCP. The contact form posts to a Route Handler that validates with zod, rate-limits, and sends via Resend.

**Tech Stack:** Next.js 15.5, React 19, TypeScript (strict), Tailwind CSS v4, next-intl 4, three + @react-three/fiber 9, next-mdx-remote 6 + gray-matter, zod 4, resend 6, Vitest, Playwright.

**Spec:** `docs/specs/2026-10-04-portfolio-design.md` (read it before starting any task).

## Global Constraints

- Project root: `~/Documents/portfolio` (git repo, branch `main`). Never touch `~/Documents/Presencia App`.
- Locales: exactly `en` and `es`, always prefixed (`/en`, `/es`); `/` redirects by `Accept-Language`.
- No hard-coded user-visible copy in components: every string comes from `messages/en.json` / `messages/es.json` (exceptions: proper nouns like "GitHub", "WhatsApp", the name "John Casildo", tech names).
- Palette: `paper #F3C98B`, `ink #111111`, `spray #FF4A1C`, `denim #1E4E7A`; quilt palette `#E8433A #F2A93B #F4E04D #3BB273 #2A9D8F #3A6EA5 #8E5BA8 #E86A9E #F7F3E8` (triangles only). `spray` is never used for small text on `paper` (contrast 2.2:1); text on `spray` is always `ink` (5.6:1).
- Fonts: Rubik Wet Paint (display, ≥ 40px, ≤ ~5 words), Sedgwick Ave (decorative tags only, `aria-hidden`), Space Grotesk (everything else).
- Mascot: original character, 300–600 non-outline triangles, no third-party IP.
- Triangle field: ≤ 2,000 triangles.
- Every interactive element: minimum 48×48px touch target, visible `:focus-visible` ring.
- `prefers-reduced-motion: reduce` → no animation loops, no reveal transitions, no smooth scroll.
- Contact API responses exactly: `200 {ok:true}`, `400 {error:"invalid", fields}`, `429 {error:"rate_limited"}`, `500 {error:"send_failed"}`; never leak provider errors.
- Rate limit: 5 requests / 10 minutes per IP.
- Contact field limits: name 1–100 (no line breaks), email valid (≤ 254), message 10–2000 (after trim).
- Quality gates on every task: `npm run lint`, `npm run typecheck`, `npm test` all clean with **zero warnings**.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Malformed or non-JSON POST body to `/api/contact`** → must return `400 {error:"invalid"}`, not a 500 crash. *(Test in Task 5.)*
2. **Whitespace-only fields or a name containing a line break** (email-header injection into the subject) → rejected as invalid on both the client and the server. *(Tests in Tasks 5 and 6.)*
3. **Unknown project slug or unknown path under a locale** (`/en/projects/nope`, `/es/whatever`) → styled "GAME OVER" page with HTTP 404, not a build crash or a 500. *(Test in Task 4.)*
4. **Phone width (375px)** with the huge display font and full-viewport canvases → no horizontal page scroll. *(Tests in Tasks 3 and 8.)*
5. **WebGL unavailable** (old phones, locked-down browsers) → static fallbacks render, the page stays fully readable, and there are no console errors. *(Tests in Tasks 7 and 8.)*

---

## File map

```
app/
  layout.tsx                      root pass-through layout
  not-found.tsx                   root 404 (non-locale paths)
  fonts.ts                        next/font definitions
  globals.css                     Tailwind v4 theme tokens + utility CSS
  sitemap.ts, robots.ts
  api/contact/route.ts            wires handler to Resend
  [locale]/
    layout.tsx                    <html lang>, fonts, providers, header/footer, background, metadata
    page.tsx                      home (sections)
    not-found.tsx                 localized GAME OVER
    [...rest]/page.tsx            catch-all → notFound()
    opengraph-image.tsx           generated OG image
    projects/[slug]/page.tsx      case study
components/
  ui/ button.ts Badge.tsx Header.tsx Footer.tsx LocaleToggle.tsx SectionHeading.tsx
  sections/ Hero.tsx Services.tsx ServiceIcon.tsx ProjectsSection.tsx ProjectCard.tsx About.tsx
            Contact.tsx ContactForm.tsx DirectLinks.tsx
  SectionObserver.tsx             active-section + reveal observers
  mdx.tsx                         MDX element styling
  three/ WebGLGate.tsx Background.tsx BackgroundCanvas.tsx TriangleField.tsx
         ps1.ts buildMascot.ts Mascot.tsx MascotCanvas.tsx HeroMascot.tsx
hooks/useReducedMotion.ts
i18n/ routing.ts navigation.ts request.ts
lib/ site.ts projects.ts section-store.ts contact-schema.ts rate-limit.ts contact-handler.ts
     contact-email.ts random.ts palette.ts quilt.ts webgl.ts mascot-motion.ts
messages/ en.json es.json
content/projects/*.{en,es}.mdx
public/projects/*.svg, public/mascot-fallback.png
scripts/capture-mascot.mjs
middleware.ts, next.config.ts, vitest.config.ts, playwright.config.ts, .env.example
tests/unit/*.test.ts, tests/e2e/*.spec.ts, tests/fixtures/projects/**
```

---

### Task 1: Scaffold, theme, i18n shell

**Files:**
- Create: whole Next.js scaffold, `next.config.ts`, `middleware.ts`, `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`, `messages/en.json`, `messages/es.json`, `lib/site.ts`, `app/layout.tsx`, `app/fonts.ts`, `app/globals.css`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `components/ui/Header.tsx`, `components/ui/Footer.tsx`, `components/ui/LocaleToggle.tsx`, `components/ui/button.ts`, `vitest.config.ts`, `playwright.config.ts`
- Delete: `app/page.tsx`, `app/layout.tsx` (scaffold version, replaced), `public/*.svg` (scaffold)
- Test: `tests/unit/i18n-messages.test.ts`, `tests/unit/site.test.ts`, `tests/e2e/i18n.spec.ts`

**Interfaces:**
- Produces: `routing` (`locales: ['en','es']`), `type AppLocale = 'en' | 'es'`; `Link`, `usePathname`, `redirect`, `getPathname` from `@/i18n/navigation`; `site` object `{name, url, email, whatsapp, github, stack}`; `hasWhatsApp(n?: string): boolean`; `whatsappUrl(text: string, n?: string): string`; `buttonClass(variant?: 'primary' | 'secondary'): string`; all message keys listed below; CSS tokens `bg-paper text-ink bg-spray text-denim font-display font-tag font-sans`; CSS hooks `.btn-press`, `[data-reveal]`, `.triangle-fallback`, `.pixelated`.

- [ ] **Step 1: Scaffold the app**

```bash
cd ~/Documents/portfolio
npx create-next-app@15.5 . --ts --tailwind --eslint --app --no-src-dir \
  --import-alias "@/*" --use-npm --turbopack --disable-git --yes
rm -f app/page.tsx public/*.svg
npm i next-intl@^4
npm i -D vitest@^5 @playwright/test@^1.63
npx playwright install chromium
```

Expected: the scaffold succeeds (the existing `docs/` folder is allowed), and `app/`, `package.json`, `eslint.config.mjs`, and `tsconfig.json` exist.

- [ ] **Step 2: Set scripts and lint ignores**

In `package.json`, replace `"scripts"` with:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --max-warnings=0",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "e2e": "playwright test"
}
```

In `eslint.config.mjs`, extend the `ignores` array with `"playwright-report/**", "test-results/**"`. Append to `.gitignore`:

```
/test-results/
/playwright-report/
/.env*.local
```

- [ ] **Step 3: Write test configs**

`vitest.config.ts`:

```ts
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  resolve: {alias: {'@': fileURLToPath(new URL('.', import.meta.url))}},
  test: {include: ['tests/unit/**/*.test.ts'], environment: 'node'},
});
```

`playwright.config.ts`:

```ts
import {defineConfig, devices} from '@playwright/test';

const PORT = 3100;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {baseURL: `http://localhost:${PORT}`, trace: 'on-first-retry'},
  projects: [
    {name: 'desktop', use: {...devices['Desktop Chrome']}},
    {name: 'mobile', use: {...devices['Pixel 7']}},
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
```

- [ ] **Step 4: Write the failing unit tests**

`tests/unit/i18n-messages.test.ts`:

```ts
import {describe, expect, test} from 'vitest';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

function leaves(obj: unknown, prefix = ''): Array<[string, unknown]> {
  if (typeof obj !== 'object' || obj === null) return [[prefix, obj]];
  return Object.entries(obj).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
}

describe('messages', () => {
  test('en and es have identical key sets', () => {
    const keys = (m: unknown) => leaves(m).map(([k]) => k).sort();
    expect(keys(es)).toEqual(keys(en));
  });

  test('no empty strings', () => {
    for (const [key, value] of [...leaves(en), ...leaves(es)]) {
      expect(typeof value, key).toBe('string');
      expect((value as string).trim().length, key).toBeGreaterThan(0);
    }
  });
});
```

`tests/unit/site.test.ts`:

```ts
import {describe, expect, test} from 'vitest';
import {hasWhatsApp, whatsappUrl} from '@/lib/site';

describe('hasWhatsApp', () => {
  test('rejects the all-zero placeholder', () => expect(hasWhatsApp('0000000000')).toBe(false));
  test('rejects non-digits and wrong lengths', () => {
    expect(hasWhatsApp('+1 555 123')).toBe(false);
    expect(hasWhatsApp('1234567')).toBe(false);
    expect(hasWhatsApp('1234567890123456')).toBe(false);
  });
  test('accepts an international number without +', () => expect(hasWhatsApp('15551234567')).toBe(true));
});

describe('whatsappUrl', () => {
  test('encodes the prefilled text', () => {
    expect(whatsappUrl('¡Hola John! & más', '15551234567')).toBe(
      'https://wa.me/15551234567?text=%C2%A1Hola%20John!%20%26%20m%C3%A1s',
    );
  });
});
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL, because `@/messages/en.json` and `@/lib/site` can't be resolved.

- [ ] **Step 6: Write messages and site config**

`messages/en.json`:

```json
{
  "Meta": {
    "title": "John Casildo — Websites & Web Apps",
    "description": "Freelance developer building fast, memorable websites and web apps, end to end. English & Spanish."
  },
  "Nav": {
    "label": "Main",
    "services": "Services",
    "work": "Work",
    "about": "About",
    "contact": "Contact",
    "switchTo": "ES",
    "switchLabel": "Ver en español"
  },
  "Hero": {
    "tag": "builds the web",
    "name": "JOHN CASILDO",
    "valueProp": "Websites and web apps that look great, load fast, and actually work — built end to end.",
    "ctaWork": "See work",
    "ctaContact": "Let's talk",
    "mascotAlt": "Low-poly mascot with a big hairdo and a hoodie, arms crossed"
  },
  "Services": {
    "tag": "select your mode",
    "title": "Services",
    "websites": {"title": "Websites", "body": "Fast, memorable sites for businesses, events, and personal brands."},
    "webapps": {"title": "Web apps", "body": "Dashboards, portals, and tools your team or customers use every day."},
    "backends": {"title": "Backends & APIs", "body": "Databases, auth, and APIs with Supabase, FastAPI, and PostgreSQL."}
  },
  "Projects": {
    "tag": "level select",
    "title": "Work",
    "featured": "Featured",
    "viewCase": "View case study",
    "stack": "Stack"
  },
  "About": {
    "tag": "player one",
    "title": "About",
    "bio": "I'm John, a developer who builds fast, good-looking websites and web apps — from the database to the last pixel. I've shipped native iOS and Android apps on Supabase and full-stack systems with FastAPI and PostgreSQL. I work in English and Spanish.",
    "stackTitle": "Tools I use",
    "github": "See my GitHub"
  },
  "Contact": {
    "tag": "continue?",
    "title": "Let's talk",
    "intro": "Tell me about your project. I reply within 48 hours.",
    "name": "Name",
    "email": "Email",
    "message": "Message",
    "send": "Send message",
    "sending": "Sending…",
    "success": "Message sent — I'll reply within 48 hours.",
    "failure": "Couldn't send your message. Reach me directly instead:",
    "rateLimited": "Too many messages. Try again in a few minutes, or reach me directly:",
    "direct": "Prefer to message directly?",
    "whatsapp": "WhatsApp",
    "emailCta": "Email me",
    "whatsappPrefill": "Hi John! I'd like to talk about a project.",
    "errors": {
      "name": "Enter your name (up to 100 characters).",
      "email": "Enter a valid email address.",
      "message": "Write at least 10 characters (up to 2000)."
    }
  },
  "Case": {
    "role": "Role",
    "stack": "Stack",
    "repo": "View code",
    "live": "Visit site",
    "next": "Next project",
    "back": "Back to work"
  },
  "NotFound": {
    "title": "GAME OVER",
    "body": "This page doesn't exist.",
    "cta": "Continue? Back to home"
  },
  "Footer": {"rights": "All rights reserved."}
}
```

`messages/es.json`:

```json
{
  "Meta": {
    "title": "John Casildo — Sitios y aplicaciones web",
    "description": "Desarrollador freelance que crea sitios y aplicaciones web rápidos y memorables, de principio a fin. Español e inglés."
  },
  "Nav": {
    "label": "Principal",
    "services": "Servicios",
    "work": "Proyectos",
    "about": "Sobre mí",
    "contact": "Contacto",
    "switchTo": "EN",
    "switchLabel": "View in English"
  },
  "Hero": {
    "tag": "construye la web",
    "name": "JOHN CASILDO",
    "valueProp": "Sitios y aplicaciones web que se ven bien, cargan rápido y funcionan de verdad — de principio a fin.",
    "ctaWork": "Ver proyectos",
    "ctaContact": "Hablemos",
    "mascotAlt": "Mascota low-poly con un gran peinado y sudadera, de brazos cruzados"
  },
  "Services": {
    "tag": "elige tu modo",
    "title": "Servicios",
    "websites": {"title": "Sitios web", "body": "Sitios rápidos y memorables para negocios, eventos y marcas personales."},
    "webapps": {"title": "Aplicaciones web", "body": "Paneles, portales y herramientas que tu equipo o tus clientes usan todos los días."},
    "backends": {"title": "Backends y APIs", "body": "Bases de datos, autenticación y APIs con Supabase, FastAPI y PostgreSQL."}
  },
  "Projects": {
    "tag": "selecciona nivel",
    "title": "Proyectos",
    "featured": "Destacado",
    "viewCase": "Ver caso de estudio",
    "stack": "Tecnologías"
  },
  "About": {
    "tag": "jugador uno",
    "title": "Sobre mí",
    "bio": "Soy John, desarrollador que crea sitios y aplicaciones web rápidos y atractivos — desde la base de datos hasta el último píxel. He lanzado apps nativas de iOS y Android sobre Supabase y sistemas completos con FastAPI y PostgreSQL. Trabajo en español e inglés.",
    "stackTitle": "Herramientas que uso",
    "github": "Ver mi GitHub"
  },
  "Contact": {
    "tag": "¿continuar?",
    "title": "Hablemos",
    "intro": "Cuéntame sobre tu proyecto. Respondo en menos de 48 horas.",
    "name": "Nombre",
    "email": "Correo",
    "message": "Mensaje",
    "send": "Enviar mensaje",
    "sending": "Enviando…",
    "success": "Mensaje enviado — te respondo en menos de 48 horas.",
    "failure": "No se pudo enviar tu mensaje. Escríbeme directamente:",
    "rateLimited": "Demasiados mensajes. Intenta de nuevo en unos minutos o escríbeme directamente:",
    "direct": "¿Prefieres escribir directamente?",
    "whatsapp": "WhatsApp",
    "emailCta": "Escríbeme",
    "whatsappPrefill": "¡Hola John! Me gustaría hablar sobre un proyecto.",
    "errors": {
      "name": "Escribe tu nombre (hasta 100 caracteres).",
      "email": "Escribe un correo válido.",
      "message": "Escribe al menos 10 caracteres (hasta 2000)."
    }
  },
  "Case": {
    "role": "Rol",
    "stack": "Tecnologías",
    "repo": "Ver código",
    "live": "Visitar sitio",
    "next": "Siguiente proyecto",
    "back": "Volver a proyectos"
  },
  "NotFound": {
    "title": "GAME OVER",
    "body": "Esta página no existe.",
    "cta": "¿Continuar? Volver al inicio"
  },
  "Footer": {"rights": "Todos los derechos reservados."}
}
```

`lib/site.ts`:

```ts
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'http://localhost:3000';
}

export const site = {
  name: 'John Casildo',
  url: siteUrl(),
  email: 'hello@example.com',
  whatsapp: '0000000000',
  github: 'https://github.com/john-casildo',
  stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'FastAPI', 'Docker', 'SwiftUI', 'Jetpack Compose'],
} as const;

/** True for a real international number (digits only, 8–15 long, not the all-zero placeholder). */
export function hasWhatsApp(number: string = site.whatsapp): boolean {
  return /^\d{8,15}$/.test(number) && !/^0+$/.test(number);
}

export function whatsappUrl(text: string, number: string = site.whatsapp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 7: Run the unit tests to verify they pass**

Run: `npm test`
Expected: PASS (2 files, 7 tests).

- [ ] **Step 8: Write the i18n wiring**

`i18n/routing.ts`:

```ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type AppLocale = (typeof routing.locales)[number];
```

`i18n/navigation.ts`:

```ts
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
```

`i18n/request.ts`:

```ts
import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {locale, messages: (await import(`../messages/${locale}.json`)).default};
});
```

`middleware.ts`:

```ts
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
```

`next.config.ts`:

```ts
import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 9: Write theme, fonts, layouts, and the header/footer**

`app/fonts.ts`:

```ts
import {Rubik_Wet_Paint, Sedgwick_Ave, Space_Grotesk} from 'next/font/google';

export const displayFont = Rubik_Wet_Paint({weight: '400', subsets: ['latin'], variable: '--font-wet-paint', display: 'swap'});
export const tagFont = Sedgwick_Ave({weight: '400', subsets: ['latin'], variable: '--font-sedgwick', display: 'swap'});
export const sansFont = Space_Grotesk({subsets: ['latin'], variable: '--font-grotesk', display: 'swap'});

export const fontVariables = `${displayFont.variable} ${tagFont.variable} ${sansFont.variable}`;
```

`app/globals.css` (replace the scaffold version entirely):

```css
@import "tailwindcss";

@theme inline {
  --color-paper: #F3C98B;
  --color-ink: #111111;
  --color-spray: #FF4A1C;
  --color-denim: #1E4E7A;
  --font-display: var(--font-wet-paint), "Rubik Bubbles", system-ui, sans-serif;
  --font-tag: var(--font-sedgwick), "Permanent Marker", cursive;
  --font-sans: var(--font-grotesk), system-ui, sans-serif;
}

html { scroll-behavior: smooth; }
html, body { overflow-x: clip; }

:focus-visible { outline: 3px solid var(--color-denim); outline-offset: 3px; }

.btn-press {
  box-shadow: 0 2px 0 var(--color-ink);
  transition: transform 100ms ease, box-shadow 100ms ease;
}
.btn-press:active { transform: translateY(2px); box-shadow: 0 0 0 var(--color-ink); }

[data-reveal] { transition: opacity 500ms ease, transform 500ms ease; }
[data-reveal="pending"] { opacity: 0; transform: translateY(12px); }

.triangle-fallback {
  background-color: var(--color-paper);
  background-image:
    linear-gradient(135deg, #E8433A 25%, transparent 25%),
    linear-gradient(225deg, #3A6EA5 25%, transparent 25%),
    linear-gradient(315deg, #F2A93B 25%, transparent 25%),
    linear-gradient(45deg, #2A9D8F 25%, transparent 25%);
  background-size: 96px 96px;
  opacity: 0.35;
}

.pixelated canvas, img.pixelated { image-rendering: pixelated; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  [data-reveal] { transition: none; opacity: 1 !important; transform: none !important; }
  .btn-press { transition: none; }
}
```

`app/layout.tsx` (replace the scaffold version):

```tsx
export default function RootLayout({children}: {children: React.ReactNode}) {
  return children;
}
```

`components/ui/button.ts`:

```ts
type Variant = 'primary' | 'secondary';

const variants: Record<Variant, string> = {
  primary: 'bg-spray text-ink',
  secondary: 'bg-paper text-ink',
};

export function buttonClass(variant: Variant = 'primary'): string {
  return `btn-press inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-lg border-2 border-ink px-5 py-3 font-bold ${variants[variant]}`;
}
```

`components/ui/LocaleToggle.tsx`:

```tsx
'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';
import {buttonClass} from './button';

export function LocaleToggle() {
  const locale = useLocale();
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const other = locale === 'en' ? 'es' : 'en';

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      aria-label={t('switchLabel')}
      data-testid="locale-toggle"
      className={buttonClass('secondary')}
    >
      {t('switchTo')}
    </Link>
  );
}
```

`components/ui/Header.tsx`:

```tsx
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {LocaleToggle} from './LocaleToggle';

const SECTIONS = ['services', 'work', 'about', 'contact'] as const;

export async function Header() {
  const t = await getTranslations('Nav');
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="inline-flex min-h-12 items-center font-display text-3xl leading-none">
          JC
        </Link>
        <nav aria-label={t('label')} className="hidden gap-2 md:flex">
          {SECTIONS.map((id) => (
            <Link key={id} href={`/#${id}`} className="inline-flex min-h-12 items-center px-3 font-medium hover:text-denim">
              {t(id)}
            </Link>
          ))}
        </nav>
        <LocaleToggle />
      </div>
    </header>
  );
}
```

`components/ui/Footer.tsx`:

```tsx
import {getTranslations} from 'next-intl/server';
import {site} from '@/lib/site';

export async function Footer() {
  const t = await getTranslations('Footer');
  return (
    <footer className="border-t-2 border-ink bg-paper px-4 py-8 text-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} {site.name}. {t('rights')}</p>
        <div className="flex flex-wrap gap-2">
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center px-2 underline">GitHub</a>
          <a href={`mailto:${site.email}`} className="inline-flex min-h-12 items-center px-2 underline">{site.email}</a>
        </div>
      </div>
    </footer>
  );
}
```

`app/[locale]/layout.tsx`:

```tsx
import {notFound} from 'next/navigation';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {fontVariables} from '@/app/fonts';
import {Header} from '@/components/ui/Header';
import {Footer} from '@/components/ui/Footer';
import '@/app/globals.css';

type Props = {children: React.ReactNode; params: Promise<{locale: string}>};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <body className="bg-paper font-sans text-ink antialiased">
        <NextIntlClientProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`app/[locale]/page.tsx` (temporary; Task 3 replaces it):

```tsx
import {getTranslations, setRequestLocale} from 'next-intl/server';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Hero');
  return <h1 className="px-4 py-20 font-display text-6xl">{t('name')}</h1>;
}
```

- [ ] **Step 10: Write the e2e test**

`tests/e2e/i18n.spec.ts`:

```ts
import {expect, test} from '@playwright/test';

test.describe('English browser', () => {
  test.use({locale: 'en-US'});
  test('/ redirects to /en', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('Spanish browser', () => {
  test.use({locale: 'es-MX'});
  test('/ redirects to /es', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/es$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});

test('locale toggle switches language', async ({page}) => {
  await page.goto('/en');
  await page.getByTestId('locale-toggle').click();
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByTestId('locale-toggle')).toHaveText('EN');
});
```

- [ ] **Step 11: Run all gates**

Run: `npm run lint && npm run typecheck && npm test && npm run e2e`
Expected: all pass, with 0 lint warnings and 4 e2e tests × 2 projects passing. If lint flags scaffold files, fix them rather than ignoring them.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js app with theme, fonts, and EN/ES routing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Project content and loader

**Files:**
- Create: `lib/projects.ts`, `content/projects/{presencia,maruchan-university,stub}.{en,es}.mdx`, `public/projects/{presencia,maruchan-university,stub}.svg`
- Test: `tests/unit/projects.test.ts`, `tests/fixtures/projects/{good,missing-locale,bad-frontmatter}/*.mdx`

**Interfaces:**
- Consumes: `routing`, `AppLocale` from `@/i18n/routing`.
- Produces: `type Project = {title, summary, role, stack: string[], cover, repo?, live?, featured: boolean, order: number, slug: string, locale: AppLocale, body: string}`; `getSlugs(dir?): string[]`; `getProject(slug: string, locale: AppLocale, dir?): Project | null`; `getProjects(locale: AppLocale, dir?): Project[]` (sorted by `order`); `validateContent(dir?): void` (throws `Error` listing every problem).

- [ ] **Step 1: Install dependencies**

```bash
npm i gray-matter@^4 zod@^4
```

- [ ] **Step 2: Create test fixtures**

`tests/fixtures/projects/good/alpha.en.mdx`:

```mdx
---
title: Alpha
summary: First project.
role: Solo developer
stack: [Next.js]
cover: /projects/alpha.svg
repo: https://github.com/example/alpha
featured: true
order: 2
---

## Problem

Alpha body.
```

`tests/fixtures/projects/good/alpha.es.mdx`: the same as above, but with `title: Alfa`, `summary: Primer proyecto.`, `role: Desarrollador único`, and body `## Problema\n\nCuerpo alfa.`

`tests/fixtures/projects/good/beta.en.mdx`:

```mdx
---
title: Beta
summary: Second project.
role: Solo developer
stack: [FastAPI, PostgreSQL]
cover: /projects/beta.svg
featured: false
order: 1
---

Beta body.
```

`tests/fixtures/projects/good/beta.es.mdx`: the same frontmatter with `summary: Segundo proyecto.`, `role: Desarrollador único`, and body `Cuerpo beta.`

`tests/fixtures/projects/missing-locale/gamma.en.mdx`: the same frontmatter shape as `beta.en.mdx`, with `title: Gamma`. (There is deliberately no `gamma.es.mdx`.)

`tests/fixtures/projects/bad-frontmatter/delta.en.mdx`: valid, the same as `beta.en.mdx` with `title: Delta`.
`tests/fixtures/projects/bad-frontmatter/delta.es.mdx`: the `stack:` line is removed, and the cover is `cover: projects/delta.svg` (missing the leading slash).

- [ ] **Step 3: Write the failing test**

`tests/unit/projects.test.ts`:

```ts
import path from 'node:path';
import {describe, expect, test} from 'vitest';
import {getProject, getProjects, getSlugs, validateContent} from '@/lib/projects';

const fixtures = (name: string) => path.join(__dirname, '..', 'fixtures', 'projects', name);

describe('project loader', () => {
  test('lists unique slugs', () => {
    expect(getSlugs(fixtures('good'))).toEqual(['alpha', 'beta']);
  });

  test('getProjects returns localized projects sorted by order', () => {
    const projects = getProjects('es', fixtures('good'));
    expect(projects.map((p) => p.slug)).toEqual(['beta', 'alpha']);
    expect(projects[1]).toMatchObject({title: 'Alfa', locale: 'es', featured: true});
    expect(projects[1]?.body).toContain('Cuerpo alfa');
  });

  test('getProject returns null for unknown or unsafe slugs', () => {
    expect(getProject('nope', 'en', fixtures('good'))).toBeNull();
    expect(getProject('../good/alpha', 'en', fixtures('good'))).toBeNull();
  });

  test('validateContent accepts complete content', () => {
    expect(() => validateContent(fixtures('good'))).not.toThrow();
  });

  test('validateContent reports a missing locale', () => {
    expect(() => validateContent(fixtures('missing-locale'))).toThrow(/gamma: missing es/);
  });

  test('validateContent reports invalid frontmatter with file name', () => {
    expect(() => validateContent(fixtures('bad-frontmatter'))).toThrow(/delta\.es/);
  });

  test('real content is valid and Presencia is the featured project', () => {
    expect(() => validateContent()).not.toThrow();
    const en = getProjects('en');
    expect(en.map((p) => p.slug).sort()).toEqual(['maruchan-university', 'presencia', 'stub']);
    expect(en.filter((p) => p.featured).map((p) => p.slug)).toEqual(['presencia']);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npx vitest run tests/unit/projects.test.ts`
Expected: FAIL, because `@/lib/projects` can't be resolved.

- [ ] **Step 5: Implement the loader**

`lib/projects.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {z} from 'zod';
import {routing, type AppLocale} from '@/i18n/routing';

export const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects');

const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  role: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  cover: z.string().startsWith('/'),
  repo: z.url().optional(),
  live: z.url().optional(),
  featured: z.boolean(),
  order: z.number().int(),
});

export type Project = z.infer<typeof frontmatterSchema> & {slug: string; locale: AppLocale; body: string};

const SLUG_RE = /^[a-z0-9-]+$/;
const FILE_RE = /^([a-z0-9-]+)\.([a-z]{2})\.mdx$/;

type ParseResult = {ok: true; project: Project} | {ok: false; error: string};

function entries(dir: string) {
  return fs
    .readdirSync(dir)
    .map((file) => FILE_RE.exec(file))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({slug: m[1] as string, locale: m[2] as string}));
}

function parse(dir: string, slug: string, locale: AppLocale): ParseResult {
  const raw = fs.readFileSync(path.join(dir, `${slug}.${locale}.mdx`), 'utf8');
  const {data, content} = matter(raw);
  const fm = frontmatterSchema.safeParse(data);
  if (!fm.success) return {ok: false, error: z.prettifyError(fm.error)};
  return {ok: true, project: {...fm.data, slug, locale, body: content}};
}

export function getSlugs(dir: string = CONTENT_DIR): string[] {
  return [...new Set(entries(dir).map((e) => e.slug))].sort();
}

export function validateContent(dir: string = CONTENT_DIR): void {
  const found = entries(dir);
  const problems: string[] = [];
  for (const slug of getSlugs(dir)) {
    for (const locale of routing.locales) {
      if (!found.some((e) => e.slug === slug && e.locale === locale)) {
        problems.push(`${slug}: missing ${locale}`);
        continue;
      }
      const result = parse(dir, slug, locale);
      if (!result.ok) problems.push(`${slug}.${locale}: ${result.error}`);
    }
  }
  if (problems.length > 0) throw new Error(`Invalid project content:\n${problems.join('\n')}`);
}

export function getProject(slug: string, locale: AppLocale, dir: string = CONTENT_DIR): Project | null {
  if (!SLUG_RE.test(slug)) return null;
  if (!fs.existsSync(path.join(dir, `${slug}.${locale}.mdx`))) return null;
  const result = parse(dir, slug, locale);
  if (!result.ok) throw new Error(`${slug}.${locale}: ${result.error}`);
  return result.project;
}

export function getProjects(locale: AppLocale, dir: string = CONTENT_DIR): Project[] {
  return getSlugs(dir)
    .map((slug) => getProject(slug, locale, dir))
    .filter((p): p is Project => p !== null)
    .sort((a, b) => a.order - b.order);
}
```

- [ ] **Step 6: Write the real content**

`content/projects/presencia.en.mdx`:

```mdx
---
title: Presencia
summary: Attendance and activity tracking for small-group leaders — native iOS and Android apps on one Supabase backend.
role: Solo developer — product design, iOS, Android, backend, landing page
stack: [SwiftUI, Jetpack Compose, Supabase, PostgreSQL, Three.js]
cover: /projects/presencia.svg
repo: https://github.com/john-casildo/PresenciaApp
featured: true
order: 1
---

## Problem

Small-group leaders tracked attendance on paper and chat messages. Nobody could see trends, and reports to church leadership took hours.

## What I built

- Native iOS (SwiftUI) and Android (Jetpack Compose) apps sharing one Supabase/PostgreSQL backend with row-level security.
- A meeting-first model: every meeting pre-fills attendance for active members, so a leader records a session in seconds.
- Dynamic activity types scoped globally, by region, or by church, and a deputy flow so helpers can submit without an account.
- A landing page with a scroll-driven 3D phone built in Three.js, with CSS fallbacks.

## Result

Leaders take attendance in under a minute and see charts per group, and one backend serves both platforms.
```

`content/projects/presencia.es.mdx`:

```mdx
---
title: Presencia
summary: Registro de asistencia y actividades para líderes de grupos pequeños — apps nativas de iOS y Android con un solo backend en Supabase.
role: Desarrollador único — diseño de producto, iOS, Android, backend y landing page
stack: [SwiftUI, Jetpack Compose, Supabase, PostgreSQL, Three.js]
cover: /projects/presencia.svg
repo: https://github.com/john-casildo/PresenciaApp
featured: true
order: 1
---

## Problema

Los líderes de grupos pequeños registraban la asistencia en papel y por chat. No se veían tendencias y los informes para la iglesia tomaban horas.

## Lo que construí

- Apps nativas de iOS (SwiftUI) y Android (Jetpack Compose) que comparten un backend en Supabase/PostgreSQL con seguridad a nivel de fila.
- Un modelo centrado en la reunión: cada reunión precarga la asistencia de los miembros activos, así el líder registra una sesión en segundos.
- Tipos de actividad dinámicos (globales, por campo o por iglesia) y un flujo para ayudantes que envían sin cuenta.
- Una landing page con un teléfono 3D animado con el scroll, hecho en Three.js, con alternativas en CSS.

## Resultado

Los líderes toman asistencia en menos de un minuto y ven gráficas por grupo, y un solo backend sirve a ambas plataformas.
```

`content/projects/maruchan-university.en.mdx`:

```mdx
---
title: Maruchan University
summary: A university management system — students, courses, and enrollment — with a FastAPI backend, PostgreSQL, and a Streamlit dashboard, all in Docker.
role: Full-stack developer
stack: [FastAPI, PostgreSQL, Streamlit, Docker]
cover: /projects/maruchan-university.svg
repo: https://github.com/john-casildo/Maruchan_University
featured: false
order: 2
---

## Problem

Academic records (students, courses, and enrollments) needed one consistent source of truth and an interface staff could actually use.

## What I built

- A REST API in FastAPI over a normalized PostgreSQL schema.
- A Streamlit dashboard for managing records.
- A Docker Compose setup, so the whole system starts with one command.

## Result

A complete, containerized system that runs the same way on any machine.
```

`content/projects/maruchan-university.es.mdx`:

```mdx
---
title: Maruchan University
summary: Sistema de gestión universitaria — estudiantes, cursos e inscripciones — con backend en FastAPI, PostgreSQL y panel en Streamlit, todo en Docker.
role: Desarrollador full-stack
stack: [FastAPI, PostgreSQL, Streamlit, Docker]
cover: /projects/maruchan-university.svg
repo: https://github.com/john-casildo/Maruchan_University
featured: false
order: 2
---

## Problema

Los registros académicos (estudiantes, cursos e inscripciones) necesitaban una sola fuente de verdad y una interfaz fácil para el personal.

## Lo que construí

- Una API REST en FastAPI sobre un esquema normalizado en PostgreSQL.
- Un panel en Streamlit para administrar los registros.
- Una configuración con Docker Compose para levantar todo con un comando.

## Resultado

Un sistema completo en contenedores que funciona igual en cualquier máquina.
```

`content/projects/stub.en.mdx`:

```mdx
---
title: Stub
summary: A screenshot-first budgeting app — no bank login, ever. Screenshot receipts and payment confirmations, and Stub turns them into transactions.
role: Solo developer (in progress)
stack: [Flutter, Dart, On-device OCR]
cover: /projects/stub.svg
repo: https://github.com/john-casildo/Stub
featured: false
order: 3
---

## Problem

Budgeting apps ask for your bank password. Many people won't hand it over, so they never budget at all.

## What I built

- A screenshot-based input flow for receipts, payment-app confirmations, and bank-app screens.
- On-device parsing first, with cloud vision only as a fallback for hard reads like itemized receipts.

## Result

In progress: the parsing pipeline works on common receipt formats.
```

`content/projects/stub.es.mdx`:

```mdx
---
title: Stub
summary: App de presupuesto basada en capturas de pantalla — sin pedir tu banco, nunca. Captura recibos y confirmaciones de pago y Stub los convierte en transacciones.
role: Desarrollador único (en progreso)
stack: [Flutter, Dart, OCR en el dispositivo]
cover: /projects/stub.svg
repo: https://github.com/john-casildo/Stub
featured: false
order: 3
---

## Problema

Las apps de presupuesto piden la contraseña del banco. Mucha gente no la comparte, así que nunca hace un presupuesto.

## Lo que construí

- Un flujo de captura para recibos, confirmaciones de apps de pago y pantallas de la app del banco.
- Lectura en el dispositivo primero, con visión en la nube solo como respaldo para casos difíciles como recibos detallados.

## Resultado

En progreso: el proceso de lectura ya funciona con los formatos de recibo más comunes.
```

- [ ] **Step 7: Create cover images**

`public/projects/presencia.svg` (for the other two, use the same file with the colors and title changed, as noted below):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <pattern id="q" width="300" height="300" patternUnits="userSpaceOnUse">
      <polygon points="0,0 150,0 0,150" fill="#E8433A"/>
      <polygon points="150,0 150,150 0,150" fill="#F2A93B"/>
      <polygon points="150,0 300,0 300,150" fill="#3A6EA5"/>
      <polygon points="150,0 150,150 300,150" fill="#F4E04D"/>
      <polygon points="0,150 150,150 150,300" fill="#2A9D8F"/>
      <polygon points="0,150 0,300 150,300" fill="#E86A9E"/>
      <polygon points="150,150 300,150 150,300" fill="#8E5BA8"/>
      <polygon points="300,150 300,300 150,300" fill="#3BB273"/>
    </pattern>
  </defs>
  <rect width="1200" height="750" fill="url(#q)"/>
  <rect x="120" y="255" width="960" height="240" rx="24" fill="#F7F3E8" stroke="#111" stroke-width="8"/>
  <text x="600" y="405" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-size="104" font-weight="900" fill="#111">PRESENCIA</text>
</svg>
```

- `maruchan-university.svg`: the text is `MARUCHAN U.`, and the 8 fills are rotated to start with `#3A6EA5` (order: `#3A6EA5 #F4E04D #E8433A #2A9D8F #8E5BA8 #F2A93B #3BB273 #E86A9E`).
- `stub.svg`: the text is `STUB`, with fills `#3BB273 #E86A9E #F2A93B #8E5BA8 #E8433A #2A9D8F #F4E04D #3A6EA5`.

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm test && npm run lint && npm run typecheck`
Expected: PASS, with 0 warnings.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add MDX project content and validated loader

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Home sections (hero, services, projects, about)

**Files:**
- Create: `components/ui/Badge.tsx`, `components/ui/SectionHeading.tsx`, `components/sections/Hero.tsx`, `components/sections/Services.tsx`, `components/sections/ServiceIcon.tsx`, `components/sections/ProjectsSection.tsx`, `components/sections/ProjectCard.tsx`, `components/sections/About.tsx`, `components/SectionObserver.tsx`, `lib/section-store.ts`
- Modify: `app/[locale]/page.tsx` (full replace)
- Test: `tests/unit/section-store.test.ts`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `buttonClass`, `site`, `getProjects`, `Project`, `Link`.
- Produces: `getActiveSection(): string`, `setActiveSection(id: string): void`, `subscribeActiveSection(listener: () => void): () => void`; section ids `top`, `services`, `work`, `about` (and `contact` in Task 6), each with the `data-section` attribute; `Hero` has an empty mascot slot `<div data-slot="mascot">` that Task 8 fills; elements with `data-reveal` animate in.

- [ ] **Step 1: Write the failing unit test**

`tests/unit/section-store.test.ts`:

```ts
import {expect, test, vi} from 'vitest';
import {getActiveSection, setActiveSection, subscribeActiveSection} from '@/lib/section-store';

test('notifies subscribers only when the section changes', () => {
  const listener = vi.fn();
  const unsubscribe = subscribeActiveSection(listener);
  expect(getActiveSection()).toBe('top');

  setActiveSection('work');
  setActiveSection('work');
  expect(getActiveSection()).toBe('work');
  expect(listener).toHaveBeenCalledTimes(1);

  unsubscribe();
  setActiveSection('about');
  expect(listener).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/section-store.test.ts`
Expected: FAIL, because the module can't be resolved.

- [ ] **Step 3: Implement the store**

`lib/section-store.ts`:

```ts
type Listener = () => void;

let active = 'top';
const listeners = new Set<Listener>();

export function getActiveSection(): string {
  return active;
}

export function setActiveSection(id: string): void {
  if (id === active) return;
  active = id;
  for (const listener of listeners) listener();
}

export function subscribeActiveSection(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
```

Run: `npx vitest run tests/unit/section-store.test.ts`
Expected: PASS.

- [ ] **Step 4: Write the e2e test (it fails until the sections exist)**

`tests/e2e/home.spec.ts`:

```ts
import {expect, test} from '@playwright/test';

for (const [locale, services, work, about] of [
  ['en', 'Services', 'Work', 'About'],
  ['es', 'Servicios', 'Proyectos', 'Sobre mí'],
] as const) {
  test(`${locale} home renders hero and sections`, async ({page}) => {
    await page.goto(`/${locale}`);
    await expect(page.getByRole('heading', {level: 1, name: 'JOHN CASILDO'})).toBeVisible();
    await expect(page.locator('#services').getByRole('heading', {level: 2})).toHaveText(services);
    await expect(page.locator('#work').getByRole('heading', {level: 2})).toHaveText(work);
    await expect(page.locator('#about').getByRole('heading', {level: 2})).toHaveText(about);
    await expect(page.getByTestId('project-card')).toHaveCount(3);
    await expect(page.getByTestId('project-card').first()).toContainText('Presencia');
  });
}

test('hero CTA scrolls to work section', async ({page}) => {
  await page.goto('/en');
  await page.getByRole('link', {name: 'See work'}).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('#work')).toBeInViewport();
});

test.describe('phone width', () => {
  test.use({viewport: {width: 375, height: 812}});
  test('no horizontal scroll', async ({page}) => {
    for (const locale of ['en', 'es']) {
      await page.goto(`/${locale}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const h1Box = await page.getByRole('heading', {level: 1}).boundingBox();
      expect(h1Box && h1Box.x + h1Box.width).toBeLessThanOrEqual(375);
    }
  });
});
```

- [ ] **Step 5: Implement the UI pieces**

`components/ui/Badge.tsx`:

```tsx
export function Badge({children}: {children: React.ReactNode}) {
  return (
    <span className="inline-flex items-center rounded-full border-2 border-ink bg-paper px-3 py-1 text-sm font-medium">
      {children}
    </span>
  );
}
```

`components/ui/SectionHeading.tsx`:

```tsx
export function SectionHeading({id, tag, title}: {id: string; tag: string; title: string}) {
  return (
    <div>
      <p aria-hidden="true" className="font-tag text-2xl text-denim">{tag}</p>
      <h2 id={`${id}-title`} className="font-display text-5xl leading-none md:text-6xl">{title}</h2>
    </div>
  );
}
```

`components/sections/Hero.tsx`:

```tsx
import {getTranslations} from 'next-intl/server';
import {buttonClass} from '@/components/ui/button';

export async function Hero() {
  const t = await getTranslations('Hero');
  return (
    <section id="top" data-section aria-labelledby="top-title" className="relative">
      <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-6xl items-center gap-6 px-4 py-10 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-ink bg-paper/95 p-6 shadow-[6px_6px_0_var(--color-ink)] md:p-8">
          <p aria-hidden="true" className="font-tag text-2xl text-denim">{t('tag')}</p>
          <h1 id="top-title" className="font-display text-5xl leading-[0.95] break-words sm:text-7xl lg:text-8xl">
            {t('name')}
          </h1>
          <p className="mt-4 max-w-md text-lg">{t('valueProp')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#work" className={buttonClass('primary')}>{t('ctaWork')}</a>
            <a href="#contact" className={buttonClass('secondary')}>{t('ctaContact')}</a>
          </div>
        </div>
        <div data-slot="mascot" className="relative h-[45svh] md:h-[70svh]" />
      </div>
    </section>
  );
}
```

`components/sections/ServiceIcon.tsx`:

```tsx
type Kind = 'websites' | 'webapps' | 'backends';

const shapes: Record<Kind, Array<{points: string; fill: string}>> = {
  websites: [
    {points: '4,10 60,10 60,54 4,54', fill: '#F7F3E8'},
    {points: '4,10 60,10 60,20 4,20', fill: '#E8433A'},
    {points: '12,28 36,28 12,46', fill: '#3A6EA5'},
    {points: '40,28 52,46 28,46', fill: '#F2A93B'},
  ],
  webapps: [
    {points: '8,8 44,8 44,36 8,36', fill: '#2A9D8F'},
    {points: '16,18 52,18 52,46 16,46', fill: '#F4E04D'},
    {points: '24,28 60,28 60,56 24,56', fill: '#8E5BA8'},
  ],
  backends: [
    {points: '10,12 54,12 54,24 10,24', fill: '#3BB273'},
    {points: '10,28 54,28 54,40 10,40', fill: '#E86A9E'},
    {points: '10,44 54,44 54,56 10,56', fill: '#3A6EA5'},
    {points: '44,16 50,16 47,20', fill: '#111111'},
  ],
};

export function ServiceIcon({kind}: {kind: Kind}) {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
      {shapes[kind].map((s) => (
        <polygon key={s.points} points={s.points} fill={s.fill} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
```

`components/sections/Services.tsx`:

```tsx
import {getTranslations} from 'next-intl/server';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {ServiceIcon} from './ServiceIcon';

const KINDS = ['websites', 'webapps', 'backends'] as const;

export async function Services() {
  const t = await getTranslations('Services');
  return (
    <section id="services" data-section aria-labelledby="services-title" className="border-t-2 border-ink bg-paper/90">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading id="services" tag={t('tag')} title={t('title')} />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {KINDS.map((kind) => (
            <li key={kind} data-reveal className="rounded-2xl border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_var(--color-ink)]">
              <ServiceIcon kind={kind} />
              <h3 className="mt-4 text-2xl font-bold">{t(`${kind}.title`)}</h3>
              <p className="mt-2">{t(`${kind}.body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

`components/sections/ProjectCard.tsx`:

```tsx
import Image from 'next/image';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {buttonClass} from '@/components/ui/button';
import type {Project} from '@/lib/projects';

type Labels = {featured: string; viewCase: string; stack: string};

export function ProjectCard({project, labels}: {project: Project; labels: Labels}) {
  return (
    <article
      data-testid="project-card"
      data-reveal
      className={`flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[6px_6px_0_var(--color-ink)] ${project.featured ? 'md:col-span-2' : ''}`}
    >
      <Image src={project.cover} alt="" width={1200} height={750} unoptimized className="aspect-[16/10] w-full border-b-2 border-ink object-cover" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {project.featured && <span className="w-fit rounded bg-spray px-2 py-0.5 text-sm font-bold">{labels.featured}</span>}
        <h3 className="text-2xl font-bold">{project.title}</h3>
        <p>{project.summary}</p>
        <ul aria-label={labels.stack} className="flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <li key={s}><Badge>{s}</Badge></li>
          ))}
        </ul>
        <Link href={`/projects/${project.slug}`} className={`${buttonClass('secondary')} mt-auto w-fit`}>
          {labels.viewCase}
          <span className="sr-only">: {project.title}</span>
        </Link>
      </div>
    </article>
  );
}
```

`components/sections/ProjectsSection.tsx`:

```tsx
import {getTranslations} from 'next-intl/server';
import {SectionHeading} from '@/components/ui/SectionHeading';
import type {Project} from '@/lib/projects';
import {ProjectCard} from './ProjectCard';

export async function ProjectsSection({projects}: {projects: Project[]}) {
  const t = await getTranslations('Projects');
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
  const labels = {featured: t('featured'), viewCase: t('viewCase'), stack: t('stack')};
  return (
    <section id="work" data-section aria-labelledby="work-title" className="border-t-2 border-ink bg-paper/90">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading id="work" tag={t('tag')} title={t('title')} />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ordered.map((project) => (
            <ProjectCard key={project.slug} project={project} labels={labels} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

`components/sections/About.tsx`:

```tsx
import {getTranslations} from 'next-intl/server';
import {Badge} from '@/components/ui/Badge';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {buttonClass} from '@/components/ui/button';
import {site} from '@/lib/site';

export async function About() {
  const t = await getTranslations('About');
  return (
    <section id="about" data-section aria-labelledby="about-title" className="border-t-2 border-ink bg-paper/90">
      <div data-reveal className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading id="about" tag={t('tag')} title={t('title')} />
        <p className="mt-6 max-w-2xl text-lg">{t('bio')}</p>
        <h3 className="mt-8 font-bold">{t('stackTitle')}</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {site.stack.map((s) => (
            <li key={s}><Badge>{s}</Badge></li>
          ))}
        </ul>
        <a href={site.github} target="_blank" rel="noopener noreferrer" className={`${buttonClass('secondary')} mt-8`}>
          {t('github')}
        </a>
      </div>
    </section>
  );
}
```

`components/SectionObserver.tsx`:

```tsx
'use client';

import {useEffect} from 'react';
import {setActiveSection} from '@/lib/section-store';

export function SectionObserver() {
  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      {rootMargin: '-45% 0px -45% 0px'},
    );
    document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => sectionObserver.observe(el));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = 'done';
          revealObserver.unobserve(entry.target);
        }
      },
      {threshold: 0.15},
    );
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.dataset.reveal = 'pending';
        revealObserver.observe(el);
      } else {
        el.dataset.reveal = 'done';
      }
    });

    return () => {
      sectionObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  return null;
}
```

Content is never hidden without JavaScript: only elements that JS marks `pending` start hidden.

`app/[locale]/page.tsx` (full replace):

```tsx
import {notFound} from 'next/navigation';
import {hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {getProjects} from '@/lib/projects';
import {Hero} from '@/components/sections/Hero';
import {Services} from '@/components/sections/Services';
import {ProjectsSection} from '@/components/sections/ProjectsSection';
import {About} from '@/components/sections/About';
import {SectionObserver} from '@/components/SectionObserver';

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Services />
      <ProjectsSection projects={getProjects(locale)} />
      <About />
      <SectionObserver />
    </>
  );
}
```

- [ ] **Step 6: Run all gates**

Run: `npm run lint && npm run typecheck && npm test && npm run e2e`
Expected: all pass. If the 375px test fails because the h1 overflows, reduce the base size from `text-5xl` to `text-[2.75rem]` (it must stay ≥ 40px).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add hero, services, projects, and about sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Case study pages, 404, SEO

**Files:**
- Create: `app/[locale]/projects/[slug]/page.tsx`, `components/mdx.tsx`, `app/[locale]/not-found.tsx`, `app/[locale]/[...rest]/page.tsx`, `app/not-found.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/[locale]/opengraph-image.tsx`
- Modify: `app/[locale]/layout.tsx` (add `generateMetadata`)
- Test: `tests/e2e/case-study.spec.ts`

**Interfaces:**
- Consumes: `getProject`, `getProjects`, `getSlugs`, `validateContent`, `site`, `buttonClass`, `Badge`, `Link`.
- Produces: routes `/{locale}/projects/{slug}` (static only, `dynamicParams = false`), `/sitemap.xml`, `/robots.txt`, `/{locale}/opengraph-image`.

- [ ] **Step 1: Install the MDX renderer**

```bash
npm i next-mdx-remote@^6
```

- [ ] **Step 2: Write the failing e2e test**

`tests/e2e/case-study.spec.ts`:

```ts
import {expect, test} from '@playwright/test';

const SLUGS = ['presencia', 'maruchan-university', 'stub'];

for (const locale of ['en', 'es']) {
  for (const slug of SLUGS) {
    test(`${locale}/${slug} renders`, async ({page}) => {
      const res = await page.goto(`/${locale}/projects/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.getByRole('heading', {level: 1})).toBeVisible();
      await expect(page.getByRole('heading', {level: 2}).first()).toBeVisible();
    });
  }
}

test('project card opens case study, toggle keeps the project', async ({page}) => {
  await page.goto('/en');
  await page.getByRole('link', {name: /View case study: Presencia/}).click();
  await expect(page).toHaveURL(/\/en\/projects\/presencia$/);
  await expect(page.getByRole('heading', {level: 2, name: 'Problem'})).toBeVisible();
  await page.getByTestId('locale-toggle').click();
  await expect(page).toHaveURL(/\/es\/projects\/presencia$/);
  await expect(page.getByRole('heading', {level: 2, name: 'Problema'})).toBeVisible();
});

for (const path of ['/en/projects/nope', '/es/whatever/deep', '/en/projects/..%2Fsecret']) {
  test(`${path} is a styled 404`, async ({page}) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', {name: 'GAME OVER'})).toBeVisible();
  });
}

test('sitemap lists both locales and projects', async ({request}) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain('/es/projects/presencia');
  expect(xml).toContain('/en</loc>');
});

test('home has localized metadata', async ({page}) => {
  await page.goto('/es');
  await expect(page).toHaveTitle(/Sitios y aplicaciones web/);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx playwright test tests/e2e/case-study.spec.ts --project=desktop`
Expected: FAIL (404s for case pages, missing sitemap).

- [ ] **Step 4: Implement**

`components/mdx.tsx`:

```tsx
import type {MDXComponents} from 'mdx/types';

export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 className="mt-10 font-display text-4xl" {...props} />,
  p: (props) => <p className="mt-4 text-lg leading-relaxed" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-lg" {...props} />,
  a: (props) => <a className="text-denim underline" {...props} />,
};
```

(If `mdx/types` isn't resolvable, run `npm i -D @types/mdx`.)

`app/[locale]/projects/[slug]/page.tsx`:

```tsx
import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {MDXRemote} from 'next-mdx-remote/rsc';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getProject, getProjects, getSlugs, validateContent} from '@/lib/projects';
import {Badge} from '@/components/ui/Badge';
import {buttonClass} from '@/components/ui/button';
import {mdxComponents} from '@/components/mdx';

type Params = {locale: string; slug: string};

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  validateContent();
  return routing.locales.flatMap((locale) => getSlugs().map((slug) => ({locale, slug})));
}

export async function generateMetadata({params}: {params: Promise<Params>}): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const project = getProject(slug, locale);
  if (!project) return {};
  return {
    title: `${project.title} — John Casildo`,
    description: project.summary,
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/projects/${slug}`])),
    },
  };
}

export default async function ProjectPage({params}: {params: Promise<Params>}) {
  const {locale, slug} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const project = getProject(slug, locale);
  if (!project) notFound();

  const t = await getTranslations('Case');
  const all = getProjects(locale);
  const next = all[(all.findIndex((p) => p.slug === slug) + 1) % all.length];

  return (
    <article className="bg-paper/90">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/#work" className="inline-flex min-h-12 items-center font-medium underline">← {t('back')}</Link>
        <h1 className="mt-4 font-display text-5xl leading-none md:text-7xl">{project.title}</h1>
        <p className="mt-4 text-xl">{project.summary}</p>
        <Image src={project.cover} alt="" width={1200} height={750} unoptimized priority className="mt-8 w-full rounded-2xl border-2 border-ink" />
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div><dt className="font-bold">{t('role')}</dt><dd>{project.role}</dd></div>
          <div>
            <dt className="font-bold">{t('stack')}</dt>
            <dd className="mt-1 flex flex-wrap gap-2">{project.stack.map((s) => <Badge key={s}>{s}</Badge>)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          {project.live && <a href={project.live} target="_blank" rel="noopener noreferrer" className={buttonClass('primary')}>{t('live')}</a>}
          {project.repo && <a href={project.repo} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary')}>{t('repo')}</a>}
        </div>
        <div className="mt-4">
          <MDXRemote source={project.body} components={mdxComponents} />
        </div>
        {next && next.slug !== slug && (
          <Link href={`/projects/${next.slug}`} className={`${buttonClass('primary')} mt-12`}>
            {t('next')}: {next.title} →
          </Link>
        )}
      </div>
    </article>
  );
}
```

`app/[locale]/not-found.tsx`:

```tsx
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {buttonClass} from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-6xl">{t('title')}</h1>
      <p className="text-lg">{t('body')}</p>
      <Link href="/" className={buttonClass('primary')}>{t('cta')}</Link>
    </section>
  );
}
```

`app/[locale]/[...rest]/page.tsx`:

```tsx
import {notFound} from 'next/navigation';

export default function CatchAll() {
  notFound();
}
```

`app/not-found.tsx` (for paths outside locales, which is rare because the middleware redirects them):

```tsx
import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F3C98B', color: '#111', fontFamily: 'system-ui, sans-serif'}}>
        <main style={{textAlign: 'center'}}>
          <h1>GAME OVER</h1>
          <Link href="/">Continue?</Link>
        </main>
      </body>
    </html>
  );
}
```

`app/sitemap.ts`:

```ts
import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {getSlugs} from '@/lib/projects';
import {site} from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', ...getSlugs().map((slug) => `/projects/${slug}`)];
  return paths.flatMap((p) =>
    routing.locales.map((locale) => ({
      url: `${site.url}/${locale}${p}`,
      alternates: {languages: Object.fromEntries(routing.locales.map((l) => [l, `${site.url}/${l}${p}`]))},
    })),
  );
}
```

`app/robots.ts`:

```ts
import type {MetadataRoute} from 'next';
import {site} from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {rules: {userAgent: '*', allow: '/'}, sitemap: `${site.url}/sitemap.xml`};
}
```

`app/[locale]/opengraph-image.tsx`:

```tsx
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
```

Add to `app/[locale]/layout.tsx` (new imports: `import type {Metadata} from 'next';`, `getTranslations` from `next-intl/server`, `site` from `@/lib/site`):

```tsx
export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({locale, namespace: 'Meta'});
  return {
    metadataBase: new URL(site.url),
    title: t('title'),
    description: t('description'),
    alternates: {canonical: `/${locale}`, languages: {en: '/en', es: '/es', 'x-default': '/en'}},
    openGraph: {title: t('title'), description: t('description'), siteName: site.name, type: 'website', locale: locale === 'es' ? 'es_ES' : 'en_US'},
  };
}
```

- [ ] **Step 5: Run all gates**

Run: `npm run lint && npm run typecheck && npm test && npm run e2e`
Expected: all pass. `npm run build` output lists `/[locale]/projects/[slug]` with 6 static paths.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add case study pages, localized 404, sitemap, and metadata

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Contact API (validation, rate limit, email)

**Files:**
- Create: `lib/contact-schema.ts`, `lib/rate-limit.ts`, `lib/contact-handler.ts`, `lib/contact-email.ts`, `app/api/contact/route.ts`, `.env.example`
- Test: `tests/unit/contact-schema.test.ts`, `tests/unit/rate-limit.test.ts`, `tests/unit/contact-handler.test.ts`

**Interfaces:**
- Produces:
  - `contactSchema` (zod), `type ContactInput = z.input<typeof contactSchema>`, `type ContactField = 'name' | 'email' | 'message'`, `fieldErrors(error: z.ZodError): ContactField[]`
  - `createRateLimiter({limit, windowMs, now?}): {check(key: string): boolean}`
  - `type ContactMessage = {name: string; email: string; message: string}`, `type SendEmail = (msg: ContactMessage) => Promise<void>`
  - `createContactHandler({send, limiter, getIp}): (req: Request) => Promise<Response>`
  - `createResendSender(env: {apiKey?: string; to?: string; from?: string}): SendEmail`
  - `POST /api/contact`

- [ ] **Step 1: Install Resend**

```bash
npm i resend@^6
```

- [ ] **Step 2: Write the failing tests**

`tests/unit/contact-schema.test.ts`:

```ts
import {describe, expect, test} from 'vitest';
import {contactSchema, fieldErrors} from '@/lib/contact-schema';

const valid = {name: 'Ana', email: 'ana@example.com', message: 'I need a website for my bakery.'};

describe('contactSchema', () => {
  test('accepts valid input and trims', () => {
    const r = contactSchema.parse({...valid, name: '  Ana  ', email: ' ana@example.com '});
    expect(r).toEqual({...valid, company: ''});
  });

  test.each([
    ['name', {name: '   '}],
    ['name', {name: 'a'.repeat(101)}],
    ['name', {name: 'Ana\r\nBcc: x@evil.com'}],
    ['email', {email: 'not-an-email'}],
    ['email', {email: '   '}],
    ['message', {message: '          '}],
    ['message', {message: 'too short'}],
    ['message', {message: 'x'.repeat(2001)}],
  ] as const)('rejects bad %s', (field, patch) => {
    const r = contactSchema.safeParse({...valid, ...patch});
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error)).toEqual([field]);
  });

  test('fieldErrors lists each field once, in form order', () => {
    const r = contactSchema.safeParse({});
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error)).toEqual(['name', 'email', 'message']);
  });
});
```

`tests/unit/rate-limit.test.ts`:

```ts
import {expect, test} from 'vitest';
import {createRateLimiter} from '@/lib/rate-limit';

test('allows `limit` hits per window per key, then blocks, then recovers', () => {
  let now = 0;
  const limiter = createRateLimiter({limit: 5, windowMs: 600_000, now: () => now});
  for (let i = 0; i < 5; i++) expect(limiter.check('a')).toBe(true);
  expect(limiter.check('a')).toBe(false);
  expect(limiter.check('b')).toBe(true);
  now = 600_001;
  expect(limiter.check('a')).toBe(true);
});
```

`tests/unit/contact-handler.test.ts`:

```ts
import {beforeEach, describe, expect, test, vi} from 'vitest';
import {createContactHandler} from '@/lib/contact-handler';
import {createRateLimiter} from '@/lib/rate-limit';
import {createResendSender} from '@/lib/contact-email';

const valid = {name: 'Ana', email: 'ana@example.com', message: 'I need a website for my bakery.'};

function post(body: unknown, ip = '1.2.3.4') {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: {'content-type': 'application/json', 'x-forwarded-for': ip},
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('contact handler', () => {
  const send = vi.fn<(m: {name: string; email: string; message: string}) => Promise<void>>();
  let handler: (req: Request) => Promise<Response>;

  beforeEach(() => {
    send.mockReset().mockResolvedValue(undefined);
    handler = createContactHandler({
      send,
      limiter: createRateLimiter({limit: 5, windowMs: 600_000}),
      getIp: (req) => req.headers.get('x-forwarded-for') ?? 'unknown',
    });
  });

  test('valid → 200 and sends trimmed message', async () => {
    const res = await handler(post({...valid, name: ' Ana '}));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ok: true});
    expect(send).toHaveBeenCalledWith(valid);
  });

  test('invalid fields → 400 with field list', async () => {
    const res = await handler(post({...valid, email: 'nope'}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({error: 'invalid', fields: ['email']});
    expect(send).not.toHaveBeenCalled();
  });

  test.each(['not json', '', '[]', 'null'])('malformed body %j → 400', async (body) => {
    const res = await handler(post(body));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid');
  });

  test('honeypot → silent 200, nothing sent', async () => {
    const res = await handler(post({...valid, company: 'Spam Inc'}));
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  test('6th request from same IP → 429', async () => {
    for (let i = 0; i < 5; i++) expect((await handler(post(valid))).status).toBe(200);
    const res = await handler(post(valid));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({error: 'rate_limited'});
  });

  test('provider failure → 500 without leaking details', async () => {
    send.mockRejectedValue(new Error('API key sk_live_secret invalid'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await handler(post(valid));
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({error: 'send_failed'});
    expect(text).not.toContain('sk_live');
  });
});

describe('createResendSender', () => {
  test('rejects when not configured', async () => {
    const send = createResendSender({apiKey: undefined, to: 'me@x.com', from: 'site@x.com'});
    await expect(send(valid)).rejects.toThrow(/not configured/);
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `npm test`
Expected: FAIL, because the modules can't be resolved.

- [ ] **Step 4: Implement**

`lib/contact-schema.ts`:

```ts
import {z} from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100).regex(/^[^\r\n]*$/),
  email: z.string().trim().max(254).pipe(z.email()),
  message: z.string().trim().min(10).max(2000),
  company: z.string().max(200).optional().default(''),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactField = 'name' | 'email' | 'message';

const FIELDS: ContactField[] = ['name', 'email', 'message'];

export function fieldErrors(error: z.ZodError): ContactField[] {
  const bad = new Set(error.issues.map((issue) => issue.path[0]));
  return FIELDS.filter((f) => bad.has(f));
}
```

`lib/rate-limit.ts`:

```ts
type Options = {limit: number; windowMs: number; now?: () => number};

/** Best-effort, per-instance sliding-window limiter (fine for a low-traffic contact form). */
export function createRateLimiter({limit, windowMs, now = Date.now}: Options) {
  const hits = new Map<string, number[]>();
  return {
    check(key: string): boolean {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.set(key, recent);
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.every((at) => t - at >= windowMs)) hits.delete(k);
      }
      return true;
    },
  };
}
```

`lib/contact-handler.ts`:

```ts
import {contactSchema, fieldErrors} from './contact-schema';

export type ContactMessage = {name: string; email: string; message: string};
export type SendEmail = (msg: ContactMessage) => Promise<void>;

type Deps = {
  send: SendEmail;
  limiter: {check(key: string): boolean};
  getIp: (req: Request) => string;
};

export function createContactHandler({send, limiter, getIp}: Deps) {
  return async function handle(req: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({error: 'invalid', fields: []}, {status: 400});
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({error: 'invalid', fields: fieldErrors(parsed.error)}, {status: 400});
    }

    const {company, ...message} = parsed.data;
    if (company) return Response.json({ok: true});

    if (!limiter.check(getIp(req))) {
      return Response.json({error: 'rate_limited'}, {status: 429});
    }

    try {
      await send(message);
    } catch (error) {
      console.error('contact: send failed', error instanceof Error ? error.message : error);
      return Response.json({error: 'send_failed'}, {status: 500});
    }
    return Response.json({ok: true});
  };
}
```

`lib/contact-email.ts`:

```ts
import {Resend} from 'resend';
import type {SendEmail} from './contact-handler';

type Env = {apiKey?: string; to?: string; from?: string};

export function createResendSender({apiKey, to, from}: Env): SendEmail {
  return async ({name, email, message}) => {
    if (!apiKey || !to || !from) throw new Error('contact email not configured');
    const {error} = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Portfolio] ${name}`,
      text: `${name} <${email}>\n\n${message}`,
    });
    if (error) throw new Error(error.message);
  };
}
```

`app/api/contact/route.ts`:

```ts
import {createContactHandler} from '@/lib/contact-handler';
import {createResendSender} from '@/lib/contact-email';
import {createRateLimiter} from '@/lib/rate-limit';

export const runtime = 'nodejs';

export const POST = createContactHandler({
  send: createResendSender({
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.CONTACT_TO_EMAIL,
    from: process.env.CONTACT_FROM_EMAIL,
  }),
  limiter: createRateLimiter({limit: 5, windowMs: 10 * 60_000}),
  getIp: (req) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
});
```

`.env.example`:

```
# Resend (https://resend.com) — contact form email delivery
RESEND_API_KEY=
CONTACT_TO_EMAIL=
# Must be a verified sender/domain in Resend; "onboarding@resend.dev" works for testing
CONTACT_FROM_EMAIL=
# Optional: canonical site URL for metadata/sitemap
NEXT_PUBLIC_SITE_URL=
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test && npm run lint && npm run typecheck`
Expected: PASS. If the `'[]'` or `'null'` cases fail, check that zod rejects non-objects. It should, because `contactSchema` is a `z.object`.

- [ ] **Step 6: Smoke-test the route**

```bash
npm run build && (npm run start -- -p 3200 &) && sleep 5
curl -s -X POST localhost:3200/api/contact -H 'content-type: application/json' -d 'nope'; echo
curl -s -X POST localhost:3200/api/contact -H 'content-type: application/json' \
  -d '{"name":"Ana","email":"ana@example.com","message":"Hello there, testing."}'; echo
kill %1 2>/dev/null || pkill -f "next start -p 3200"
```

Expected: `{"error":"invalid","fields":[]}`, then `{"error":"send_failed"}` (no key is configured).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add contact API with validation, rate limiting, and Resend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Contact section UI

**Files:**
- Create: `components/sections/Contact.tsx`, `components/sections/ContactForm.tsx`, `components/sections/DirectLinks.tsx`
- Modify: `app/[locale]/page.tsx` (render `<Contact />` after `<About />`)
- Test: `tests/e2e/contact.spec.ts`, and add a `#contact` assertion to `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `contactSchema`, `fieldErrors`, `ContactField`, `site`, `hasWhatsApp`, `whatsappUrl`, `buttonClass`, `SectionHeading`.
- Produces: section `#contact`; test ids `contact-form`, `contact-success`, `contact-failure`, `whatsapp-link`, `email-link`.

- [ ] **Step 1: Write the failing e2e test**

`tests/e2e/contact.spec.ts`:

```ts
import {expect, test, type Page} from '@playwright/test';

async function fill(page: Page, {name = 'Ana', email = 'ana@example.com', message = 'I need a website for my bakery.'} = {}) {
  const form = page.getByTestId('contact-form');
  await form.getByLabel('Name').fill(name);
  await form.getByLabel('Email').fill(email);
  await form.getByLabel('Message').fill(message);
  return form;
}

test('client validation blocks bad input without a request', async ({page}) => {
  let requests = 0;
  await page.route('**/api/contact', (route) => {
    requests++;
    return route.fulfill({json: {ok: true}});
  });
  await page.goto('/en#contact');
  const form = await fill(page, {name: '   ', email: 'nope', message: '          '});
  await form.getByRole('button', {name: 'Send message'}).click();
  await expect(form.getByText('Enter your name')).toBeVisible();
  await expect(form.getByText('Enter a valid email')).toBeVisible();
  await expect(form.getByText('Write at least 10 characters')).toBeVisible();
  await expect(form.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
  expect(requests).toBe(0);
});

test('success path', async ({page}) => {
  let payload: unknown;
  await page.route('**/api/contact', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({json: {ok: true}});
  });
  await page.goto('/en#contact');
  const form = await fill(page);
  await form.getByRole('button', {name: 'Send message'}).click();
  await expect(page.getByTestId('contact-success')).toContainText('Message sent');
  expect(payload).toMatchObject({name: 'Ana', email: 'ana@example.com', company: ''});
});

test('server failure shows direct links', async ({page}) => {
  await page.route('**/api/contact', (route) => route.fulfill({status: 500, json: {error: 'send_failed'}}));
  await page.goto('/en#contact');
  const form = await fill(page);
  await form.getByRole('button', {name: 'Send message'}).click();
  const failure = page.getByTestId('contact-failure');
  await expect(failure).toContainText("Couldn't send");
  await expect(failure.getByTestId('email-link')).toHaveAttribute('href', /^mailto:/);
});

test('rate limited message', async ({page}) => {
  await page.route('**/api/contact', (route) => route.fulfill({status: 429, json: {error: 'rate_limited'}}));
  await page.goto('/en#contact');
  const form = await fill(page);
  await form.getByRole('button', {name: 'Send message'}).click();
  await expect(page.getByTestId('contact-failure')).toContainText('Too many messages');
});

test('WhatsApp button hidden while number is a placeholder', async ({page}) => {
  await page.goto('/en#contact');
  await expect(page.getByTestId('whatsapp-link')).toHaveCount(0);
  await expect(page.locator('#contact').getByTestId('email-link').first()).toBeVisible();
});

test('spanish labels', async ({page}) => {
  await page.goto('/es#contact');
  const form = page.getByTestId('contact-form');
  await expect(form.getByLabel('Nombre')).toBeVisible();
  await expect(form.getByRole('button', {name: 'Enviar mensaje'})).toBeVisible();
});
```

In `tests/e2e/home.spec.ts`, add the following to the per-locale test. The `for` tuple gets a 5th element, `contact` (`'Let\'s talk'` / `'Hablemos'`):

```ts
await expect(page.locator('#contact').getByRole('heading', {level: 2})).toHaveText(contact);
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/contact.spec.ts --project=desktop`
Expected: FAIL, because `contact-form` isn't found.

- [ ] **Step 3: Implement**

`components/sections/DirectLinks.tsx`:

```tsx
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
```

`components/sections/ContactForm.tsx`:

```tsx
'use client';

import {useState, type FormEvent, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {buttonClass} from '@/components/ui/button';
import {contactSchema, fieldErrors, type ContactField} from '@/lib/contact-schema';

type Status = 'idle' | 'sending' | 'success' | 'failure' | 'rate_limited';

const inputClass =
  'mt-1 block min-h-12 w-full rounded-lg border-2 border-ink bg-[#F7F3E8] px-3 py-2 text-base aria-[invalid=true]:border-spray';

export function ContactForm({directLinks}: {directLinks: ReactNode}) {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<ContactField[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
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
        setErrors(body?.fields ?? []);
        setStatus('idle');
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
        <p id={`contact-${name}-error`} className="mt-1 font-medium text-ink underline decoration-spray decoration-2">
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
      <div aria-hidden="true" className="absolute -left-[9999px] top-0">
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button type="submit" disabled={status === 'sending'} className={`${buttonClass('primary')} w-fit disabled:opacity-60`}>
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
```

`components/sections/Contact.tsx`:

```tsx
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
```

In `app/[locale]/page.tsx`, import `Contact` and render `<Contact />` between `<About />` and `<SectionObserver />`.

- [ ] **Step 4: Run all gates**

Run: `npm run lint && npm run typecheck && npm test && npm run e2e`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add contact section with form and direct links

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Animated triangle-quilt background

**Files:**
- Create: `lib/random.ts`, `lib/palette.ts`, `lib/quilt.ts`, `lib/webgl.ts`, `hooks/useReducedMotion.ts`, `components/three/WebGLGate.tsx`, `components/three/TriangleField.tsx`, `components/three/BackgroundCanvas.tsx`, `components/three/Background.tsx`
- Modify: `app/[locale]/layout.tsx` (render `<Background />` first inside `<body>`)
- Test: `tests/unit/quilt.test.ts`, `tests/e2e/three.spec.ts`

**Interfaces:**
- Consumes: `subscribeActiveSection` (Task 3).
- Produces: `mulberry32(seed: number): () => number`; `QUILT: readonly string[]`; `buildQuilt(width, height, targetCell, rand, paletteSize): Quilt` with `Quilt = {count, cols, rows, cell, centers: Float32Array, orient: Float32Array, colorIndex: Uint8Array, seeds: Float32Array}`; `repattern(orient: Float32Array, rand): Float32Array`; `MAX_TRIANGLES = 2000`; `hasWebGL(): boolean`; `useReducedMotion(): boolean`; `<WebGLGate fallback pending?>`; test ids `bg-canvas`, `bg-fallback`.

- [ ] **Step 1: Install three**

```bash
npm i three@^0.186 @react-three/fiber@^9
npm i -D @types/three
```

(drei isn't needed: nothing in this plan uses it. YAGNI.)

- [ ] **Step 2: Write the failing unit test**

`tests/unit/quilt.test.ts`:

```ts
import {describe, expect, test} from 'vitest';
import {buildQuilt, MAX_TRIANGLES, repattern} from '@/lib/quilt';
import {mulberry32} from '@/lib/random';

describe('mulberry32', () => {
  test('is deterministic and in [0,1)', () => {
    const a = mulberry32(7), b = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('buildQuilt', () => {
  test('covers the viewport with complementary pairs', () => {
    const q = buildQuilt(1440, 900, 64, mulberry32(1), 9);
    expect(q.cols * q.cell).toBeGreaterThanOrEqual(1440);
    expect(q.rows * q.cell).toBeGreaterThanOrEqual(900);
    expect(q.count).toBe(q.cols * q.rows * 2);
    for (let i = 0; i < q.count; i += 2) expect((q.orient[i]! + 2) % 4).toBe(q.orient[i + 1]);
    expect(Math.max(...q.colorIndex)).toBeLessThan(9);
  });

  test('caps triangle count on huge screens by growing cells', () => {
    const q = buildQuilt(3840, 2160, 24, mulberry32(1), 9);
    expect(q.count).toBeLessThanOrEqual(MAX_TRIANGLES);
    expect(q.cols * q.cell).toBeGreaterThanOrEqual(3840);
  });

  test('handles zero-size viewports', () => {
    const q = buildQuilt(0, 0, 64, mulberry32(1), 9);
    expect(q.count).toBeGreaterThan(0);
  });
});

describe('repattern', () => {
  test('keeps pairs complementary', () => {
    const q = buildQuilt(800, 600, 64, mulberry32(3), 9);
    const next = repattern(q.orient, mulberry32(4));
    expect(next.length).toBe(q.orient.length);
    for (let i = 0; i < next.length; i += 2) expect((next[i]! + 2) % 4).toBe(next[i + 1]);
  });
});
```

- [ ] **Step 3: Run it to verify it fails, then implement the pure modules**

Run: `npx vitest run tests/unit/quilt.test.ts`. Expected: FAIL (the module can't be resolved).

`lib/random.ts`:

```ts
/** Small seeded PRNG so patterns are stable between renders. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

`lib/palette.ts`:

```ts
export const QUILT = ['#E8433A', '#F2A93B', '#F4E04D', '#3BB273', '#2A9D8F', '#3A6EA5', '#8E5BA8', '#E86A9E', '#F7F3E8'] as const;
```

`lib/quilt.ts`:

```ts
export const MAX_TRIANGLES = 2000;

export type Quilt = {
  count: number;
  cols: number;
  rows: number;
  cell: number;
  /** Per-triangle cell center in pixels, origin at viewport center (x right, y up). */
  centers: Float32Array;
  /** Per-triangle rotation in quarter turns (0–3); pairs (i, i+1) are complementary. */
  orient: Float32Array;
  colorIndex: Uint8Array;
  seeds: Float32Array;
};

function grid(width: number, height: number, cell: number) {
  return {cols: Math.ceil(Math.max(0, width) / cell) + 1, rows: Math.ceil(Math.max(0, height) / cell) + 1};
}

export function buildQuilt(width: number, height: number, targetCell: number, rand: () => number, paletteSize: number): Quilt {
  let cell = Math.max(8, targetCell);
  let {cols, rows} = grid(width, height, cell);
  while (cols * rows * 2 > MAX_TRIANGLES) {
    cell *= 1.1;
    ({cols, rows} = grid(width, height, cell));
  }

  const count = cols * rows * 2;
  const centers = new Float32Array(count * 2);
  const orient = new Float32Array(count);
  const colorIndex = new Uint8Array(count);
  const seeds = new Float32Array(count);
  const originX = -((cols - 1) * cell) / 2;
  const originY = -((rows - 1) * cell) / 2;

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const base = Math.floor(rand() * 4);
      for (const offset of [0, 2]) {
        centers[i * 2] = originX + c * cell;
        centers[i * 2 + 1] = originY + r * cell;
        orient[i] = (base + offset) % 4;
        colorIndex[i] = Math.floor(rand() * paletteSize);
        seeds[i] = rand();
        i++;
      }
    }
  }
  return {count, cols, rows, cell, centers, orient, colorIndex, seeds};
}

export function repattern(orient: Float32Array, rand: () => number): Float32Array {
  const next = new Float32Array(orient.length);
  for (let i = 0; i < orient.length; i += 2) {
    const base = Math.floor(rand() * 4);
    next[i] = base;
    next[i + 1] = (base + 2) % 4;
  }
  return next;
}
```

Run: `npx vitest run tests/unit/quilt.test.ts`. Expected: PASS.

- [ ] **Step 4: Write the e2e test**

`tests/e2e/three.spec.ts`:

```ts
import {expect, test, type Page} from '@playwright/test';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

async function disableWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.includes('webgl')) return null;
      return Reflect.apply(original, this, [type, ...rest]);
    } as typeof original;
  });
}

test('background canvas renders without errors', async ({page}) => {
  const errors = collectErrors(page);
  await page.goto('/en');
  await expect(page.getByTestId('bg-canvas').locator('canvas')).toBeAttached();
  await page.mouse.move(400, 300);
  await page.locator('#work').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test('without WebGL the static pattern shows and content is readable', async ({page}) => {
  const errors = collectErrors(page);
  await disableWebGL(page);
  await page.goto('/en');
  await expect(page.getByTestId('bg-fallback')).toBeAttached();
  await expect(page.getByTestId('bg-canvas')).toHaveCount(0);
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  expect(errors).toEqual([]);
});

test('reduced motion renders a still frame without errors', async ({page}) => {
  const errors = collectErrors(page);
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/en');
  await expect(page.getByTestId('bg-canvas').locator('canvas')).toBeAttached();
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(page.locator('#about [data-reveal]')).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test.describe('phone width', () => {
  test.use({viewport: {width: 375, height: 812}});
  test('canvases cause no horizontal scroll', async ({page}) => {
    await page.goto('/en');
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
```

- [ ] **Step 5: Implement the client pieces**

`lib/webgl.ts`:

```ts
let cached: boolean | undefined;

export function hasWebGL(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement('canvas');
    cached = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    cached = false;
  }
  return cached;
}
```

`hooks/useReducedMotion.ts`:

```ts
'use client';

import {useSyncExternalStore} from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** True when the user asked for reduced motion. Defaults to true on the server (safe default). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => true);
}
```

`components/three/WebGLGate.tsx`:

```tsx
'use client';

import {useSyncExternalStore, type ReactNode} from 'react';
import {hasWebGL} from '@/lib/webgl';

const subscribe = () => () => {};

type Props = {children: ReactNode; fallback: ReactNode; pending?: ReactNode};

/** Renders `pending` on the server/hydration, then `children` if WebGL works, else `fallback`. */
export function WebGLGate({children, fallback, pending = null}: Props) {
  const supported = useSyncExternalStore<boolean | null>(subscribe, hasWebGL, () => null);
  if (supported === null) return pending;
  return supported ? children : fallback;
}
```

`components/three/TriangleField.tsx`:

```tsx
'use client';

import {useEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {QUILT} from '@/lib/palette';
import {buildQuilt, repattern} from '@/lib/quilt';
import {mulberry32} from '@/lib/random';
import {subscribeActiveSection} from '@/lib/section-store';

const TARGET_CELL = 64;
const TRANSITION_SECONDS = 0.8;

const vertexShader = /* glsl */ `
  attribute vec2 aCenter;
  attribute vec3 aColor;
  attribute float aOrient;
  attribute float aOrientNext;
  attribute float aSeed;
  uniform float uTime;
  uniform float uMix;
  uniform float uCell;
  uniform float uRadius;
  uniform vec2 uPointer;
  varying vec3 vColor;
  const float HALF_PI = 1.5707963;
  const float PI = 3.1415926;

  void main() {
    float local = clamp(uMix * 1.6 - aSeed * 0.6, 0.0, 1.0);
    float eased = local * local * (3.0 - 2.0 * local);
    float delta = mod(aOrientNext - aOrient + 4.0, 4.0);
    if (delta > 2.0) delta -= 4.0;
    float angle = (aOrient + delta * eased) * HALF_PI;
    float c = cos(angle);
    float s = sin(angle);
    vec2 p = mat2(c, s, -s, c) * position.xy;

    float dist = distance(aCenter, uPointer);
    float ripple = 1.0 - smoothstep(0.0, uRadius, dist);
    float wave = 0.5 + 0.5 * sin(uTime * 3.0 - dist * 0.04 + aSeed * 6.2831);
    p.x *= cos(ripple * wave * PI);

    vColor = mix(aColor, vec3(1.0), ripple * 0.35);
    vec2 world = aCenter + p * uCell;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

export function TriangleField({reducedMotion}: {reducedMotion: boolean}) {
  const size = useThree((s) => s.size);
  const rand = useMemo(() => mulberry32(11), []);
  const transitioning = useRef(false);

  const quilt = useMemo(() => buildQuilt(size.width, size.height, TARGET_CELL, mulberry32(7), QUILT.length), [size.width, size.height]);

  const geometry = useMemo(() => {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0]), 3));
    const colors = new Float32Array(quilt.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < quilt.count; i++) {
      color.set(QUILT[quilt.colorIndex[i] ?? 0] ?? QUILT[0]);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    g.setAttribute('aCenter', new THREE.InstancedBufferAttribute(quilt.centers, 2));
    g.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
    g.setAttribute('aOrient', new THREE.InstancedBufferAttribute(quilt.orient.slice(), 1));
    g.setAttribute('aOrientNext', new THREE.InstancedBufferAttribute(quilt.orient.slice(), 1));
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(quilt.seeds, 1));
    g.instanceCount = quilt.count;
    return g;
  }, [quilt]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        depthWrite: false,
        uniforms: {
          uTime: {value: 0},
          uMix: {value: 1},
          uCell: {value: TARGET_CELL},
          uRadius: {value: 200},
          uPointer: {value: new THREE.Vector2(1e5, 1e5)},
        },
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    material.uniforms.uCell!.value = quilt.cell;
    material.uniforms.uRadius!.value = 0.15 * Math.max(size.width, size.height);
  }, [material, quilt, size.width, size.height]);

  useEffect(() => {
    if (reducedMotion) return;
    const pointer = material.uniforms.uPointer!.value as THREE.Vector2;
    const onMove = (e: PointerEvent) => pointer.set(e.clientX - size.width / 2, size.height / 2 - e.clientY);
    const onLeave = () => pointer.set(1e5, 1e5);
    window.addEventListener('pointermove', onMove, {passive: true});
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [material, size.width, size.height, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    return subscribeActiveSection(() => {
      const current = geometry.getAttribute('aOrient') as THREE.InstancedBufferAttribute;
      const next = geometry.getAttribute('aOrientNext') as THREE.InstancedBufferAttribute;
      const currentArray = current.array as Float32Array;
      currentArray.set(next.array as Float32Array);
      (next.array as Float32Array).set(repattern(currentArray, rand));
      current.needsUpdate = true;
      next.needsUpdate = true;
      material.uniforms.uMix!.value = 0;
      transitioning.current = true;
    });
  }, [geometry, material, rand, reducedMotion]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    material.uniforms.uTime!.value += delta;
    if (transitioning.current) {
      const mix = Math.min(1, material.uniforms.uMix!.value + delta / TRANSITION_SECONDS);
      material.uniforms.uMix!.value = mix;
      if (mix >= 1) transitioning.current = false;
    }
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}
```

Note: the global constraints ban force-unwraps only in the iOS project. Here, `uniforms.x!` is safe because the uniforms are declared in the same file. If ESLint's `no-non-null-assertion` rule is enabled, switch to a typed `uniforms` const object and read from it instead.

`components/three/BackgroundCanvas.tsx`:

```tsx
'use client';

import {Canvas} from '@react-three/fiber';
import {TriangleField} from './TriangleField';

export default function BackgroundCanvas({reducedMotion}: {reducedMotion: boolean}) {
  return (
    <div aria-hidden="true" data-testid="bg-canvas" className="pointer-events-none fixed inset-0 -z-10 opacity-55">
      <Canvas
        orthographic
        camera={{position: [0, 0, 10], zoom: 1, near: 0.1, far: 100}}
        dpr={[1, 1.5]}
        gl={{antialias: false, alpha: true, powerPreference: 'low-power'}}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <TriangleField reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
```

`components/three/Background.tsx`:

```tsx
'use client';

import dynamic from 'next/dynamic';
import {useReducedMotion} from '@/hooks/useReducedMotion';
import {WebGLGate} from './WebGLGate';

const BackgroundCanvas = dynamic(() => import('./BackgroundCanvas'), {ssr: false});

export function Background() {
  const reducedMotion = useReducedMotion();
  return (
    <WebGLGate fallback={<div data-testid="bg-fallback" aria-hidden="true" className="triangle-fallback pointer-events-none fixed inset-0 -z-10" />}>
      <BackgroundCanvas reducedMotion={reducedMotion} />
    </WebGLGate>
  );
}
```

In `app/[locale]/layout.tsx`, import `Background` and render `<Background />` as the first child of `<body>` (outside `NextIntlClientProvider` is fine, since it uses no translations).

- [ ] **Step 6: Run all gates and check it by eye**

Run: `npm run lint && npm run typecheck && npm test && npm run e2e`
Expected: all pass.

Then run `npm run dev` and open `http://localhost:3000/en`. Check:
- The triangles fill the screen with no gaps.
- Moving the mouse makes nearby triangles flip and lighten.
- Scrolling into each section re-patterns the triangles over about 0.8s.
- With macOS "Reduce motion" turned on, everything is still.

Use DevTools → Performance to check that the frame time stays under 4ms of scripting and GPU. If the hero text is hard to read, lower `opacity-55`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add animated triangle-quilt background with fallbacks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: PS1-style 3D mascot

**Files:**
- Create: `lib/mascot-motion.ts`, `components/three/ps1.ts`, `components/three/buildMascot.ts`, `components/three/Mascot.tsx`, `components/three/MascotCanvas.tsx`, `components/three/HeroMascot.tsx`, `scripts/capture-mascot.mjs`, `public/mascot-fallback.png` (generated)
- Modify: `components/sections/Hero.tsx` (render `<HeroMascot>` inside the `data-slot="mascot"` div)
- Test: `tests/unit/mascot-motion.test.ts`, `tests/unit/mascot.test.ts`, extend `tests/e2e/three.spec.ts`

**Interfaces:**
- Consumes: `WebGLGate`, `useReducedMotion`, `mulberry32`.
- Produces: `breathScale(t)`, `nextBlinkDelay(rand)`, `BLINK_DURATION`, `blinkScale(sinceStart)`, `lookTarget(x, y): {yaw, pitch}`, `LOOK_LIMITS`, `damp(current, target, lambda, dt)`; `withVertexSnap<T extends THREE.Material>(m: T, snap?): T`, `SNAP_LINE`; `buildMascot(): THREE.Group` (named parts `mascot`, `head`, `torso`, `eyeL`, `eyeR`); `countTriangles(obj, opts?): number`; `<HeroMascot alt>`; test ids `mascot-canvas`, `hero-fallback`. The component contract is `{reducedMotion: boolean}`, so a future `.glb` mascot can replace `Mascot` without other changes.

- [ ] **Step 1: Write the failing unit tests**

`tests/unit/mascot-motion.test.ts`:

```ts
import {describe, expect, test} from 'vitest';
import {BLINK_DURATION, blinkScale, breathScale, damp, LOOK_LIMITS, lookTarget, nextBlinkDelay} from '@/lib/mascot-motion';

describe('mascot motion', () => {
  test('breathing stays within ±2%', () => {
    for (let t = 0; t < 10; t += 0.1) {
      expect(breathScale(t)).toBeGreaterThanOrEqual(0.98);
      expect(breathScale(t)).toBeLessThanOrEqual(1.02);
    }
  });

  test('blink delay is 2.5–6s', () => {
    expect(nextBlinkDelay(() => 0)).toBe(2.5);
    expect(nextBlinkDelay(() => 0.999999)).toBeCloseTo(6, 3);
  });

  test('eyes close only during the blink', () => {
    expect(blinkScale(-1)).toBe(1);
    expect(blinkScale(0.05)).toBe(0.1);
    expect(blinkScale(BLINK_DURATION + 0.01)).toBe(1);
  });

  test('look target is clamped and signed correctly', () => {
    expect(lookTarget(5, 0).yaw).toBeCloseTo(LOOK_LIMITS.yaw);
    expect(lookTarget(-5, 0).yaw).toBeCloseTo(-LOOK_LIMITS.yaw);
    expect(lookTarget(0, 1).pitch).toBeCloseTo(-LOOK_LIMITS.pitch);
    expect(lookTarget(0, -1).pitch).toBeCloseTo(LOOK_LIMITS.pitch);
  });

  test('damp moves toward target without overshoot', () => {
    const v = damp(0, 1, 6, 1 / 60);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
    expect(damp(0, 1, 6, 10)).toBeCloseTo(1, 5);
  });
});
```

`tests/unit/mascot.test.ts`:

```ts
import * as THREE from 'three';
import {describe, expect, test} from 'vitest';
import {buildMascot, countTriangles} from '@/components/three/buildMascot';
import {SNAP_LINE, withVertexSnap} from '@/components/three/ps1';

describe('buildMascot', () => {
  const mascot = buildMascot();

  test('has 300–600 non-outline triangles', () => {
    const tris = countTriangles(mascot);
    expect(tris).toBeGreaterThanOrEqual(300);
    expect(tris).toBeLessThanOrEqual(600);
  });

  test('exposes animated parts by name', () => {
    for (const name of ['head', 'torso', 'eyeL', 'eyeR']) expect(mascot.getObjectByName(name), name).toBeDefined();
  });

  test('every visible part has an ink outline except small face details', () => {
    const outlined = ['skull', 'torso', 'armL', 'armR', 'legL', 'legR'];
    for (const name of outlined) {
      const part = mascot.getObjectByName(name);
      expect(part?.children.some((c) => c.userData.outline === true), name).toBe(true);
    }
  });
});

describe('withVertexSnap', () => {
  test('injects the snap uniform and line after projection', () => {
    const material = withVertexSnap(new THREE.MeshBasicMaterial());
    const shader = {uniforms: {} as Record<string, THREE.IUniform>, vertexShader: 'void main() {\n#include <project_vertex>\n}', fragmentShader: ''};
    material.onBeforeCompile(shader as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer);
    expect(shader.uniforms.uSnap).toBeDefined();
    expect(shader.vertexShader.startsWith('uniform vec2 uSnap;')).toBe(true);
    expect(shader.vertexShader.indexOf(SNAP_LINE)).toBeGreaterThan(shader.vertexShader.indexOf('#include <project_vertex>'));
  });
});
```

Run: `npm test`. Expected: FAIL (the modules can't be resolved).

- [ ] **Step 2: Implement motion and the PS1 helpers**

`lib/mascot-motion.ts`:

```ts
export const LOOK_LIMITS = {yaw: Math.PI / 6, pitch: Math.PI / 12} as const;
export const BLINK_DURATION = 0.12;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Torso Y scale for idle breathing: ±2% over a 3.5s period. */
export function breathScale(t: number): number {
  return 1 + 0.02 * Math.sin((t / 3.5) * Math.PI * 2);
}

/** Seconds until the next blink: 2.5–6s. */
export function nextBlinkDelay(rand: () => number): number {
  return 2.5 + rand() * 3.5;
}

export function blinkScale(sinceStart: number): number {
  return sinceStart >= 0 && sinceStart < BLINK_DURATION ? 0.1 : 1;
}

/** x, y in [-1, 1] with +x right and +y up → head rotation (radians). */
export function lookTarget(x: number, y: number): {yaw: number; pitch: number} {
  return {yaw: clamp(x, -1, 1) * LOOK_LIMITS.yaw, pitch: -clamp(y, -1, 1) * LOOK_LIMITS.pitch};
}

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt);
}
```

`components/three/ps1.ts`:

```ts
import * as THREE from 'three';

export const SNAP_LINE = 'gl_Position.xy = floor(gl_Position.xy / gl_Position.w * uSnap) / uSnap * gl_Position.w;';

/** PS1-style vertex wobble: snaps projected vertices to a coarse screen grid. */
export function withVertexSnap<T extends THREE.Material>(material: T, snap: THREE.Vector2 = new THREE.Vector2(160, 120)): T {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSnap = {value: snap};
    shader.vertexShader = `uniform vec2 uSnap;\n${shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>\n${SNAP_LINE}`,
    )}`;
  };
  material.customProgramCacheKey = () => 'ps1-snap';
  return material;
}
```

- [ ] **Step 3: Build the mascot**

`components/three/buildMascot.ts`:

```ts
import * as THREE from 'three';
import {withVertexSnap} from './ps1';

export const MASCOT_COLORS = {
  skin: '#B8743F',
  hair: '#1A1A1A',
  hoodie: '#1E4E7A',
  collar: '#6B7A8C',
  denim: '#2A2D33',
  patch: '#D9D4C7',
  shoe: '#F7F3E8',
  sole: '#1E4E7A',
  eyeWhite: '#F7F3E8',
  pupil: '#2F3B2F',
  ink: '#111111',
} as const;

const OUTLINE_MATERIAL = withVertexSnap(new THREE.MeshBasicMaterial({color: MASCOT_COLORS.ink, side: THREE.BackSide}));
const materials = new Map<string, THREE.Material>();

function material(color: string): THREE.Material {
  let m = materials.get(color);
  if (!m) {
    m = withVertexSnap(new THREE.MeshLambertMaterial({color, flatShading: true}));
    materials.set(color, m);
  }
  return m;
}

function part(name: string, geometry: THREE.BufferGeometry, color: string, outline = true): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material(color));
  mesh.name = name;
  if (outline) {
    const shell = new THREE.Mesh(geometry, OUTLINE_MATERIAL);
    shell.name = `${name}-outline`;
    shell.scale.setScalar(1.08);
    shell.userData.outline = true;
    mesh.add(shell);
  }
  return mesh;
}

function starGeometry(outer: number, inner: number): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

const HAIR_BLOBS: Array<[x: number, y: number, z: number, r: number]> = [
  [0, 0.45, -0.05, 0.55],
  [-0.45, 0.3, -0.05, 0.42],
  [0.45, 0.3, -0.05, 0.42],
  [-0.3, 0.6, -0.2, 0.4],
  [0.3, 0.6, -0.2, 0.4],
  [0, 0.35, -0.4, 0.5],
  [0, 0.75, -0.1, 0.4],
];

/** Original low-poly mascot: big bubbly hair, hoodie, star-patch denim, arms crossed. */
export function buildMascot(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'mascot';

  for (const side of [-1, 1] as const) {
    const suffix = side < 0 ? 'L' : 'R';
    const leg = part(`leg${suffix}`, new THREE.CylinderGeometry(0.24, 0.3, 0.9, 6), MASCOT_COLORS.denim);
    leg.position.set(0.26 * side, 0.6, 0);
    const star = part(`star${suffix}`, starGeometry(0.12, 0.05), MASCOT_COLORS.patch, false);
    star.position.set(0, 0.05, 0.29);
    leg.add(star);
    root.add(leg);

    const shoe = part(`shoe${suffix}`, new THREE.BoxGeometry(0.34, 0.18, 0.55), MASCOT_COLORS.shoe);
    shoe.position.set(0.26 * side, 0.12, 0.08);
    root.add(shoe);
    const sole = part(`sole${suffix}`, new THREE.BoxGeometry(0.36, 0.06, 0.57), MASCOT_COLORS.sole, false);
    sole.position.set(0.26 * side, 0.03, 0.08);
    root.add(sole);

    const arm = part(`arm${suffix}`, new THREE.BoxGeometry(0.95, 0.24, 0.26), MASCOT_COLORS.hoodie);
    arm.position.set(0, 1.55 + side * 0.06, 0.6);
    arm.rotation.z = side * 0.18;
    root.add(arm);
    const hand = part(`hand${suffix}`, new THREE.BoxGeometry(0.2, 0.2, 0.2), MASCOT_COLORS.skin);
    hand.position.set(0.5 * side, 1.6, 0.62);
    root.add(hand);
  }

  const torso = part('torso', new THREE.CylinderGeometry(0.5, 0.62, 1.0, 8), MASCOT_COLORS.hoodie);
  torso.position.y = 1.5;
  root.add(torso);

  const collar = part('collar', new THREE.TorusGeometry(0.36, 0.11, 3, 8), MASCOT_COLORS.collar);
  collar.position.y = 2.0;
  collar.rotation.x = Math.PI / 2;
  root.add(collar);

  const head = new THREE.Group();
  head.name = 'head';
  head.position.y = 2.55;
  root.add(head);

  const skull = part('skull', new THREE.IcosahedronGeometry(0.55, 1), MASCOT_COLORS.skin);
  skull.scale.set(1, 1.05, 0.95);
  head.add(skull);

  for (const side of [-1, 1] as const) {
    const suffix = side < 0 ? 'L' : 'R';
    const ear = part(`ear${suffix}`, new THREE.IcosahedronGeometry(0.12, 0), MASCOT_COLORS.skin);
    ear.position.set(0.55 * side, 0, 0);
    head.add(ear);

    const eye = new THREE.Group();
    eye.name = `eye${suffix}`;
    eye.position.set(0.2 * side, 0.05, 0.5);
    const white = part(`eyeWhite${suffix}`, new THREE.BoxGeometry(0.2, 0.12, 0.04), MASCOT_COLORS.eyeWhite, false);
    const pupil = part(`pupil${suffix}`, new THREE.BoxGeometry(0.08, 0.08, 0.02), MASCOT_COLORS.pupil, false);
    pupil.position.z = 0.03;
    eye.add(white, pupil);
    head.add(eye);

    const brow = part(`brow${suffix}`, new THREE.BoxGeometry(0.24, 0.05, 0.04), MASCOT_COLORS.ink, false);
    brow.position.set(0.2 * side, 0.2, 0.52);
    brow.rotation.z = side * 0.3;
    head.add(brow);
  }

  const mouth = part('mouth', new THREE.BoxGeometry(0.14, 0.035, 0.03), MASCOT_COLORS.ink, false);
  mouth.position.set(0, -0.25, 0.52);
  head.add(mouth);

  HAIR_BLOBS.forEach(([x, y, z, r], i) => {
    const blob = part(`hair${i}`, new THREE.IcosahedronGeometry(r, 0), MASCOT_COLORS.hair);
    blob.position.set(x, y, z);
    head.add(blob);
  });

  return root;
}

export function countTriangles(object: THREE.Object3D, {includeOutlines = false} = {}): number {
  let total = 0;
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (!includeOutlines && child.userData.outline === true) return;
    const g = child.geometry as THREE.BufferGeometry;
    total += (g.index ? g.index.count : g.getAttribute('position').count) / 3;
  });
  return total;
}
```

The brows tilt inward and down (`rotation.z = side * 0.3`), which gives a determined look. Keep `head` as a `Group` so its rotation drives the whole face.

Run: `npm test`
Expected: PASS. If the triangle count falls outside 300–600, adjust the number of `HAIR_BLOBS` (20 tris each). Don't change the test.

- [ ] **Step 4: Write the R3F components**

`components/three/Mascot.tsx`:

```tsx
'use client';

import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {BLINK_DURATION, blinkScale, breathScale, damp, lookTarget, nextBlinkDelay} from '@/lib/mascot-motion';
import {mulberry32} from '@/lib/random';
import {buildMascot} from './buildMascot';

type Pointer = {x: number; y: number; active: boolean};

export function Mascot({reducedMotion}: {reducedMotion: boolean}) {
  const mascot = useMemo(() => buildMascot(), []);
  const parts = useMemo(
    () => ({
      head: mascot.getObjectByName('head'),
      torso: mascot.getObjectByName('torso'),
      eyeL: mascot.getObjectByName('eyeL'),
      eyeR: mascot.getObjectByName('eyeR'),
    }),
    [mascot],
  );
  const rand = useMemo(() => mulberry32(42), []);
  const pointer = useRef<Pointer>({x: 0, y: 0, active: false});
  const blink = useRef({next: 3, start: -1});

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current = {x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1), active: true};
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      pointer.current = {x: e.gamma / 30, y: (45 - e.beta) / 30, active: true};
    };
    window.addEventListener('pointermove', onMove, {passive: true});
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [reducedMotion]);

  useEffect(
    () => () => {
      mascot.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
    },
    [mascot],
  );

  useFrame(({clock}, delta) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    parts.torso?.scale.setY(breathScale(t));

    const target = pointer.current.active ? lookTarget(pointer.current.x, pointer.current.y) : lookTarget(Math.sin(t * 0.5) * 0.4, 0);
    if (parts.head) {
      parts.head.rotation.y = damp(parts.head.rotation.y, target.yaw, 6, delta);
      parts.head.rotation.x = damp(parts.head.rotation.x, target.pitch, 6, delta);
    }

    const b = blink.current;
    if (t >= b.next) {
      b.start = t;
      b.next = t + BLINK_DURATION + nextBlinkDelay(rand);
    }
    const eyeScale = blinkScale(t - b.start);
    parts.eyeL?.scale.setY(eyeScale);
    parts.eyeR?.scale.setY(eyeScale);
  });

  return <primitive object={mascot} />;
}
```

`components/three/MascotCanvas.tsx`:

```tsx
'use client';

import {useEffect, useRef, useState} from 'react';
import {Canvas, useThree} from '@react-three/fiber';
import {Mascot} from './Mascot';

const INTERNAL_HEIGHT = 240;

/** Renders at ~240px tall and lets CSS upscale with pixelated sampling (PS1 look). */
function LowResolution() {
  const height = useThree((s) => s.size.height);
  const setDpr = useThree((s) => s.setDpr);
  useEffect(() => {
    if (height > 0) setDpr(INTERNAL_HEIGHT / height);
  }, [height, setDpr]);
  return null;
}

export default function MascotCanvas({reducedMotion}: {reducedMotion: boolean}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" data-testid="mascot-canvas" className="pixelated h-full w-full">
      <Canvas
        flat
        gl={{antialias: false, alpha: true}}
        camera={{position: [0, 1.7, 5.2], fov: 35}}
        frameloop={inView && !reducedMotion ? 'always' : 'demand'}
        onCreated={({camera}) => camera.lookAt(0, 1.6, 0)}
      >
        <LowResolution />
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <Mascot reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
```

`components/three/HeroMascot.tsx`:

```tsx
'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import {useReducedMotion} from '@/hooks/useReducedMotion';
import {WebGLGate} from './WebGLGate';

function MascotImage({alt}: {alt: string}) {
  return (
    <Image
      src="/mascot-fallback.png"
      alt={alt}
      width={480}
      height={640}
      data-testid="hero-fallback"
      className="pixelated h-full w-full object-contain"
    />
  );
}

const MascotCanvas = dynamic(() => import('./MascotCanvas'), {ssr: false, loading: () => <MascotImage alt="" />});

export function HeroMascot({alt}: {alt: string}) {
  const reducedMotion = useReducedMotion();
  const image = <MascotImage alt={alt} />;
  return (
    <WebGLGate fallback={image} pending={image}>
      <MascotCanvas reducedMotion={reducedMotion} />
    </WebGLGate>
  );
}
```

In `components/sections/Hero.tsx`, import `HeroMascot` and replace the empty slot:

```tsx
<div data-slot="mascot" className="relative h-[45svh] md:h-[70svh]">
  <HeroMascot alt={t('mascotAlt')} />
</div>
```

- [ ] **Step 5: Tune by eye, then generate the fallback PNG**

Run `npm run dev` and open `/en`. Check:
- The mascot is centered in the slot, about 85% of its height.
- Its pixels are visibly chunky.
- The vertices wobble slightly when the head turns.
- It blinks and breathes.
- The head follows the mouse.
- The outlines are solid black.

Adjust only the camera position, light intensities, and part positions in `buildMascot.ts` until it reads clearly at phone size (DevTools, iPhone SE). Re-run `npm test` after any geometry change.

`scripts/capture-mascot.mjs`:

```js
import {chromium} from '@playwright/test';

const url = process.argv[2] ?? 'http://localhost:3100/en';
const browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport: {width: 1280, height: 900}, deviceScaleFactor: 1, reducedMotion: 'reduce'});
await page.goto(url);
await page.addStyleTag({content: '[data-testid=bg-canvas]{display:none!important} html,body{background:transparent!important}'});
const target = page.getByTestId('mascot-canvas');
await target.locator('canvas').waitFor();
await page.waitForTimeout(1500);
await target.screenshot({path: 'public/mascot-fallback.png', omitBackground: true});
await browser.close();
console.log('wrote public/mascot-fallback.png');
```

```bash
npm run build && (npm run start -- -p 3100 &) && sleep 5
node scripts/capture-mascot.mjs
pkill -f "next start -p 3100"
```

Open `public/mascot-fallback.png`. The mascot should be on a transparent background with no triangles behind it. If the mascot is cropped, fix `MascotCanvas` framing and capture again.

- [ ] **Step 6: Extend the e2e tests**

In `tests/e2e/three.spec.ts`:
- In `background canvas renders without errors`, add: `await expect(page.getByTestId('mascot-canvas').locator('canvas')).toBeAttached();`
- In `without WebGL ...`, add:

```ts
const fallback = page.getByTestId('hero-fallback');
await expect(fallback).toBeVisible();
await expect(fallback).toHaveAttribute('alt', /mascot/i);
expect(await fallback.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
```

- In `reduced motion ...`, add: `await expect(page.getByTestId('mascot-canvas').locator('canvas')).toBeAttached();`

- [ ] **Step 7: Run all gates**

Run: `npm run lint && npm run typecheck && npm test && npm run e2e`
Expected: all pass, including the 375px no-horizontal-scroll tests from Tasks 3 and 7.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add PS1-style low-poly mascot with static fallback

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Performance check, GitHub, Vercel

**Files:**
- Possibly modify: any file Lighthouse flags
- Create: `scripts/lighthouse.mjs`

**Interfaces:**
- Consumes: the whole app.
- Produces: the public GitHub repo `john-casildo/portfolio` and a Vercel production URL.

- [ ] **Step 1: Lighthouse script**

`scripts/lighthouse.mjs`:

```js
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:3100';
let failed = false;
for (const path of ['/en', '/es']) {
  const out = `/tmp/lh-${path.slice(1)}.json`;
  execFileSync('npx', ['--yes', 'lighthouse', `${base}${path}`, '--quiet', '--chrome-flags=--headless=new',
    '--only-categories=performance,accessibility,best-practices,seo', '--output=json', `--output-path=${out}`], {stdio: 'inherit'});
  const {categories} = JSON.parse(readFileSync(out, 'utf8'));
  for (const [key, {score}] of Object.entries(categories)) {
    const pct = Math.round(score * 100);
    console.log(`${path} ${key}: ${pct}`);
    if (pct < 90) failed = true;
  }
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run against a production build**

```bash
npm run build && (npm run start -- -p 3100 &) && sleep 5
node scripts/lighthouse.mjs
pkill -f "next start -p 3100"
```

Expected: every category ≥ 90 on both locales (Lighthouse emulates mobile by default). Common fixes:
- **Low performance score:** confirm both canvases are `dynamic(..., {ssr:false})` and that the LCP element is the h1.
- **Contrast failures:** never put `text-spray` on `paper`.
- **"Tap targets":** ensure `min-h-12` on links.

Re-run until it passes.

- [ ] **Step 3: Create the GitHub repo and push**

Confirm with John before this step, because it publishes the code publicly.

```bash
gh repo create john-casildo/portfolio --public --source . --remote origin --push
```

Expected: `https://github.com/john-casildo/portfolio` shows the commits.

- [ ] **Step 4: Link to Vercel (needs John's login)**

Ask John to run `! npx vercel login` in the prompt. Then:

```bash
npx vercel link --yes --project portfolio
npx vercel git connect https://github.com/john-casildo/portfolio
npx vercel --prod
```

Expected: a production URL like `https://portfolio-<hash>.vercel.app`. Pushes to `main` now auto-deploy, and pull requests get previews.

- [ ] **Step 5: Set environment variables (when John has Resend)**

```bash
npx vercel env add RESEND_API_KEY production preview
npx vercel env add CONTACT_TO_EMAIL production preview
npx vercel env add CONTACT_FROM_EMAIL production preview
npx vercel --prod
```

Until these are set, the form returns `send_failed` and shows the direct links. That's acceptable for launch.

- [ ] **Step 6: Smoke-test production**

```bash
URL=<production url>
curl -sI "$URL/" | grep -i '^location'        # → /en (or /es)
curl -s -o /dev/null -w '%{http_code}\n' "$URL/en/projects/nope"   # → 404
curl -s "$URL/sitemap.xml" | grep -c '<loc>'   # → 8
node scripts/lighthouse.mjs "$URL"
```

Expected: the results noted in each comment, and Lighthouse ≥ 90.

- [ ] **Step 7: Commit and push**

```bash
git add -A
git commit -m "chore: add Lighthouse check script

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push origin main
```

Expected: Vercel auto-deploys the push.

---

## Spec coverage check

| Spec section | Task |
|---|---|
| §1 success criteria (10-second clarity, Lighthouse ≥ 90, three contact paths) | 3, 6, 9 |
| §2 palette, fonts, original mascot | 1, 8 |
| §3 routes, redirect, cookie, 404, 5 sections, header/footer, case study, initial projects | 1, 3, 4, 6, 2 |
| §4 mascot animations, PS1 look, triangle field, perf/fallbacks, UI motion | 7, 8, 3 (reveal), 1 (press) |
| §5 next-intl, MDX per locale, build fails on a missing locale, hreflang/metadata, key-parity test | 1, 2, 4 |
| §6 form, API order, rate limit, Resend, responses, client states, direct links, config fallback | 5, 6 |
| §7 stack and structure | all (drei omitted as unused) |
| §8 repo and Vercel | 9 |
| §9 unit and e2e tests, gates, Lighthouse, accessibility | every task, 9 |
| §10 placeholders | 1 (`site.ts`), 6 (WhatsApp hidden), 5 (Resend unset) |
