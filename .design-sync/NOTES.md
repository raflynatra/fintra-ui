# fintra-ui design-sync notes

## Repo shape

- Next.js 16 app, not a published component library — no `dist/`, no `main`/`module`/`exports` build. The converter runs in **synth-entry mode** (`--entry ./src/index.ts`, a path that intentionally doesn't exist — it only serves to make `PKG_DIR` walk up to the repo root's `package.json`).
- `srcDir` is deliberately scoped to `src/components/ui` only — NOT `src/components` or `src/`. The synth entry bundles every `.tsx`/`.jsx` file under `srcDir` regardless of `componentSrcMap` exclusions, so a broader `srcDir` would still pull in and execute code that can't run standalone (see below).
- No Storybook in this repo.

## Excluded: dashboard nav shell (Header, Sidebar, BottomNav)

`src/components/dashboard/layout/*` (`Header`, `Sidebar`, `BottomNav`) all import `next/link` and/or `next/navigation` (`useRouter`/`usePathname`), which require a live Next.js App Router context. Outside the real app they don't just render blank — `next/link`'s module-level code throws `ReferenceError: process is not defined` in the browser bundle, which crashes the **entire** IIFE before any component gets assigned to `window.FintraUI` (all-or-nothing, since it's one bundle). Confirmed by re-scoping `srcDir` to `src/components/ui` only — bundle size dropped from 566KB to 183KB and the crash disappeared.

User decision (2026-07-14): exclude these from the sync rather than stub `next/link`/`next/navigation`. If a future sync wants to include them, the stub approach is: author preview-only replacements for `next/link` (a plain `<a>`) and `usePathname`/`useRouter` (static return values), wired via a story-imports override — not attempted here.

`AuthProvider` and `QueryProvider` (`src/components/providers/`) are outside `srcDir` for the same underlying reason (not visual components, not meant to run standalone) — no exclusion needed once `srcDir` was narrowed.

## CSS: Tailwind v4 requires a compiled stylesheet, not the source globals.css

`src/app/globals.css` uses Tailwind v4 build-time `@import "tailwindcss"`/`"tw-animate-css"`/`"shadcn/tailwind.css"` — these are resolved by `@tailwindcss/postcss` at build time, not real files the converter's static `@import` resolution can follow. Pointing `cssEntry` at the source file fails with `[CSS_IMPORT_MISSING]`.

**Fix**: run `npm run build`, then use the compiled CSS chunk from `.next/static/chunks/*.css` (the one containing `:root{--card:...}` and `.bg-primary{...}` — filename is content-hashed, changes every build). It was copied, preserving its `../media/*.woff2` relative font references, to:

```
.design-sync/.cache/compiled-css/chunks/globals.css
.design-sync/.cache/compiled-css/media/*.woff2
```

`cfg.cssEntry` points at the `chunks/globals.css` copy. **This copy is gitignored (`.design-sync/.cache/`) and must be regenerated before every re-sync**: `npm run build`, find the new hashed chunk (`find .next/static/chunks -iname "*.css"` — pick the one with `:root{--card` and `.bg-primary{`), re-copy it and the referenced `.next/static/media/*.woff2` files into the same mirrored path, preserving the `chunks/` + `media/` sibling layout so the CSS's `url(../media/...)` references keep resolving.

### Font variable bug in the compiled chunk

The compiled chunk defines `--font-sans: var(--font-sans)` (self-referential — never resolves) because the actual value is injected by `next/font`'s generated `.variable` CSS class on `<html>` in `layout.tsx`, which isn't part of `globals.css` and wasn't present in the production CSS chunk we pulled from. Real values (from `layout.tsx`: `Geist({ variable: "--font-sans" })`, `Geist_Mono({ variable: "--font-mono" })`), read from the dev-mode font module CSS chunks under `.next/dev/static/chunks/[next]_internal_font_google_geist*.css`:

```css
:root{--font-sans:"Geist","Geist Fallback";--font-mono:"Geist Mono","Geist Mono Fallback";}
```

This is appended to the end of the copied `chunks/globals.css` after every re-copy (later rule wins in the cascade — don't insert it before the earlier self-referential `:root` block). Without this, every preview renders in the browser's fallback serif font instead of Geist. **Re-sync risk**: if `next/font`'s generated class name or variable names ever change, or the app switches font providers, this override goes stale silently (previews would revert to fallback font with no error) — re-verify by checking a rendered preview's title text uses Geist, not serif, after any font-related change to `layout.tsx`.

## Authored previews

- `CardFooter` — the only non-floor-card authoring done this run. `card.tsx`'s `CardFooter` is a bare flex `<div>` with no default visible content, so the floor card's crash-prevention props rendered blank (`[RENDER_BLANK]`, flagged `bad`, not just a floor-card placeholder). Authored `.design-sync/previews/CardFooter.tsx` as a full `Card` composition (header + content + footer with two buttons) instead — graded `good`.
- All other 12 components ship as floor cards by user choice (2026-07-14) — fully functional/importable, just not yet given an authored example. Can be authored incrementally on any future re-sync.

## Re-sync risks

- The compiled-CSS + font-variable workaround above is entirely manual and NOT re-derived automatically — a re-sync that skips the "regenerate `.design-sync/.cache/compiled-css/`" step will validate against a **stale** CSS snapshot (old token values, old fonts) even though `next build` output has moved on. Always rebuild the app and re-copy before re-running the converter.
- If `src/app/globals.css`'s `@theme`/`:root` token names change, the conventions header's token table (`.design-sync/conventions.md`) needs re-validation — re-grep the new compiled CSS for each documented `--token-name`.
- If dashboard nav components are ever wanted in a future sync, they need real stub work (see the exclusion note above) — this was not attempted, not just deferred by omission.
