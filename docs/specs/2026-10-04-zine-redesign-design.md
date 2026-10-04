# Zine Redesign: Design Spec

**Date:** 2026-10-04
**Supersedes:** sections 2 (visual identity) and 4 (motion and 3D) of `2026-10-04-portfolio-design.md`. All other sections still apply: content, routes, i18n, contact, testing, and deployment.
**Status:** Approved in chat. Owner confirmed the character choice after the IP risk was explained.

## 1. Goal

Replace the warm PS1/triangle-quilt look with a chaotic red-and-black street zine (Stüssy throw-up page plus marker-poster references) and a cel-shaded 3D fan-art Miles hanging upside down from a web. Speed (Lighthouse mobile ≥ 90), accessibility, and the phone layout must not get worse.

## 2. Removed

- The triangle quilt: `TriangleField`, `BackgroundCanvas`, `Background`, `lib/quilt.ts`, `lib/palette.ts`, the `.triangle-fallback` CSS, and the section-change re-pattern wiring. `section-store` and `SectionObserver` stay for the reveal animation and the active section.
- The PS1 mascot: `buildMascot`, `ps1.ts`, `Mascot`, `MascotCanvas`, and the low-res pixelation. `public/mascot-fallback.png` is replaced.
- The Rubik Wet Paint and Sedgwick Ave fonts.

## 3. Visual system

| Token | Value | Use |
|---|---|---|
| `paper` | `#F2EFE8` | Page background, with an SVG fractal-noise grain overlay at ~6% opacity |
| `ink` | `#0B0B0B` | Text, outlines, doodles |
| `red` | `#E10600` | Primary accent: name, stamps, CTAs, highlights |
| `blood` | `#8F0000` | Shading on red, hover |

Contrast rules:
- `ink` on `paper` is fine for any text.
- `red` on `paper` (≈ 4.6:1) is allowed for headings and large text only (≥ 24px, or bold ≥ 18.7px). Never body text.
- Text on red buttons is `paper` (≈ 4.9:1) or `ink`.

Fonts (`next/font/google`):

| Role | Font |
|---|---|
| Headlines, name | **Knewave**: red fill with a black offset `text-shadow` (4px 4px 0 ink) |
| Annotations, sticker labels, tags, ticker | **Permanent Marker** |
| Body, UI, forms | **Space Grotesk** |

## 4. Chaos layer (`components/zine/`)

- **`Doodle`:** an inline SVG doodle set: `arrow`, `arrow-curve`, `circle-scribble`, `star`, `x`, `spiral`, `crown`, `zigzag`, `underline`. Hand-drawn paths in ink or red with round caps.
  - Props: `{kind, className?, color?: 'ink' | 'red'}`.
  - Always `aria-hidden`, `pointer-events: none`.
- **`NumberSticker`:** a small circled number (1–9) like the Stüssy corners.
- **`Ticker`:** a full-width marquee strip of repeated localized tag text with ✱ separators. Shown at the top (under the header) and above the footer.
  - CSS animation.
  - Pauses on hover.
  - Static under reduced motion.
  - `aria-hidden` (decorative).
- **`Tape`:** a translucent tape strip that sits on cards.
- **`SpiderStamp`:** the spider emblem as an inline SVG (circle plus spider), drawn from scratch with a rough spray edge via an SVG turbulence displacement filter. Used large and low-opacity (red at 18%) behind the hero, and small as the logo mark in the header next to "JC".
- **Halftone:** a CSS `radial-gradient` dot utility class used on patches behind cards.

Layout rules:
- Doodles are absolutely positioned within each section's `relative` box and never overlap body text or controls.
- On < 640px, only 1–2 doodles per section, scaled to 60%.
- Cards (services, projects) are rotated alternately ±1.5° and straighten on hover/focus (except under reduced motion), with a 3px ink border, a hard 6px ink shadow, and tape on top.
- The page must never scroll horizontally at 375px. `overflow-x: clip` stays as a safety net, not a crutch: no element may extend past the viewport.

## 5. Hero

- **Left:** a Permanent Marker annotation ("builds the web" / "construye la web") with a curved arrow, then the name in Knewave (red, black offset shadow, two lines), the value prop, and CTAs as sticker buttons. Primary is red with paper text; secondary is paper with an ink border.
- **Right (desktop) / below (phone):** the hanging hero character in a ~70svh (desktop) / 55svh (phone) stage, with `SpiderStamp` large behind it and the web line reaching the top edge of the stage.
- A `NumberSticker` and two doodles sit around the hero.

## 6. Character: cel-shaded hanging hero (`components/hero3d/`)

### Model (`buildHero.ts`, a pure function returning a `THREE.Group`)

- **Built from:**
  - Primitives (capsules/cylinders/spheres/boxes) arranged in a joint hierarchy: `root` (at the web attach point, the feet) → `legs` → `hips` → `torso` → `head`, `armL`, `armR`.
  - Upper and lower segments for the limbs.
- **Proportions:** a slim teen athlete, about 7.5 heads tall.
- **Pose:** upside down, hanging with the ankles together at the attach point. Legs straight up (toward the web), knees slightly bent, torso hanging down, arms dangling below the head, slightly apart, with one hand loosely open.
- **Colors:**
  - Suit `#111114`, with a red web-line pattern in the shader (`#E10600`).
  - Soles and glove backs red.
  - Mask eyes are white flat shapes with thick black rims, comic style, angled.
  - A red spider emblem on the chest, as a flat extruded shape.
- **Size:** 1,500–4,000 triangles. Not PS1: smooth enough for cel shading.
- Every named joint is a `THREE.Group`: `root`, `hips`, `torso`, `head`, `armL`, `armR`, `legL`, `legR`.

### Material (`toonMaterial.ts`)

A custom `ShaderMaterial` with uniforms `uColor`, `uLineColor`, `uLightDir`, and `uWebLines` (bool).
- **Shading:** `ndl` is quantized into 3 bands (lit / mid / shadow).
- **Halftone:** in the mid and shadow bands, a screen-space dot pattern (`gl_FragCoord`, 6px cell) mixes toward `ink`.
- **Web lines:** when `uWebLines` is on, a red line pattern is drawn from object-space position (radial + ring lines) to read as a web suit.
- **Outlines:** an inverted-hull back-face mesh in ink at about 1.04–1.06 scale for every body part (thick comic outlines).

### Web line

A white `TubeGeometry` (radius ~0.02) from the attach point up past the top of the stage. It is redrawn each frame so it stays connected while the body swings, because the top end is fixed in world space.

### Motion (`hero-motion.ts`, pure, unit-tested)

- **Pendulum sway:** angle `θ(t) = A·sin(2πt/T)·damping`, with A ≈ 6°, T ≈ 3.2s.
- **Slow twist:** around the vertical axis, ±20°, T ≈ 7s.
- **Head look:** the head tracks the cursor, clamped to ±25° yaw and ±12° pitch, with the sign flipped because the body is upside down. On phones, device orientation is used if available, otherwise an idle sway.
- **Drop-in:** when the 3D first mounts, the root starts 1.2 units above and springs down to rest with one or two bounces over ~900ms (critically under-damped spring, pure function `dropOffset(t)`).
- **Reduced motion:** no animation loop. A single still frame in the rest pose.

### Rendering

- Full resolution, `dpr` capped at 1.75, antialias on, transparent background, `flat` (no tone mapping).
- `frameloop="always"` while the stage is visible and motion is allowed; `"demand"` otherwise (IntersectionObserver).
- Same deferral as now: the 3D mounts on first interaction behind `WebGLGate` (WebGL2 probe and error boundary). Before that, and as the no-WebGL fallback, the page shows `public/hero-fallback.png`, captured from the rest pose with a transparent background.
- The canvas wrapper has `role="img"` and a localized `aria-label` that describes the image without naming the character. EN: "Masked hero in a black and red suit hanging upside down from a web". ES: "Héroe enmascarado con traje negro y rojo colgando de cabeza de una telaraña".

## 7. Sections restyle

- **Services:** three tilted sticker cards with tape and hand-drawn icons (redrawn in ink and red).
- **Projects:** featured project as a big tilted poster card; the others smaller. Covers regenerated in red/black zine style (SVG): paper, halftone, spray stamp, title in a marker-like font stack.
- **About:** a torn-paper-edge panel (CSS clip-path zigzag), stack badges as ink-outlined stickers.
- **Contact:** a form on a taped "notebook" card; inputs with a 2px ink border on paper; errors in red, bold, ≥ 18.7px (large-text contrast) or ink with a red underline.
- **404:** "GAME OVER" in Knewave red with a doodle arrow back home.
- **OG image:** red/black redesign: paper background, red name, black offset.

## 8. Safeguards (fan art)

- No "Spider-Man", "Miles", "Morales", "Marvel", or "Sony" in titles, metadata, alt text, or headings.
- Footer line, as a new message key `Footer.fanArt`:
  - EN: "Fan art. Not affiliated with Marvel or Sony."
  - ES: "Fan art. Sin afiliación con Marvel o Sony."

  This is the only mention.
- No official images or logos are used. The emblem is drawn from scratch.
- The character is one component (`HeroCharacter`) behind the existing `{reducedMotion}` contract, so it can be swapped by changing one file.

## 9. Testing

- **Unit:**
  - `hero-motion` (sway bounds, twist bounds, head clamp and sign flip, drop-in starts high and settles to 0 within 1.2s with at least one overshoot).
  - `buildHero` (triangle budget 1,500–4,000 excluding outlines, required joints exist, the head is below the hips in world space, i.e. upside down).
  - `toonMaterial` (the uniforms exist and the shader compiles as strings with the halftone and band code present).
- **E2E:** the existing suites are updated for the new markup. New tests:
  - The ticker is `aria-hidden` and static under reduced motion.
  - The fan-art footer line appears in both locales.
  - No element is wider than the viewport at 375px (checks every element's bounding box, not just `scrollWidth`).
  - Titles and metadata don't contain the excluded names.
- **Lighthouse mobile:** ≥ 90 on all four categories for `/en` and `/es`.
