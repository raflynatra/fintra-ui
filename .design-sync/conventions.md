# fintra-ui conventions

## Setup

No provider wrapper is required — components read design tokens from CSS custom properties on `:root` (and `.dark`), not from React context. Nothing needs to be "mounted" before use.

**Dark mode**: add the literal class `dark` to any ancestor element (e.g. `<body class="dark">` or a wrapping `<div class="dark">`) to switch the whole subtree to dark-mode token values. There is no toggle prop — it's purely CSS-variable driven via Tailwind's `@custom-variant dark (&:is(.dark *))`.

## Styling idiom: Tailwind v4 utility classes + semantic tokens

Style everything with Tailwind utility classes, not inline styles or new CSS. The utilities read from a fixed set of semantic color tokens (CSS vars) rather than raw Tailwind palette colors (`bg-primary`, not `bg-emerald-600`):

| Token family | Utility examples | Use for |
|---|---|---|
| `background` / `foreground` | `bg-background`, `text-foreground` | page/app background and default text |
| `card` / `card-foreground` | `bg-card`, `text-card-foreground` | card surfaces |
| `primary` / `primary-foreground` | `bg-primary`, `text-primary-foreground` | brand actions (primary buttons) |
| `secondary` / `secondary-foreground` | `bg-secondary`, `text-secondary-foreground` | secondary emphasis |
| `muted` / `muted-foreground` | `bg-muted`, `text-muted-foreground` | de-emphasized text/surfaces |
| `accent` / `accent-foreground` | `bg-accent`, `text-accent-foreground` | hover/active highlight |
| `destructive` | `bg-destructive/10`, `text-destructive` | errors, destructive actions |
| `border` / `input` / `ring` | `border-border`, `focus-visible:ring-ring/50` | borders, form field outlines, focus rings |
| `radius` | `rounded-lg`, `rounded-[min(var(--radius-md),Npx)]` | corner radius (base `--radius: .625rem`) |

Spacing, sizing, and typography use plain Tailwind scale utilities (`px-2.5`, `h-8`, `text-sm`, `gap-1.5`) — nothing custom there. Class composition goes through `cn()` (`clsx` + `tailwind-merge`), so later classes win over earlier conflicting ones — safe to pass a `className` override prop on every component.

Variant-based components (`Button`) are built with `class-variance-authority` (`cva`) — e.g. `Button`'s `variant` prop is one of `default | outline | secondary | ghost | destructive | link`, `size` is one of `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`. Follow that enum pattern (`variant`/`size` props, not ad-hoc className toggles) for any new variant-driven component.

## Where the truth lives

- Token definitions (`:root` and `.dark`): `styles.css` → `_ds_bundle.css` in this bundle (originally `src/app/globals.css`, compiled through Tailwind v4/PostCSS).
- Per-component API: `components/<group>/<Name>/<Name>.d.ts` and `<Name>.prompt.md`.
- `Slot`-based `asChild` pattern (`Button`, and any Radix-wrapped component): passing `asChild` renders the component's styles onto its single child element instead of a wrapping tag — useful for turning a `Button` into a styled `<Link>` or `<a>`.

## Example

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "fintra-ui";
import { Button } from "fintra-ui";

<Card className="w-80">
  <CardHeader>
    <CardTitle>Upgrade plan</CardTitle>
    <CardDescription>Unlock higher transaction limits.</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground text-sm">Renews August 1, 2026.</p>
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Upgrade</Button>
  </CardFooter>
</Card>
```
