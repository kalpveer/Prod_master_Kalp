# Productica Website Theme

Design system reference for the Productica marketing site (`productica.in`).  
Visual identity: **stark monochrome**, high contrast, editorial tech — black/white surfaces, tight display type, glass borders, and restrained motion.

---

## 1. Brand direction

| Attribute | Value |
|-----------|--------|
| Mood | Precise, founder-facing, high-signal |
| Palette | Pure black + white with opacity steps (no brand purple / cream / terracotta) |
| Contrast | Maximum — invert selection colors between light and dark surfaces |
| Density | Generous whitespace; one job per section |
| Motion | Presence and hierarchy (blur-up, fade, soft springs) — not decorative noise |

**Theme color (PWA / browser chrome):** `#000000`

---

## 2. Color system

### Core

| Token | Value | Usage |
|-------|--------|--------|
| Black | `#000000` / `bg-black` / `text-black` | Primary canvas (dark pages), primary CTA fill (light pages), body text (light pages) |
| White | `#ffffff` / `bg-white` / `text-white` | Primary canvas (homepage shell), primary CTA fill (dark pages), body text (dark pages) |

### Opacity scales (preferred over gray hex)

Use black/white with alpha instead of named gray ramps wherever possible.

**On dark (`bg-black`):**

| Class pattern | Approx. role |
|---------------|--------------|
| `text-white` | Primary copy |
| `text-white/80`–`text-white/70` | Strong secondary |
| `text-white/50`–`text-white/40` | Supporting / body muted |
| `text-white/30`–`text-white/20` | Eyebrows, meta, disabled |
| `border-white/10`–`border-white/15` | Default hairline |
| `border-white/25`–`border-white/40` | Hover / selected |
| `bg-white/[0.03]`–`bg-white/[0.08]` | Glass panels |
| `bg-white/10`–`bg-white/15` | Selected / elevated chips |

**On light (`bg-white`):**

| Class pattern | Approx. role |
|---------------|--------------|
| `text-black` | Primary copy |
| `text-black/60` | Secondary body |
| `text-black/40` | Labels, mono eyebrows |
| `border-black/10` | Default input / divider |
| `bg-black/5`–`bg-black/10` | Subtle fills, progress tracks |

### Semantic (rare)

| Token | Value | Usage |
|-------|--------|--------|
| Error | `text-red-500` | Form validation only |
| Success accent | `text-emerald-400` | Occasional status (e.g. destination step) |

### Selection

- Light pages: `selection:bg-black selection:text-white`
- Dark pages: `selection:bg-white selection:text-black`

### Surface modes

1. **Light shell** — Homepage root: `bg-white text-black`
2. **Dark immersion** — Pricing, About, Events, Blogs, Terms, Coming Soon, Audience: `bg-black text-white` (sometimes `bg-[#050505]`)
3. **Section flip** — Homepage mixes black full-bleed sections (Hero, typography moments) with white editorial sections

---

## 3. Typography

### Fonts

Loaded via Google Fonts:

```
Inter     — 300, 400, 500, 600, 700, 800   (primary UI / body / display)
Outfit    — 300, 400, 500, 600, 700       (secondary / accent pairing)
```

Stack: `font-sans` → Inter-first system sans.  
Mono: Tailwind `font-mono` for labels, tracking codes, legal microcopy, footer meta.

> Note: `.font-light` is globally remapped to **weight 400** for legibility (`src/index.css`).

### Hierarchy

| Level | Typical classes | Notes |
|-------|-----------------|-------|
| Hero / display | `text-5xl` → `text-6xl` / `md:text-8xl` / up to `text-[10rem]` | `tracking-tighter`, tight `leading-[0.95]`–`leading-[1.05]` |
| Section H2 | `text-3xl md:text-4xl` or `text-4xl md:text-5xl lg:text-6xl` | Often `font-light` + one `font-semibold` span |
| Card / block title | `text-base`–`text-xl` + `font-semibold` | `tracking-tight` / `leading-snug` |
| Body | `text-sm`–`text-lg` | Muted opacity (`/50`–`/60`) |
| Eyebrow / label | `text-[10px]`–`text-xs` + `font-mono` + `uppercase` | `tracking-widest` or `tracking-[0.16em]`–`tracking-[0.3em]` |

### Patterns

- **Split weight headlines:** light base + `font-semibold` on the key phrase  
  e.g. `Unlock only` + **`what you need.`**
- **Italic accents:** occasional `italic` + reduced opacity for connective words (`what`, `real.`)
- **Uppercase mono labels:** Contact tags, footer address labels, step badges

---

## 4. Layout & spacing

| Token | Practice |
|-------|----------|
| Page max width | `max-w-6xl` / `max-w-7xl` + `mx-auto` |
| Horizontal padding | `px-6 md:px-12` |
| Section gaps | Large vertical rhythm (`gap-24`–`gap-28`, `py-12`+) |
| Grid | Prefer `grid` with `sm:` / `lg:` breakpoints; sticky side summary `top-28` |
| Scroll margin | In-page anchors: `scroll-mt-28` |

One composition per viewport on heroes: brand + one headline + short support + CTA — avoid packing stats/cards into the first screen.

---

## 5. Surfaces, borders & glass

### Dark glass panel (Pricing / agents / CTAs)

```
rounded-2xl | rounded-3xl
border border-white/10 | border-white/15
bg-white/[0.03] | bg-white/[0.04] | bg-white/[0.05]
backdrop-blur-xl | backdrop-blur-2xl
```

### Selected / active

```
border-white/40
bg-white/10
shadow-[0_0_0_1px_rgba(255,255,255,0.12)]
```

### Soft glow (primary CTA only, sparingly)

```
shadow-[0_0_20px_rgba(255,255,255,0.2)]
hover:shadow-[0_0_30px_rgba(255,255,255,0.45)]
```

### Radii

| Element | Radius |
|---------|--------|
| Pills / primary buttons | `rounded-full` |
| Cards / panels | `rounded-xl` → `rounded-2xl` → `rounded-3xl` |
| Chips / badges | `rounded-md` / `rounded-lg` |
| Icon wells | `rounded-lg` / `rounded-xl` / `rounded-2xl` |

Avoid defaulting to multi-layer drop shadows or heavy glow stacks.

---

## 6. Components

### Primary CTA (dark surface)

```
bg-white text-black
text-sm font-semibold
rounded-full | rounded-xl
px-8 py-3.5  (or px-5 py-3 in cards)
hover:bg-white/90
active:scale-[0.97] | active:scale-[0.98]
```

### Primary CTA (light surface)

```
bg-black text-white
rounded-full
hover:bg-black/80
```

### Secondary / ghost

```
border border-white/15 text-white/60
hover:text-white hover:border-white/30
```

### Text fields (Contact / Idea Flow)

- Underline style: `border-0 border-b border-white/30` (dark) or `border-black/10` (light)
- Floating mono labels
- Focus: stronger border opacity, no heavy ring chrome unless `focus-visible:ring-2 focus-visible:ring-white/40`

### Chips / badges

```
text-[10px]|text-[11px] px-2 py-0.5
rounded-md bg-white/6|bg-white/8
border border-white/10 text-white/40|text-white/60
```

### Icons

- Library: **lucide-react**
- Sizes: typically `w-3.5 h-3.5` → `w-5 h-5`
- Sit in low-contrast wells (`bg-white/8 border border-white/10`)

---

## 7. Motion

### Easing

Common cubic-beziers:

- `[0.16, 1, 0.3, 1]` — Hero / page entrance
- `[0.22, 1, 0.36, 1]` — Cards, platform crossfades

### Patterns

| Pattern | Spec |
|---------|------|
| Blur-up | opacity 0 → 1, `blur(14px)` → 0, slight `y` |
| Fade / slide | `opacity` + `y: 16–24` |
| Scale press | `active:scale-[0.97]` / `whileTap={{ scale: 0.97 }}` |
| Magnetic CTA | Spring on navbar primary link (`damping: 15`, `stiffness: 150`) |
| Layout | Framer `layout` / `layoutId` for tab pills |
| Scroll | Lenis smooth scroll; native scrollbar hidden |

Libraries: **Framer Motion**, **GSAP + ScrollTrigger**, **Lenis**.

Respect `prefers-reduced-motion` where GSAP matchMedia is used (e.g. Contact).

---

## 8. Page recipes

### Homepage

- Root: light (`bg-white`)
- Hero & signature type moments: full-bleed black
- Mixed product storytelling sections; shared `Footer` with dual addresses

### Dark product pages (Pricing, About, Events, …)

```
min-h-screen bg-black text-white
selection:bg-white selection:text-black
font-sans
```

Pricing specifically: glass calculator cards, sticky summary, mono credit badges, white pill CTAs.

### Preloader / Coming Soon

Full black immersion, Inter display numerals, minimal chrome.

---

## 9. Accessibility & UX defaults

- Prefer `focus-visible:ring-2` over always-on outlines
- Keep body `antialiased`
- Hide scrollbars globally; keep content scrollable
- GPU hints on animated split words: `will-change: transform, opacity` + `translateZ(0)`
- `overflow-x-clip` on root shells to prevent horizontal bleed from motion

---

## 10. Do / Don’t

**Do**

- Stay monochrome; communicate hierarchy with opacity and weight
- Use tight tracking on large headlines
- Prefer glass + hairline borders on dark UIs
- Keep CTAs high-contrast pills (white↔black invert)

**Don’t**

- Introduce purple-to-indigo gradients, warm cream canvases, or terracotta accents
- Rely on flat colored cards as the default container
- Overload the first viewport with stats, chips, or promo stickers
- Add multi-layer neon glows except for intentional primary CTA emphasis

---

## 11. File map

| Concern | Location |
|---------|----------|
| Global base / Lenis / font-light override | `src/index.css` |
| Tailwind entry | `tailwind.config.js` (minimal extend; utilities used inline) |
| Fonts + theme-color | `index.html` |
| Addresses (footer / contact) | `src/data/addresses.ts` |
| Dark pricing surfaces | `src/pages/PricingPage.tsx` |
| Hero motion language | `src/components/Hero.tsx` |
| Navbar / magnetic CTA | `src/components/Navbar.tsx` |

---

## 12. Quick copy-paste tokens

```txt
Canvas dark:     bg-black text-white
Canvas light:    bg-white text-black
Glass panel:     rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl
Eyebrow:         text-[10px] font-mono uppercase tracking-widest text-white/40
Display:         font-light tracking-tighter + font-semibold accent span
CTA dark UI:     bg-white text-black rounded-full font-semibold
CTA light UI:    bg-black text-white rounded-full font-semibold
Hairline:        border-white/10  |  border-black/10
Ease entrance:   cubic-bezier(0.16, 1, 0.3, 1)
```

---

*Derived from the live Productica web codebase. Update this doc when palette, fonts, or CTA patterns change.*
