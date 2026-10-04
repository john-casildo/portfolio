# Zine Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the portfolio as a chaotic red/black street zine and replace the PS1 mascot and triangle quilt with a cel-shaded 3D fan-art hero hanging upside down from a web.

**Architecture:** Visual tokens and fonts change in `globals.css` and `fonts.ts`. A new `components/zine/` folder holds the decorative pieces: doodles, stickers, tape, ticker, stamp, and torn edges. The quilt and PS1 code is deleted. The new character lives in `components/hero3d/`: a pure model builder, a custom toon/halftone shader, and pure motion functions. It is mounted through the existing `WebGLGate` and first-interaction deferral, with a captured PNG as the fallback.

**Tech Stack:** unchanged (Next.js 15, next-intl, three + R3F, Vitest, Playwright).

**Spec:** `docs/specs/2026-10-04-zine-redesign-design.md` (this supersedes sections 2 and 4 of the original spec).

## Global Constraints

- Colors only: `paper #F2EFE8`, `ink #0B0B0B`, `red #E10600`, `blood #8F0000` (plus white for the web line and eyes).
- `red` text only at ≥ 24px (or bold ≥ 18.7px). Text on red is `paper`.
- Fonts: Knewave (display), Permanent Marker (annotations, utility `font-tag`), Space Grotesk (body).
- No "Spider-Man", "Miles", "Morales", "Marvel", or "Sony" anywhere except the footer's `Footer.fanArt` line.
- Decorative elements are `aria-hidden` and `pointer-events-none`.
- No element may extend past the viewport at 375px unless it sits inside a clipping ancestor.
- Hero character triangle budget is 1,500–4,000 (excluding outlines).
- Reduced motion means no ticker animation, no tilt transitions, and a still character.
- Gates for every task: `npm run lint` (0 warnings), `npm run typecheck`, `npm test`.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Doodles and the ticker at 375px:** absolutely positioned decor or the `w-max` ticker track must not create horizontal scroll or cover text or controls. *(Task 1 test: element-bounds check.)*
2. **Red text contrast:** small red text on paper fails WCAG. Lighthouse accessibility must stay at 100. *(Task 4.)*
3. **Upside-down head tracking sign:** the cursor to the right must turn the face visibly right on screen. *(Task 3 unit test plus a visual check.)*
4. **WebGL failure after the drop-in starts:** the error boundary must still show the fallback PNG. *(The existing e2e in `three.spec.ts` is kept.)*
5. **Excluded names leaking** into the title, metadata, alt text, or headings. *(Task 1 test.)*

---

### Task 1: Remove the quilt; new tokens, fonts, grain, ticker, footer line

**Files:**
- Delete: `components/three/{Background,BackgroundCanvas,TriangleField}.tsx`, `lib/{quilt,palette,random}.ts`, `tests/unit/quilt.test.ts`
- Modify: `app/fonts.ts`, `app/globals.css`, `app/[locale]/layout.tsx` (remove `<Background/>`, add `<Ticker/>` under the header and above the footer), `components/ui/button.ts`, `components/ui/Footer.tsx`, `messages/{en,es}.json`, `tests/e2e/three.spec.ts`, `tests/e2e/polish.spec.ts` (remove the bg-canvas dependence)
- Create: `components/zine/Ticker.tsx`, `tests/e2e/zine.spec.ts`

**Interfaces:**
- Produces:
  - CSS utilities: `bg-paper text-ink bg-red text-red bg-blood font-display font-tag font-sans`, `.ink-shadow`, `.red-shadow`, `.sticker`, `.tilt-l`, `.tilt-r`, `.halftone`, `.notebook`, `.ticker`, `.ticker-track`
  - Message keys `Ticker.text` and `Footer.fanArt`
  - `<Ticker/>` (async server component, `data-testid="ticker"`)
  - `buttonClass(variant?: 'primary' | 'secondary')` with the same signature

- [ ] **Step 1: Write the failing e2e**

`tests/e2e/zine.spec.ts`:

```ts
import {expect, test} from '@playwright/test';

const EXCLUDED = /spider|miles|morales|marvel|sony/i;

for (const [locale, line] of [
  ['en', 'Fan art. Not affiliated with Marvel or Sony.'],
  ['es', 'Fan art. Sin afiliación con Marvel o Sony.'],
] as const) {
  test(`${locale}: fan-art line in footer, names nowhere else`, async ({page}) => {
    await page.goto(`/${locale}`);
    await expect(page.locator('footer')).toContainText(line);
    const head = await page.evaluate(() => document.head.innerHTML);
    expect(head).not.toMatch(EXCLUDED);
    const outsideFooter = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.querySelector('footer')?.remove();
      const alts = Array.from(clone.querySelectorAll('[alt],[aria-label]')).map((el) => `${el.getAttribute('alt') ?? ''} ${el.getAttribute('aria-label') ?? ''}`);
      return `${clone.innerText} ${alts.join(' ')}`;
    });
    expect(outsideFooter).not.toMatch(EXCLUDED);
  });
}

test('ticker is decorative and stops under reduced motion', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/en');
  const ticker = page.getByTestId('ticker').first();
  await expect(ticker).toHaveAttribute('aria-hidden', 'true');
  const animation = await ticker.locator('.ticker-track').evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe('none');
});

test.describe('phone width', () => {
  test.use({viewport: {width: 375, height: 812}});
  for (const path of ['/en', '/es', '/en/projects/presencia']) {
    test(`${path}: nothing sticks out past the viewport`, async ({page}) => {
      await page.goto(path);
      await page.waitForTimeout(300);
      const offenders = await page.evaluate(() => {
        const vw = window.innerWidth;
        const clipped = (el: Element) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const s = getComputedStyle(p);
            if (['hidden', 'clip'].includes(s.overflowX)) {
              const r = p.getBoundingClientRect();
              if (r.left >= -1 && r.right <= vw + 1) return true;
            }
          }
          return false;
        };
        return Array.from(document.body.querySelectorAll('*'))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !clipped(el);
          })
          .slice(0, 5)
          .map((el) => `${el.tagName}.${(el.getAttribute('class') ?? '').slice(0, 60)}`);
      });
      expect(offenders).toEqual([]);
    });
  }
});
```

- [ ] **Step 2: Implement the foundation**

`app/fonts.ts`:

```ts
import {Knewave, Permanent_Marker, Space_Grotesk} from 'next/font/google';

export const displayFont = Knewave({weight: '400', subsets: ['latin'], variable: '--font-knewave', display: 'swap'});
export const markerFont = Permanent_Marker({weight: '400', subsets: ['latin'], variable: '--font-marker', display: 'swap'});
export const sansFont = Space_Grotesk({subsets: ['latin'], variable: '--font-grotesk', display: 'swap'});

export const fontVariables = `${displayFont.variable} ${markerFont.variable} ${sansFont.variable}`;
```

`app/globals.css` (full replace):

```css
@import "tailwindcss";

@theme inline {
  --color-paper: #F2EFE8;
  --color-ink: #0B0B0B;
  --color-red: #E10600;
  --color-blood: #8F0000;
  --font-display: var(--font-knewave), Impact, system-ui, sans-serif;
  --font-tag: var(--font-marker), "Comic Sans MS", cursive;
  --font-sans: var(--font-grotesk), system-ui, sans-serif;
}

html { scroll-behavior: smooth; }
html, body { overflow-x: clip; }

body {
  background-color: var(--color-paper);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.14 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

:focus-visible { outline: 3px solid var(--color-red); outline-offset: 3px; }

.ink-shadow { text-shadow: 4px 4px 0 var(--color-ink); }
.red-shadow { text-shadow: 3px 3px 0 var(--color-red); }

.sticker {
  background-color: var(--color-paper);
  border: 3px solid var(--color-ink);
  box-shadow: 6px 6px 0 var(--color-ink);
}
.tilt-l { transform: rotate(-1.5deg); }
.tilt-r { transform: rotate(1.5deg); }
.tilt-l, .tilt-r { transition: transform 200ms ease; }
.tilt-l:hover, .tilt-r:hover, .tilt-l:focus-within, .tilt-r:focus-within { transform: rotate(0deg); }

.halftone {
  background-image: radial-gradient(var(--color-ink) 1.3px, transparent 1.6px);
  background-size: 9px 9px;
}
.notebook {
  background-image: repeating-linear-gradient(to bottom, transparent 0 31px, rgb(11 11 11 / 0.12) 31px 32px);
}

.btn-press {
  box-shadow: 0 3px 0 var(--color-ink);
  transition: transform 100ms ease, box-shadow 100ms ease;
}
.btn-press:active { transform: translateY(3px); box-shadow: 0 0 0 var(--color-ink); }

.ticker { overflow: hidden; }
.ticker-track { animation: ticker 40s linear infinite; }
.ticker:hover .ticker-track { animation-play-state: paused; }
@keyframes ticker { to { transform: translateX(-50%); } }

[data-reveal] { transition: opacity 500ms ease, transform 500ms ease; }
[data-reveal="pending"] { opacity: 0; transform: translateY(12px); }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  [data-reveal] { transition: none; opacity: 1 !important; transform: none !important; }
  .btn-press, .tilt-l, .tilt-r { transition: none; }
  .ticker-track { animation: none; }
}
```

`components/ui/button.ts`:

```ts
type Variant = 'primary' | 'secondary';

const variants: Record<Variant, string> = {
  primary: 'bg-red text-paper',
  secondary: 'bg-paper text-ink',
};

export function buttonClass(variant: Variant = 'primary'): string {
  return `btn-press inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-md border-[3px] border-ink px-5 py-3 font-bold uppercase tracking-wide ${variants[variant]}`;
}
```

`components/zine/Ticker.tsx`:

```tsx
import {getTranslations} from 'next-intl/server';

export async function Ticker() {
  const t = await getTranslations('Ticker');
  const items = Array.from({length: 6}, () => t('text'));
  return (
    <div aria-hidden="true" data-testid="ticker" className="ticker border-y-[3px] border-ink bg-ink py-2 font-tag text-lg text-paper">
      <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
        {[...items, ...items].map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}
```

Messages: add these to `messages/en.json`:
- `"Ticker": {"text": "JOHN CASILDO ✱ WEB DEV ✱ SITES ✱ WEB APPS ✱ BACKENDS ✱ COSTA RICA ✱"}`
- `"fanArt": "Fan art. Not affiliated with Marvel or Sony."` inside `Footer`

And to `messages/es.json`:
- `"Ticker": {"text": "JOHN CASILDO ✱ DESARROLLO WEB ✱ SITIOS ✱ APPS WEB ✱ BACKENDS ✱ COSTA RICA ✱"}`
- `"fanArt": "Fan art. Sin afiliación con Marvel o Sony."`

Change `Hero.mascotAlt`:
- EN: `"Masked hero in a black and red suit hanging upside down from a web"`
- ES: `"Héroe enmascarado con traje negro y rojo colgando de cabeza de una telaraña"`

`components/ui/Footer.tsx`: render `<p className="w-full text-xs opacity-70">{t('fanArt')}</p>` as the last child of the flex wrapper.

`app/[locale]/layout.tsx`:
- Remove the `Background` import and element.
- Import `Ticker` from `@/components/zine/Ticker`.
- Render `<Ticker />` right after `<Header />` and right before `<Footer />`.

Delete the quilt files listed above. In `tests/e2e/three.spec.ts` and `tests/e2e/polish.spec.ts`, change `wake3D` to wait for `page.getByTestId('mascot-canvas').locator('canvas')` instead of `bg-canvas`. Delete these assertions:
- `bg-canvas` and `bg-fallback`
- the test `background canvas renders without errors` (replace its body with a mascot-canvas attach plus a no-errors check)

Other sections still use `text-denim`, `bg-spray`, and `text-spray` until Task 2. Replace them now with `text-ink` and `bg-red` so the build passes:

```bash
grep -rl --include=*.tsx -E "denim|spray" components app | xargs sed -i '' -e 's/text-denim/text-ink/g' -e 's/bg-spray/bg-red/g' -e 's/decoration-spray/decoration-red/g' -e 's/border-spray/border-red/g' -e 's/hover:text-denim/hover:text-red/g'
```

- [ ] **Step 3: Run the gates and e2e**

Run `npm run lint && npm run typecheck && npm test`, then build and run `npx playwright test`. Expected: all pass, including `zine.spec.ts`.

- [ ] **Step 4: Commit**

Message: `feat(zine): red/black tokens, marker fonts, grain, ticker; remove triangle quilt`

---

### Task 2: Zine decor components and the section restyle

**Files:**
- Create: `components/zine/Doodle.tsx`, `components/zine/NumberSticker.tsx`, `components/zine/Tape.tsx`, `components/zine/SpiderStamp.tsx`, `components/zine/TornEdge.tsx`, `scripts/make-covers.py`
- Modify: `components/ui/{Header,SectionHeading,Badge}.tsx`, `components/sections/{Hero,Services,ServiceIcon,ProjectCard,ProjectsSection,About,Contact,ContactForm}.tsx`, `app/[locale]/not-found.tsx`, `app/[locale]/opengraph-image.tsx`, `public/projects/*.svg`

**Interfaces:**
- Produces:
  - `<Doodle kind color? className?/>` with `kind` one of `'arrow' | 'arrow-curve' | 'circle-scribble' | 'star' | 'x' | 'spiral' | 'crown' | 'zigzag' | 'underline'`
  - `<NumberSticker n className?/>`
  - `<Tape className?/>`
  - `<SpiderStamp className? rough?/>`
  - `<TornEdge position: 'top' | 'bottom' className?/>`
  - The Hero keeps the `data-slot="mascot"` container. The stamp inside has `data-stamp`.

- [ ] **Step 1: Write the decor components**

`components/zine/Doodle.tsx`:

```tsx
type Kind = 'arrow' | 'arrow-curve' | 'circle-scribble' | 'star' | 'x' | 'spiral' | 'crown' | 'zigzag' | 'underline';

const PATHS: Record<Kind, string[]> = {
  arrow: ['M8 60 C30 40 55 38 88 42', 'M74 30 L90 42 L76 54'],
  'arrow-curve': ['M10 85 C20 30 70 15 88 30', 'M74 22 L89 31 L80 46'],
  'circle-scribble': ['M50 10 C80 8 95 35 88 60 C80 88 40 95 18 75 C2 58 10 22 40 12 C60 6 85 18 92 30'],
  star: ['M50 8 L61 38 L94 40 L68 60 L77 92 L50 74 L23 92 L32 60 L6 40 L39 38 Z'],
  x: ['M20 20 L80 80', 'M80 18 L22 82'],
  spiral: ['M50 50 C54 46 58 52 54 57 C48 63 40 55 43 47 C47 36 62 36 66 48 C71 63 56 74 42 70 C24 64 26 38 42 30 C62 20 82 36 80 58'],
  crown: ['M12 72 L20 30 L38 52 L50 20 L62 52 L80 30 L88 72 Z'],
  zigzag: ['M5 60 L20 40 L35 60 L50 40 L65 60 L80 40 L95 60'],
  underline: ['M5 55 C30 47 60 65 95 50', 'M12 70 C40 62 70 76 90 68'],
};

export function Doodle({kind, color = 'ink', className = ''}: {kind: Kind; color?: 'ink' | 'red'; className?: string}) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`pointer-events-none ${color === 'red' ? 'text-red' : 'text-ink'} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[kind].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
```

`components/zine/NumberSticker.tsx`:

```tsx
export function NumberSticker({n, className = ''}: {n: number; className?: string}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-paper font-tag text-lg leading-none ${className}`}
    >
      {n}
    </span>
  );
}
```

`components/zine/Tape.tsx`:

```tsx
export function Tape({className = ''}: {className?: string}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 border border-ink/20 bg-white/60 shadow-sm ${className}`}
    />
  );
}
```

`components/zine/SpiderStamp.tsx`:

```tsx
import {useId} from 'react';

const LEGS = [
  'M-4 -10 L-12 -30 L-9 -56',
  'M-6 -5 L-28 -18 L-38 -44',
  'M-6 6 L-30 16 L-42 42',
  'M-4 13 L-14 36 L-9 58',
];

/** Spray-painted spider emblem drawn from scratch: ring + spider, roughened with an SVG displacement filter. */
export function SpiderStamp({className = '', rough = true}: {className?: string; rough?: boolean}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="-62 -62 124 124" aria-hidden="true" className={`pointer-events-none ${className}`} fill="currentColor">
      {rough && (
        <filter id={`spray-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="3.5" />
        </filter>
      )}
      <g filter={rough ? `url(#spray-${id})` : undefined}>
        <circle r="41" fill="none" stroke="currentColor" strokeWidth="7" />
        <ellipse cy="10" rx="9" ry="15" />
        <ellipse cy="-8" rx="7" ry="8" />
        <path d="M-3 -16 L-5 -22 M3 -16 L5 -22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {[1, -1].map((side) => (
          <g key={side} transform={`scale(${side} 1)`}>
            {LEGS.map((d) => (
              <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
```

`components/zine/TornEdge.tsx`:

```tsx
const TEETH = 24;
const points = Array.from({length: TEETH + 1}, (_, i) => `${(i / TEETH) * 100},${i % 2 === 0 ? 0 : 100}`).join(' ');

/** Zigzag torn-paper strip; inherits the panel color via `currentColor`. */
export function TornEdge({position, className = ''}: {position: 'top' | 'bottom'; className?: string}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`pointer-events-none block h-3 w-full ${position === 'top' ? 'rotate-180' : ''} ${className}`}
    >
      <polygon points={`0,0 ${points} 100,0`} fill="currentColor" />
    </svg>
  );
}
```

- [ ] **Step 2: Restyle the shared UI**

`components/ui/SectionHeading.tsx`:

```tsx
export function SectionHeading({id, tag, title}: {id: string; tag: string; title: string}) {
  return (
    <div>
      <p aria-hidden="true" className="inline-block -rotate-2 font-tag text-xl">{tag}</p>
      <h2 id={`${id}-title`} className="red-shadow font-display text-5xl leading-none md:text-6xl">{title}</h2>
    </div>
  );
}
```

`components/ui/Badge.tsx`:

```tsx
export function Badge({children}: {children: React.ReactNode}) {
  return (
    <span className="inline-flex items-center rounded-sm border-2 border-ink bg-paper px-2.5 py-0.5 font-tag text-sm">
      {children}
    </span>
  );
}
```

`components/ui/Header.tsx`: the logo `Link` content becomes:

```tsx
<SpiderStamp rough={false} className="h-8 w-8 text-red" />
<span className="font-display text-3xl leading-none">JC</span>
```

The `Link` gets `gap-2` and an `aria-label="JC"` so the existing e2e name still matches. Nav links use `font-tag`. The header is `border-b-[3px]`.

- [ ] **Step 3: Restyle the sections**

`components/sections/Hero.tsx` (full replace):

```tsx
import {getTranslations} from 'next-intl/server';
import {buttonClass} from '@/components/ui/button';
import {HeroMascot} from '@/components/three/HeroMascot';
import {Doodle} from '@/components/zine/Doodle';
import {NumberSticker} from '@/components/zine/NumberSticker';
import {SpiderStamp} from '@/components/zine/SpiderStamp';

export async function Hero() {
  const t = await getTranslations('Hero');
  return (
    <section id="top" data-section aria-labelledby="top-title" className="relative overflow-hidden">
      <Doodle kind="star" color="red" className="absolute left-[46%] top-10 hidden w-10 md:block" />
      <Doodle kind="x" className="absolute bottom-16 left-6 w-8" />
      <Doodle kind="spiral" className="absolute right-4 top-6 hidden w-14 sm:block" />
      <div className="relative mx-auto grid min-h-[calc(100svh-7.5rem)] max-w-6xl items-center gap-6 px-4 py-10 md:grid-cols-[1.1fr_1fr]">
        <div className="relative">
          <NumberSticker n={1} className="absolute -top-8 left-0" />
          <div className="flex items-end gap-2 pl-10">
            <p aria-hidden="true" className="-rotate-3 font-tag text-2xl">{t('tag')}</p>
            <Doodle kind="arrow-curve" className="w-12 rotate-90" />
          </div>
          <h1 id="top-title" className="ink-shadow mt-2 font-display text-[3.1rem] leading-[0.95] break-words text-red sm:text-7xl lg:text-8xl">
            {t('name')}
          </h1>
          <Doodle kind="underline" color="red" className="-mt-1 w-56" />
          <p className="mt-3 max-w-md text-lg">{t('valueProp')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#work" className={buttonClass('primary')}>{t('ctaWork')}</a>
            <a href="#contact" className={buttonClass('secondary')}>{t('ctaContact')}</a>
          </div>
        </div>
        <div data-slot="mascot" className="relative h-[55svh] md:h-[72svh]">
          <div data-stamp className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <SpiderStamp className="w-[88%] max-w-md text-red opacity-20" />
          </div>
          <HeroMascot alt={t('mascotAlt')} />
        </div>
      </div>
    </section>
  );
}
```

`components/sections/ServiceIcon.tsx`: keep the same shapes, with fills remapped to the zine palette:
- `websites`: `#F2EFE8`, `#E10600`, `#0B0B0B`, `#8F0000`
- `webapps`: `#E10600`, `#F2EFE8`, `#0B0B0B`
- `backends`: `#0B0B0B`, `#E10600`, `#F2EFE8`, `#F2EFE8`

`components/sections/Services.tsx`:
- Each `<li>` gets `className={\`sticker relative p-6 ${i % 2 ? 'tilt-r' : 'tilt-l'}\`}` plus a `<Tape />` child.
- The section gets `relative overflow-hidden border-t-[3px] border-ink`, plus `<Doodle kind="arrow" className="absolute right-6 top-10 hidden w-20 md:block" />` and `<NumberSticker n={2} className="absolute left-4 top-6" />`.

`components/sections/ProjectCard.tsx`:
- The `<article>` classes become `sticker relative flex flex-col ${project.featured ? 'md:col-span-2 tilt-l' : 'tilt-r'}`, and it gets `<Tape />`.
- The featured label becomes `w-fit -rotate-2 bg-red px-2 py-0.5 font-tag text-sm text-paper`.
- The cover keeps `border-b-[3px]`.

`components/sections/ProjectsSection.tsx`: `relative overflow-hidden border-t-[3px] border-ink`, plus a `halftone` patch (`absolute -right-10 top-24 h-56 w-56 rounded-full opacity-15`), `<Doodle kind="circle-scribble" color="red" className="absolute left-[38%] top-8 hidden w-24 md:block" />`, and `<NumberSticker n={3} className="absolute left-4 top-6" />`.

`components/sections/About.tsx`:
- Wrap the content in `<div className="relative text-[#E6E1D6]"><TornEdge position="top" /><div className="bg-[#E6E1D6] text-ink">…existing content…</div><TornEdge position="bottom" /></div>`.
- The section keeps its id and attributes, drops the `bg-paper/90` and border classes, and adds `<Doodle kind="crown" color="red" className="absolute right-8 top-10 w-14" />` and `<NumberSticker n={4} className="absolute left-4 top-6" />` (the section is `relative overflow-hidden py-10`).

`components/sections/Contact.tsx`:
- The form card becomes `sticker notebook relative p-6 tilt-r` with `<Tape />`.
- The section is `relative overflow-hidden border-t-[3px] border-ink`, with `<Doodle kind="zigzag" color="red" className="absolute bottom-6 right-6 w-24" />` and `<NumberSticker n={5} className="absolute left-4 top-6" />`.

`components/sections/ContactForm.tsx`: the input class becomes `'mt-1 block min-h-12 w-full rounded-sm border-2 border-ink bg-paper px-3 py-2 text-base aria-[invalid=true]:border-red'`.

`app/[locale]/not-found.tsx`: the `h1` gets `ink-shadow text-red`, and a `<Doodle kind="arrow" color="red" className="w-24 rotate-180" />` goes above the button.

`app/[locale]/opengraph-image.tsx`: background `#F2EFE8`, a tag line in `#0B0B0B`, the name in `#E10600` with `textShadow: '6px 6px 0 #0B0B0B'`, and a bottom border of `40px solid #0B0B0B`.

- [ ] **Step 4: Regenerate the covers**

`scripts/make-covers.py`:

```python
"""Generates red/black zine cover SVGs for project cards."""
from pathlib import Path

COVERS = {
    'presencia': ('PRESENCIA', 'iOS + Android + Supabase'),
    'maruchan-university': ('MARUCHAN U.', 'FastAPI + PostgreSQL'),
    'stub': ('STUB', 'Flutter + OCR'),
}

TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="3.2" fill="#0B0B0B"/></pattern>
    <filter id="spray"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter>
  </defs>
  <rect width="1200" height="750" fill="#F2EFE8"/>
  <circle cx="980" cy="160" r="260" fill="url(#dots)" opacity="0.18"/>
  <g filter="url(#spray)"><circle cx="230" cy="560" r="170" fill="none" stroke="#E10600" stroke-width="26" opacity="0.85"/></g>
  <path d="M80 120 C300 60 520 180 760 110" fill="none" stroke="#0B0B0B" stroke-width="10" stroke-linecap="round"/>
  <path d="M700 90 L765 110 L712 150" fill="none" stroke="#0B0B0B" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <g transform="rotate(-4 600 400)">
    <text x="606" y="436" text-anchor="middle" font-family="Impact, Haettenschweiler, 'Arial Black', sans-serif" font-size="150" fill="#0B0B0B">{title}</text>
    <text x="600" y="430" text-anchor="middle" font-family="Impact, Haettenschweiler, 'Arial Black', sans-serif" font-size="150" fill="#E10600">{title}</text>
  </g>
  <rect x="380" y="520" width="440" height="64" fill="#0B0B0B" transform="rotate(2 600 552)"/>
  <text x="600" y="563" text-anchor="middle" font-family="'Comic Sans MS', 'Marker Felt', cursive" font-size="34" fill="#F2EFE8" transform="rotate(2 600 552)">{sub}</text>
</svg>
"""

for slug, (title, sub) in COVERS.items():
    Path(f'public/projects/{slug}.svg').write_text(TEMPLATE.format(title=title, sub=sub))
    print('wrote', slug)
```

Run: `python3 scripts/make-covers.py`

- [ ] **Step 5: Gates, e2e, visual check, commit**

Run the gates and the full e2e. Take screenshots at 1280 and 375 to check that the doodles never cover text. Commit: `feat(zine): doodles, stickers, tape, spider stamp, and section restyle`.

---

### Task 3: Cel-shaded hanging hero

**Files:**
- Delete: `components/three/{buildMascot,ps1,Mascot,MascotCanvas}.ts(x)`, `lib/mascot-motion.ts`, `tests/unit/{mascot,mascot-motion}.test.ts`, `public/mascot-fallback.png`
- Create: `lib/hero-motion.ts`, `components/hero3d/toonMaterial.ts`, `components/hero3d/buildHero.ts`, `components/hero3d/HeroCharacter.tsx`, `components/hero3d/HeroCanvas.tsx`, `tests/unit/hero-motion.test.ts`, `tests/unit/hero-model.test.ts`, `public/hero-fallback.png` (generated)
- Modify: `components/three/HeroMascot.tsx` (import `HeroCanvas`; fallback `/hero-fallback.png`), `scripts/capture-mascot.mjs` (output `public/hero-fallback.png`; hide `[data-stamp]`), `tests/e2e/polish.spec.ts` (accessible name `/hero/i`), `tests/e2e/three.spec.ts` (alt `/hero/i`)

**Interfaces:**
- Produces:
  - Constants: `SWAY`, `TWIST`, `LOOK`, `DROP`
  - Motion functions:
    - `sway(t): number`
    - `twist(t): number`
    - `headLook(x, y): {yaw, pitch}`
    - `dropOffset(t): number`
    - `damp(current, target, lambda, dt): number`
  - Material and model:
    - `createToonMaterial({color, webLines?}): THREE.ShaderMaterial`
    - `TOON_FRAGMENT`
    - `buildHero({webLength?}): THREE.Group` with named nodes `pivot`, `web`, `body`, `hips`, `torso`, `head`, `armL`, `armR`, `legL`, `legR`
    - `countTriangles(obj): number`
  - Components:
    - `HeroCanvas` (default export, `{reducedMotion, alt}`, wrapper `role="img"` and `data-testid="mascot-canvas"`)
    - `HeroCharacter({reducedMotion})`

- [ ] **Step 1: Failing unit tests**

`tests/unit/hero-motion.test.ts`:

```ts
import {describe, expect, test} from 'vitest';
import {damp, DROP, dropOffset, headLook, LOOK, sway, SWAY, twist, TWIST} from '@/lib/hero-motion';

describe('hero motion', () => {
  test('sway and twist stay within their amplitudes', () => {
    for (let t = 0; t < 20; t += 0.05) {
      expect(Math.abs(sway(t))).toBeLessThanOrEqual(SWAY.amplitude + 1e-9);
      expect(Math.abs(twist(t))).toBeLessThanOrEqual(TWIST.amplitude + 1e-9);
    }
  });

  test('head look is clamped and mirrored for the upside-down body', () => {
    expect(headLook(5, 0).yaw).toBeCloseTo(-LOOK.yaw);
    expect(headLook(-5, 0).yaw).toBeCloseTo(LOOK.yaw);
    expect(headLook(0, 1).pitch).toBeCloseTo(LOOK.pitch);
    expect(headLook(0, -9).pitch).toBeCloseTo(-LOOK.pitch);
  });

  test('drop-in starts high, overshoots below rest, and settles', () => {
    expect(dropOffset(0)).toBeCloseTo(DROP.height);
    let min = Infinity;
    for (let t = 0; t <= 1; t += 0.01) min = Math.min(min, dropOffset(t));
    expect(min).toBeLessThan(-0.1);
    expect(Math.abs(dropOffset(1.2))).toBeLessThan(0.03);
    expect(dropOffset(5)).toBe(0);
  });

  test('damp approaches the target without overshoot', () => {
    const v = damp(0, 1, 6, 1 / 60);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
  });
});
```

`tests/unit/hero-model.test.ts`:

```ts
import * as THREE from 'three';
import {describe, expect, test} from 'vitest';
import {buildHero, countTriangles} from '@/components/hero3d/buildHero';
import {createToonMaterial, TOON_FRAGMENT} from '@/components/hero3d/toonMaterial';

describe('buildHero', () => {
  const hero = buildHero();
  hero.updateMatrixWorld(true);

  test('has 1,500–4,000 non-outline triangles', () => {
    const tris = countTriangles(hero);
    expect(tris).toBeGreaterThanOrEqual(1500);
    expect(tris).toBeLessThanOrEqual(4000);
  });

  test('exposes every animated joint', () => {
    for (const name of ['pivot', 'web', 'body', 'hips', 'torso', 'head', 'armL', 'armR', 'legL', 'legR']) {
      expect(hero.getObjectByName(name), name).toBeDefined();
    }
  });

  test('hangs upside down: head below hips, web above the body', () => {
    const y = (name: string) => hero.getObjectByName(name)!.getWorldPosition(new THREE.Vector3()).y;
    expect(y('head')).toBeLessThan(y('hips'));
    expect(y('pivot')).toBeGreaterThan(y('hips'));
  });
});

describe('toon material', () => {
  test('exposes the comic uniforms and halftone shading', () => {
    const m = createToonMaterial({color: '#111114', webLines: true});
    for (const u of ['uColor', 'uLineColor', 'uInk', 'uLightDir', 'uWebLines', 'uDotSize']) expect(m.uniforms[u], u).toBeDefined();
    expect(m.uniforms.uWebLines!.value).toBe(1);
    expect(TOON_FRAGMENT).toContain('halftone');
  });
});
```

Run `npm test`. Expected: FAIL (the modules are missing).

- [ ] **Step 2: Motion**

`lib/hero-motion.ts`:

```ts
const deg = (d: number) => (d * Math.PI) / 180;
const clamp = (v: number, min = -1, max = 1) => Math.min(max, Math.max(min, v));

export const SWAY = {amplitude: deg(6), period: 3.2} as const;
export const TWIST = {amplitude: deg(20), period: 7} as const;
export const LOOK = {yaw: deg(25), pitch: deg(12)} as const;
export const DROP = {height: 1.2, omega: 10, zeta: 0.35, settle: 1.6} as const;

/** Pendulum angle around the web's top anchor (radians). */
export function sway(t: number): number {
  return SWAY.amplitude * Math.sin((2 * Math.PI * t) / SWAY.period);
}

/** Slow spin around the web axis (radians). */
export function twist(t: number): number {
  return TWIST.amplitude * Math.sin((2 * Math.PI * t) / TWIST.period);
}

/**
 * Pointer (x right, y up, in [-1, 1]) → head rotation in the body's local frame.
 * The body hangs upside down (rotated π around z), so both axes are mirrored.
 */
export function headLook(x: number, y: number): {yaw: number; pitch: number} {
  return {yaw: -clamp(x) * LOOK.yaw, pitch: clamp(y) * LOOK.pitch};
}

/** Under-damped spring: height above rest while dropping in on the web (0 once settled). */
export function dropOffset(t: number): number {
  if (t <= 0) return DROP.height;
  if (t >= DROP.settle) return 0;
  const omegaD = DROP.omega * Math.sqrt(1 - DROP.zeta * DROP.zeta);
  return DROP.height * Math.exp(-DROP.zeta * DROP.omega * t) * Math.cos(omegaD * t);
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt);
}
```

- [ ] **Step 3: Toon material**

`components/hero3d/toonMaterial.ts`:

```ts
import * as THREE from 'three';

export const TOON_VERTEX = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vPos;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const TOON_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uLineColor;
  uniform vec3 uInk;
  uniform vec3 uLightDir;
  uniform float uWebLines;
  uniform float uDotSize;
  varying vec3 vNormalV;
  varying vec3 vPos;

  float halftone(float amount) {
    vec2 cell = mod(gl_FragCoord.xy, uDotSize) - 0.5 * uDotSize;
    return step(length(cell) / (0.5 * uDotSize), amount);
  }

  void main() {
    vec3 n = normalize(vNormalV);
    float ndl = dot(n, normalize(uLightDir));
    vec3 base = uColor;
    if (uWebLines > 0.5) {
      float around = atan(vPos.z, vPos.x) / 6.2831853 * 10.0;
      float rings = abs(fract(vPos.y * 9.0) - 0.5);
      float spokes = abs(fract(around) - 0.5);
      base = mix(base, uLineColor, step(0.43, max(rings, spokes)));
    }
    vec3 c;
    float dots;
    if (ndl > 0.35) { c = base; dots = 0.0; }
    else if (ndl > -0.15) { c = base * 0.78; dots = 0.32; }
    else { c = base * 0.55; dots = 0.62; }
    c += vec3(0.1) * step(0.8, ndl);
    float rim = 1.0 - abs(n.z);
    c += vec3(0.16) * smoothstep(0.62, 0.92, rim) * step(-0.2, ndl);
    c = mix(c, uInk, halftone(dots));
    gl_FragColor = vec4(c, 1.0);
  }
`;

type Options = {color: string; webLines?: boolean};

export function createToonMaterial({color, webLines = false}: Options): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: TOON_VERTEX,
    fragmentShader: TOON_FRAGMENT,
    uniforms: {
      uColor: {value: new THREE.Color(color)},
      uLineColor: {value: new THREE.Color('#E10600')},
      uInk: {value: new THREE.Color('#0B0B0B')},
      uLightDir: {value: new THREE.Vector3(0.45, 0.75, 0.55).normalize()},
      uWebLines: {value: webLines ? 1 : 0},
      uDotSize: {value: 6},
    },
  });
}
```

- [ ] **Step 4: Model**

`components/hero3d/buildHero.ts`:

```ts
import * as THREE from 'three';
import {createToonMaterial} from './toonMaterial';

const COLORS = {suit: '#111114', red: '#E10600', white: '#F7F5F0', ink: '#0B0B0B'} as const;
const OUTLINE = new THREE.MeshBasicMaterial({color: COLORS.ink, side: THREE.BackSide});
const materials = new Map<string, THREE.Material>();

function material(color: string, webLines = false): THREE.Material {
  const key = `${color}:${webLines}`;
  let m = materials.get(key);
  if (!m) {
    m = createToonMaterial({color, webLines});
    materials.set(key, m);
  }
  return m;
}

function part(name: string, geometry: THREE.BufferGeometry, color: string, {webLines = false, outline = 1.05} = {}): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material(color, webLines));
  mesh.name = name;
  if (outline > 0) {
    const shell = new THREE.Mesh(geometry, OUTLINE);
    shell.scale.setScalar(outline);
    shell.userData.outline = true;
    mesh.add(shell);
  }
  return mesh;
}

const capsule = (radius: number, length: number) => new THREE.CapsuleGeometry(radius, length, 4, 10);

function joint(name: string, x: number, y: number, z = 0): THREE.Group {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(x, y, z);
  return g;
}

function limb(prefix: string, upper: [number, number], lower: [number, number], color: string) {
  const top = joint(`${prefix}Upper`, 0, 0);
  const up = part(`${prefix}UpperMesh`, capsule(upper[0], upper[1]), color, {webLines: true});
  up.position.y = -(upper[1] / 2 + upper[0] * 0.6);
  top.add(up);
  const knee = joint(`${prefix}Joint`, 0, -(upper[1] + upper[0] * 1.2));
  const low = part(`${prefix}LowerMesh`, capsule(lower[0], lower[1]), color, {webLines: true});
  low.position.y = -(lower[1] / 2 + lower[0] * 0.6);
  knee.add(low);
  top.add(knee);
  return {top, knee, end: -(lower[1] + lower[0] * 1.2)};
}

function eyeShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.085, 0.035);
  s.quadraticCurveTo(0.0, 0.075, 0.07, 0.0);
  s.quadraticCurveTo(0.02, -0.06, -0.075, -0.03);
  s.closePath();
  return s;
}

function emblem(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'emblem';
  const red = material(COLORS.red);
  const body = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), red);
  body.scale.set(0.8, 1.4, 1);
  g.add(body);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.012), red);
      leg.position.set(side * 0.05, 0.04 - i * 0.03, 0);
      leg.rotation.z = side * (0.9 - i * 0.55);
      g.add(leg);
    }
  }
  return g;
}

/** Hero hanging upside down from a web (pure; no renderer needed). Root origin = top web anchor. */
export function buildHero({webLength = 1.0} = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'hero';

  const pivot = joint('pivot', 0, 0);
  root.add(pivot);

  const web = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), new THREE.MeshBasicMaterial({color: COLORS.white}));
  web.name = 'web';
  web.scale.y = webLength;
  web.position.y = -webLength / 2;
  pivot.add(web);

  // `body` origin is at the ankles; the upright figure inside is flipped so it hangs head-down.
  const body = joint('body', 0, -webLength);
  pivot.add(body);
  const upright = new THREE.Group();
  upright.rotation.z = Math.PI;
  body.add(upright);
  const figure = new THREE.Group();
  figure.position.y = -0.08; // ankles at body origin
  upright.add(figure);

  const hips = joint('hips', 0, 1.55);
  figure.add(hips);
  const pelvis = part('pelvis', capsule(0.13, 0.16), COLORS.suit, {webLines: true});
  pelvis.rotation.z = Math.PI / 2;
  hips.add(pelvis);

  for (const side of [-1, 1] as const) {
    const leg = limb(side < 0 ? 'legL' : 'legR', [0.085, 0.58], [0.068, 0.56], COLORS.suit);
    leg.top.name = side < 0 ? 'legL' : 'legR';
    leg.top.position.set(side * 0.11, -0.05, 0);
    leg.top.rotation.z = side * 0.03;
    leg.knee.rotation.x = 0.18;
    hips.add(leg.top);
    const shoe = part(`shoe${side}`, new THREE.BoxGeometry(0.12, 0.08, 0.27), COLORS.suit);
    shoe.position.set(0, leg.end - 0.02, 0.06);
    const sole = part(`sole${side}`, new THREE.BoxGeometry(0.125, 0.03, 0.28), COLORS.red, {outline: 0});
    sole.position.set(0, -0.05, 0);
    shoe.add(sole);
    leg.knee.add(shoe);
  }

  const torso = joint('torso', 0, 0.05);
  hips.add(torso);
  const abdomen = part('abdomen', capsule(0.15, 0.26), COLORS.suit, {webLines: true});
  abdomen.position.y = 0.24;
  torso.add(abdomen);
  const chest = part('chest', capsule(0.19, 0.22), COLORS.suit, {webLines: true});
  chest.scale.set(1.28, 1, 0.78);
  chest.position.y = 0.58;
  torso.add(chest);
  const mark = emblem();
  mark.position.set(0, 0.6, 0.155);
  torso.add(mark);
  const neck = part('neck', new THREE.CylinderGeometry(0.06, 0.07, 0.12, 10), COLORS.suit, {outline: 0});
  neck.position.y = 0.84;
  torso.add(neck);

  const head = joint('head', 0, 0.9);
  torso.add(head);
  const skull = part('skull', new THREE.SphereGeometry(0.19, 18, 14), COLORS.suit, {webLines: true});
  skull.scale.set(0.9, 1.12, 0.96);
  skull.position.y = 0.17;
  head.add(skull);
  for (const side of [-1, 1] as const) {
    const eye = new THREE.Group();
    eye.position.set(side * 0.075, 0.2, 0.165);
    eye.rotation.y = side * 0.38;
    eye.scale.x = side;
    const rim = new THREE.Mesh(new THREE.ShapeGeometry(eyeShape(), 6), material(COLORS.ink));
    rim.scale.setScalar(1.3);
    rim.position.z = -0.002;
    const white = new THREE.Mesh(new THREE.ShapeGeometry(eyeShape(), 6), new THREE.MeshBasicMaterial({color: COLORS.white}));
    white.position.z = 0.004;
    eye.add(rim, white);
    head.add(eye);
  }

  for (const side of [-1, 1] as const) {
    const arm = limb(side < 0 ? 'armL' : 'armR', [0.062, 0.4], [0.056, 0.38], COLORS.suit);
    arm.top.name = side < 0 ? 'armL' : 'armR';
    arm.top.position.set(side * 0.27, 0.74, 0);
    // Upright frame: arms raised overhead → they dangle toward the ground once flipped.
    arm.top.rotation.z = side * (Math.PI - 0.32);
    arm.top.rotation.x = side < 0 ? 0.12 : -0.08;
    arm.knee.rotation.z = side * -0.25;
    torso.add(arm.top);
    const hand = part(`hand${side}`, capsule(0.055, 0.07), COLORS.red);
    hand.position.y = arm.end - 0.02;
    arm.knee.add(hand);
  }

  return root;
}

export function countTriangles(object: THREE.Object3D): number {
  let total = 0;
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || child.userData.outline === true) return;
    const g = child.geometry as THREE.BufferGeometry;
    total += (g.index ? g.index.count : g.getAttribute('position').count) / 3;
  });
  return total;
}
```

Run `npm test`. Expected: PASS. If the upside-down test fails, the flip axis is wrong. Keep `upright.rotation.z = Math.PI`, which keeps the face toward +z, and fix the joint offsets rather than changing the test.

- [ ] **Step 5: R3F components**

`components/hero3d/HeroCharacter.tsx`:

```tsx
'use client';

import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {damp, dropOffset, headLook, sway, twist} from '@/lib/hero-motion';
import {buildHero} from './buildHero';

const WEB_LENGTH = 1.0;

export function HeroCharacter({reducedMotion}: {reducedMotion: boolean}) {
  const hero = useMemo(() => buildHero({webLength: WEB_LENGTH}), []);
  const parts = useMemo(
    () => ({
      pivot: hero.getObjectByName('pivot'),
      web: hero.getObjectByName('web'),
      body: hero.getObjectByName('body'),
      head: hero.getObjectByName('head'),
    }),
    [hero],
  );
  const pointer = useRef({x: 0, y: 0, active: false});
  const start = useRef<number | null>(null);

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
      hero.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
    },
    [hero],
  );

  useFrame(({clock}, delta) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    start.current ??= t;
    const drop = dropOffset(t - start.current);
    const length = Math.max(0.1, WEB_LENGTH - drop);
    if (parts.web) {
      parts.web.scale.y = length;
      parts.web.position.y = -length / 2;
    }
    if (parts.body) {
      parts.body.position.y = -length;
      parts.body.rotation.y = twist(t);
    }
    if (parts.pivot) parts.pivot.rotation.z = sway(t);
    const target = pointer.current.active ? headLook(pointer.current.x, pointer.current.y) : headLook(Math.sin(t * 0.4) * 0.5, 0);
    if (parts.head) {
      parts.head.rotation.y = damp(parts.head.rotation.y, target.yaw, 5, delta);
      parts.head.rotation.x = damp(parts.head.rotation.x, target.pitch, 5, delta);
    }
  });

  return <primitive object={hero} />;
}
```

`components/hero3d/HeroCanvas.tsx`:

```tsx
'use client';

import {useEffect, useRef, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {HeroCharacter} from './HeroCharacter';

const ANCHOR_Y = 3.2;

export default function HeroCanvas({reducedMotion, alt}: {reducedMotion: boolean; alt: string}) {
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
    <div ref={ref} role="img" aria-label={alt} data-testid="mascot-canvas" className="relative h-full w-full">
      <Canvas
        flat
        dpr={[1, 1.75]}
        gl={{antialias: true, alpha: true}}
        camera={{position: [0, 0.9, 8.6], fov: 30}}
        frameloop={inView && !reducedMotion ? 'always' : 'demand'}
        onCreated={({camera}) => camera.lookAt(0, 0.9, 0)}
      >
        <group position={[0, ANCHOR_Y, 0]}>
          <HeroCharacter reducedMotion={reducedMotion} />
        </group>
      </Canvas>
    </div>
  );
}
```

`components/three/HeroMascot.tsx`:
- Import from `@/components/hero3d/HeroCanvas`.
- Use the image `src="/hero-fallback.png"` with the captured dimensions (read them with `file public/hero-fallback.png`).
- Remove the `pixelated` class.
- Pass `alt={alt}` to the canvas.

- [ ] **Step 6: Tune, capture, test, commit**

Run `npm run dev`. Check, and adjust only joint offsets, rotations, camera, and `ANCHOR_Y`:
- the whole figure plus the web top is in frame at 1280×800 and 375×812
- the face reads as a masked hero with white comic eyes
- the red web lines are visible on the suit
- the halftone shows in the shadows
- the outlines are thick
- the drop-in bounces
- moving the cursor right turns the face to screen-right

Then:
1. Update `scripts/capture-mascot.mjs` to output `public/hero-fallback.png` and to hide `[data-stamp]` in the injected style.
2. Build, start, and capture.
3. Update the e2e alt and name regexes from `/mascot/i` to `/hero/i`.
4. Run the gates and the full e2e.
5. Commit: `feat(hero3d): cel-shaded hanging hero with halftone shading and web`.

---

### Task 4: Lighthouse, PR, deploy

- [ ] **Step 1:** Run `NEXT_PUBLIC_SITE_URL=http://localhost:3100 npm run build`, start the server, and run `node scripts/lighthouse.mjs`. Expected: every category ≥ 90 on `/en` and `/es`. If accessibility drops, the usual cause is red small text, so make it ink.
- [ ] **Step 2:** Push the `redesign` branch, open a PR with a summary plus the fan-art safeguard notes, merge it, wait for the Vercel deploy, and smoke-test production. Check:
  - `/en` and `/es` return 200
  - the fan-art line is present
  - Lighthouse on production is ≥ 90
