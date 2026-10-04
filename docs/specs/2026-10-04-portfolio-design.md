# Portfolio — Design Spec

**Date:** 2026-10-04
**Owner:** John Casildo
**Status:** Draft — awaiting review

## 1. Purpose & success criteria

A freelance portfolio that wins **web app and website** clients, in **English and Spanish**.

Success:
- A visitor understands within ~10 seconds what John builds and how to hire him, in their language.
- The site itself is a work sample: memorable visual identity, fast, polished.
- Lighthouse mobile ≥ 90 for Performance, Accessibility, Best Practices, SEO on both locales.
- A visitor can reach John via contact form, WhatsApp, or email; the latter two work even if the form fails.

Out of scope (v1): blog, CMS, analytics dashboards, pricing pages, testimonials, dark mode, sound effects.

## 2. Visual identity

Theme: **late-90s (PS1/N64) game title screen meets street graffiti**, with a geometric triangle-quilt motif.

### Palette (CSS variables / Tailwind tokens)
| Token | Hex | Use |
|---|---|---|
| `paper` | `#F3C98B` | Page background |
| `ink` | `#111111` | Text, outlines |
| `spray` | `#FF4A1C` | Primary accent, CTAs |
| `denim` | `#1E4E7A` | Secondary accent, links |
| `quilt-*` | `#E8433A #F2A93B #F4E04D #3BB273 #2A9D8F #3A6EA5 #8E5BA8 #E86A9E #F7F3E8` | Triangle grid only |

Contrast: body text is always `ink` on `paper` (≥ 7:1). `spray` is used for large text / buttons with `ink` label (verify ≥ 4.5:1) — never small body text on `paper`.

### Typography (Google Fonts via `next/font`)
| Role | Font | Rule |
|---|---|---|
| Display (name, section titles) | **Rubik Wet Paint** (fallback: Rubik Bubbles) | Only ≥ 40px, max ~5 words |
| Tag accents | **Sedgwick Ave** | Short decorative lines only, never essential info |
| Body / UI | **Space Grotesk** | Everything else |

Display and tag fonts never carry information that isn't also readable elsewhere (e.g. headings have a clean `aria-label` if stylized).

### Mascot
An **original** character (no third-party IP): stylized kid with a large bubbly afro-style hairdo, oversized hoodie, baggy denim with star patches, chunky sneakers, arms crossed, determined expression. Built procedurally in code, PS1-style.

## 3. Information architecture

Routes (`[locale]` ∈ `en`, `es`):
- `/{locale}` — one-page home
- `/{locale}/projects/{slug}` — project case study
- `/` — middleware redirect by `Accept-Language` (es* → `/es`, else `/en`); remembers explicit choice via `NEXT_LOCALE` cookie
- `404` page per locale (styled "GAME OVER — continue?")

### Home sections (in order, each with an `id` for nav anchors)
1. **Hero / title screen** (`#top`) — 3D mascot over triangle grid; tag line (Sedgwick Ave) above name (Rubik Wet Paint); one-line value prop (Space Grotesk); CTAs "See work / Ver proyectos" → `#work`, "Let's talk / Hablemos" → `#contact`.
2. **Services / "select your mode"** (`#services`) — 3 cards: Websites; Web apps; Backends & APIs (Supabase, FastAPI, PostgreSQL). Each: title, one-line pitch, small low-poly SVG icon.
3. **Projects / "level select"** (`#work`) — Presencia as featured large card; Maruchan University and Stub as smaller cards. Card: title, one-liner, stack badges, cover image, link to case study.
4. **About** (`#about`) — 2–3 sentence bio, stack badges, GitHub link.
5. **Contact / "continue?"** (`#contact`) — form + WhatsApp + email buttons.

Header: name/logo (→ `#top`), anchor nav, EN/ES toggle (switches to the same page in the other locale). Footer: © year, GitHub, email.

### Project case study page
Hero image, title, one-liner, role, stack, "Problem → What I built → Result" sections, links (live / repo when public), next-project link. Content from MDX.

Initial projects:
| Slug | Featured | Links |
|---|---|---|
| `presencia` | yes | GitHub `john-casildo/PresenciaApp`; landing page (URL TBD by John — if not deployed, omit live link) |
| `maruchan-university` | no | GitHub `john-casildo/Maruchan_University` |
| `stub` | no | GitHub `john-casildo/Stub` |

Coursework repos (Veterinaria, VetDB, Biblioteca) are excluded.

## 4. Motion & 3D

### Mascot (`components/three/Mascot.tsx`)
- Built from Three.js primitives (boxes, low-segment spheres/cylinders/icosahedrons), total **300–600 triangles**, `flatShading: true`, `MeshToonMaterial` or `MeshBasicMaterial` with baked flat colors.
- Ink outline: inverted-hull back-face mesh (scaled, black, `side: BackSide`).
- Animations (all in `useFrame`, delta-time based):
  - Idle breathing: torso scale-Y ±2%, 3.5s period.
  - Blink: eye scale-Y → 0.1 for 120ms, random interval 2.5–6s.
  - Head look-at: head yaw/pitch eases toward pointer (clamped ±30° yaw, ±15° pitch); on touch devices uses `deviceorientation` when permitted, else a slow idle sway.
- Exposes a single prop interface `{ reducedMotion: boolean }` so a future `.glb` model can replace it behind the same component.

### PS1 look (`components/three/Ps1Effect`)
- Render at low internal resolution (target 320×240, preserving aspect; `gl.setPixelRatio` + canvas CSS `image-rendering: pixelated`).
- Vertex snapping: custom `onBeforeCompile` injection that snaps clip-space positions to a coarse grid (snap resolution uniform, default 160×120).
- No antialiasing. Optional 4×4 Bayer dither on final colors (disabled if it hurts contrast).

### Triangle grid (`components/three/TriangleField.tsx`)
- Full-viewport background behind hero (and, at lower opacity, behind the page via fixed canvas).
- Single `InstancedMesh` of right triangles arranged as the quilt pattern (square cells split diagonally, alternating direction).
- Per-instance color from `quilt-*` palette via seeded random.
- Shader/uniform-driven: pointer ripple (triangles near cursor flip/rotate and brighten, falloff radius ~15% of viewport); section change (driven by `IntersectionObserver` on sections) triggers a staggered "slide" re-pattern over ~800ms.
- Target ≤ 2,000 instances; frame budget ≤ 4ms on mid-range phones.

### Performance & fallbacks
- `<Canvas>` is loaded via `next/dynamic` with `ssr: false` after first paint; hero text is server-rendered and visible immediately (LCP is text, not canvas).
- `frameloop="demand"` when not visible (pause via `IntersectionObserver` / `visibilitychange`).
- **Reduced motion** (`prefers-reduced-motion: reduce`): no animation loop; render one static frame (or static image).
- **No WebGL** (detected before mounting): show static `public/mascot-fallback.png` and CSS/SVG triangle pattern.
- Static fallback PNG generated once from the scene and committed.

### UI motion
- Buttons: chunky press — `translateY(2px)` + shadow collapse, 100ms.
- Section reveal: fade/slide 12px, once, via CSS + `IntersectionObserver`; disabled under reduced motion.

## 5. Internationalization
- **next-intl** with `messages/en.json`, `messages/es.json`; all UI strings come from message files (no hard-coded copy in components).
- Project content: `content/projects/{slug}.{locale}.mdx` with frontmatter `{ title, summary, role, stack[], cover, repo?, live?, featured, order }`. Build fails if a slug is missing a locale.
- `<html lang>` set per locale; `hreflang` alternates and per-locale `<title>`/description/OpenGraph.
- Unit test: `en.json` and `es.json` have identical key sets.

## 6. Contact

### Form
Fields: name (1–100), email (valid), message (10–2000), hidden honeypot `company`.

### `POST /api/contact` (Route Handler, Node runtime)
1. Parse JSON; validate with **zod** (shared schema with client).
2. If honeypot non-empty → return `200 { ok: true }` silently (don't tip off bots).
3. Rate limit: 5 requests / 10 min per IP (in-memory map; acceptable for v1 — best-effort per serverless instance).
4. Send via **Resend** to `CONTACT_TO_EMAIL` from `CONTACT_FROM_EMAIL`, `reply_to` = visitor email; subject `[Portfolio] {name}`.
5. Responses: `200 {ok:true}`; `400 {error:"invalid", fields}`; `429 {error:"rate_limited"}`; `500 {error:"send_failed"}`. Never leak provider error details.

Client: inline field errors, disabled submit while sending, success state ("Message sent — I'll reply within 48h" / ES equivalent), failure state that surfaces the WhatsApp/email links.

### Direct links
- WhatsApp: `https://wa.me/{WHATSAPP_NUMBER}?text={localized prefill}`
- Email: `mailto:{CONTACT_EMAIL}`

### Config
Public contact info in `lib/site.ts` (email, WhatsApp, GitHub). Secrets via env:
`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. If `RESEND_API_KEY` is missing, the route returns `500 send_failed` and the UI falls back to direct links (lets the site ship before Resend is set up).

## 7. Tech stack & structure

- Next.js 15 (App Router), TypeScript strict, Tailwind CSS v4, ESLint
- `three`, `@react-three/fiber`, `@react-three/drei`
- `next-intl`, `@next/mdx` (or `next-mdx-remote`) + `gray-matter`
- `zod`, `resend`
- Tests: **Vitest** (unit), **Playwright** (e2e)
- Package manager: npm

```
portfolio/
  app/
    [locale]/
      layout.tsx
      page.tsx
      projects/[slug]/page.tsx
      not-found.tsx
    api/contact/route.ts
    sitemap.ts
    robots.ts
  components/
    sections/ (Hero, Services, Projects, About, Contact)
    ui/ (Button, Badge, LocaleToggle, Header, Footer)
    three/ (Scene, Mascot, TriangleField, Ps1Effect, WebGLGate)
  content/projects/*.mdx
  lib/ (site.ts, projects.ts, contact-schema.ts, rate-limit.ts)
  messages/ (en.json, es.json)
  i18n/ (routing.ts, request.ts)
  middleware.ts
  public/ (og images, mascot-fallback.png, project covers)
  tests/ (unit/, e2e/)
  docs/specs/
```

## 8. Repo & deployment
- Local: `~/Documents/portfolio`, git `main` branch; GitHub repo `john-casildo/portfolio` (public).
- Vercel project linked to the repo: `main` → production, PRs → preview deployments.
- Env vars set in Vercel (Production + Preview). Domain: `*.vercel.app` initially; custom domain optional later.
- No changes to the `PresenciaApp` repo.

## 9. Testing & quality gates
- **Unit (Vitest):** contact zod schema; rate limiter; i18n key parity; project loader (every slug has both locales, required frontmatter present).
- **E2E (Playwright, Chromium + mobile viewport):**
  - `/en` and `/es` render hero name, all 5 sections, correct `lang`.
  - `/` redirects by Accept-Language.
  - Locale toggle preserves current page.
  - Contact form: client validation errors; success path with `/api/contact` mocked; failure path shows direct links.
  - Reduced-motion emulation: page renders, no console errors.
  - Project case study pages load for each slug in both locales.
- `npm run build`, `lint`, `typecheck` clean (zero warnings).
- Lighthouse mobile ≥ 90 on `/en` and `/es` (checked against Vercel preview).
- Accessibility: keyboard navigable, visible focus rings, canvas is `aria-hidden`, all images have alt text.

## 10. Content placeholders (to be supplied by John)
| Item | Placeholder until provided |
|---|---|
| Contact email | `hello@example.com` |
| WhatsApp number | `0000000000` (button hidden if placeholder) |
| Bio (EN/ES) | Draft written by Claude, John edits |
| Project screenshots | Presencia: from existing landing/app assets; others: generated title cards |
| Resend account / key | Unset → form falls back to direct links |
| Custom domain | None (`.vercel.app`) |
