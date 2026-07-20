@AGENTS.md

# Fintra UI

A mobile-first personal finance web app (Next.js App Router, React 19).

## Mobile-first

This repo is **mobile-first**. Design and build UI for small viewports first (touch targets, bottom nav, safe-area insets, `dvh` units), then progressively enhance for desktop/tablet. Avoid layouts or interactions that only work well on wide screens. Navigation is a bottom tab bar on mobile (`src/components/dashboard/layout/bottom-nav.tsx`) with a desktop-only sidebar (`.../sidebar.tsx`).

## Stack

- Next.js 16 (App Router) + React 19, TypeScript strict mode
- Tailwind CSS v4 (`@tailwindcss/postcss`), shadcn/radix-ui primitives in `src/components/ui`
- TanStack Query for server state, Zustand for client state
- react-hook-form + Zod for forms/validation
- Vitest + Testing Library (jsdom) for tests
- ESLint (`eslint-config-next`) + Prettier (with `prettier-plugin-tailwindcss`)

## Structure

- `src/app` — routes (App Router). Route groups: `(auth)` for `/login`, `(dashboard)` for the protected app shell.
- `src/features/<name>` — feature modules (e.g. `auth`, `transactions`): `components/`, `hooks/`, `store.ts`, `schema.ts` (Zod), `types.ts`, `constants.ts`.
- `src/components/ui` — shadcn/radix UI primitives.
- `src/components/dashboard` — dashboard shell (sidebar, header, bottom nav).
- `src/components/providers` — app-wide providers (auth, TanStack Query).
- `src/lib` — `api-client.ts`, `env.ts`, `server/` (server-only helpers), `constants/`.
- `src/proxy.ts` — edge middleware; use in place of Next's conventional `middleware.ts` in this Next.js version.
- `src/types` — shared API types.

## Auth model

- Short-lived access token kept in memory (Zustand `useAuthStore`, not persisted) + long-lived `refresh_token` httpOnly cookie.
- `src/proxy.ts` runs on protected/auth routes: redirects based on the presence of `refresh_token`, refreshes the access token server-side, and forwards it via the `x-access-token` header.
- `src/lib/api-client.ts` attaches the bearer token, and on a 401 attempts one silent refresh-and-retry before signing out. It distinguishes an _invalid/expired session_ (sign out, redirect to `/login`) from a _backend-unreachable_ error (keep the session, surface a toast) — don't collapse that distinction when touching auth/fetch code.

## Baseline feature: `transactions`

`src/features/transactions` is the reference implementation. When adding or
changing a feature, mirror its structure, layering, and conventions.

**File layout** (one concern per file):

- `types.ts` — all interfaces/types for the feature. Derive form value types from
  the Zod schema (`z.infer<typeof …>`), don't hand-write them twice. Model
  on-the-wire request bodies as discriminated unions when the backend uses `oneOf`.
- `schema.ts` — Zod. Keep **one flat `z.object` field set** for react-hook-form
  (not `z.discriminatedUnion` — a union breaks RHF field paths and `.partial()`).
  Put conditional/cross-field rules in `.superRefine`. Mirror backend validation
  client-side so common errors don't round-trip.
- `constants.ts` — lookup maps keyed by the feature's union type
  (`Record<TransactionType, string>`), not scattered conditionals.
- `store.ts` — Zustand (`create()(devtools(…, { name }))`) for **client/UI state
  only** (filters, which row is being edited). Never cache server data here.
- `hooks/` — **one hook per file, one operation.** Queries use TanStack Query
  (`use-transactions.ts`), mutations return `useMutation` and invalidate every
  affected query key in `onSuccess` (e.g. a transaction mutation invalidates both
  `["transactions"]` and `["accounts"]`).
- `utils.ts` — pure helpers, unit-tested. The form→wire transform
  (`toWritePayload`) lives here and is called **inside** the mutation hook, so no
  call site can forget it and post a stale field.
- `components/` — presentational + container components; `index.ts` barrel exports
  the feature's **deliberate public surface** (omit internal-only components).

**Layering rules:**

- Server state → TanStack Query hooks. Client state → Zustand store. Don't mix.
- Forms: react-hook-form + `zodResolver`, one flat field set; narrow to the
  arm-specific wire shape at the mutation boundary, never in the form.
- Side effects that belong to a call site (toasts, closing a sheet) live in the
  component, not the hook. Hooks stay reusable and effect-free beyond cache
  invalidation.
- Only add comments as a docummentation (JSDoc only).
- Colocate tests: `schema.test.ts`, `store.test.ts`, `utils.test.ts`.

## Conventions

- Path alias `@/*` → `src/*`.
- Server-only env vars go through `src/lib/env.ts` (Zod-validated, throws at import time if missing — never import it from a Client Component). Client-safe values go in `src/lib/constants`.
- Tests live next to source as `*.test.ts(x)`; run with `npm run test` (or `npm run test:watch`).
- Lint with `npm run lint`.
- Use Server Components by default, add 'use client' only when needed
- Prefer named exports for components
- Use TypeScript strict mode
- Use next/image for optimized images
- Use next/link for client-side navigation

## Code Style

- Prefer async/await over .then() chains
- Use early returns for cleaner code
- Keep components small and focused

## Commits

- One-line messages only — no body.
- Conventional-commit style with an optional scope: `type(scope): summary`
  (e.g. `feat(transactions): add transfer type`, `refactor(api): centralize proxy handlers`).
  Omit the scope when it doesn't add clarity.
- **No `Co-Authored-By` trailer** and no other trailers.
