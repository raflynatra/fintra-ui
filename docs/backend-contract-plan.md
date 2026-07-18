# Fintra UI — Backend Contract Catch-Up

## Context

`fintra-ui` hand-writes its API types. The backend (`D:\Personal\Apps\fintra-api`) has moved ahead, and nothing enforces agreement, so the two drifted silently. Reading the updated `openapi.json` plus the backend source turned up one **broken** flow, one **silently wrong** flow, one **security gap**, and three whole domains the UI has no concept of.

What's actually wrong today:

1. **Transaction create is broken.** `POST /api/transactions` requires `accountId` in all three `oneOf` arms. `transactionSchema` (`src/features/transactions/schema.ts:3`) has no such field, and `src/app/api/transactions/route.ts:41` forwards the body verbatim. Every create should 400.
2. **The summary card lies.** `useTransactionSummary` sends the full filter set, but `TransactionRepository.getSummary(userId)` (`transaction.repository.ts:241`) accepts *only* a userId. The card shows all-time totals while appearing to respect filters. Pre-existing; unrelated to the drift.
3. **`/transactions` is unprotected.** `PROTECTED_ROUTES = ["/dashboard"]` (`src/proxy.ts:7`), but `(dashboard)` is a route *group* and adds no URL segment, so the real path is `/transactions`. It only works because the api-client's 401 refresh-and-retry papers over the missing `x-access-token`.
4. **Missing domains:** Accounts, Budgets, Users; plus register, Google sign-in, password change, category create/delete.

Outcome: the UI matches the contract, transaction create works for new and existing users, and the drift is visible at compile time rather than at runtime.

### Decisions

- **Types stay hand-written.** No codegen. The spec's `ApiSuccess.data` is untyped (`"shape varies per endpoint"`), so the spec cannot describe responses anyway — **the backend's `*.types.ts` files are the authority**, not `openapi.json`. Mirror them by hand.
- **No `/dashboard` URL prefix.** Keep top-level routes and enumerate them in `PROTECTED_ROUTES`. The route group is deliberate, `NAV_ITEMS` hrefs are already top-level, and `bottom-nav.tsx` has an exact-match case that assumes it.
- **`DELETE /api/accounts/{id}` is an archive, not a delete.** `AccountService` is explicit: *"Deletion is an archive (is_archived = TRUE) — history is never lost."* The accounts page is create / edit / archive / restore. There is no hard delete.

### Backend rules the UI must encode

Verified in `src/error/custom-errors.ts` and `src/constants/error-codes.ts`:

| Code | Status | Meaning |
| --- | --- | --- |
| `TRANSFER_TYPE_IMMUTABLE` | 409 | A transaction can't be converted into or out of a transfer |
| `TRANSFER_SAME_ACCOUNT` | 422 | `accountId` must differ from `toAccountId` |
| `ACCOUNT_ARCHIVED` | 409 | Archived accounts reject new transactions |
| `ACCOUNT_ALREADY_EXISTS` | 409 | Name collision; the unique index covers **active rows only**, so un-archiving can collide too |
| `BUDGET_ALREADY_EXISTS` | 409 | One budget per category per period |
| `AUTH_PASSWORD_NOT_SET` | **400** | Google-only account has no password to change |

---

## Phase 0 — Contract foundation

**Goal:** land the envelope fix, the route-protection fix, and a shared handler helper *before* ~10 new route handlers get written against the old pattern. No user-visible change.

**Why first:** every later phase adds route handlers, and the existing five are ~90% identical boilerplate. Pay it down once rather than copying it ten more times.

**Added**
- `src/lib/constants/routes.ts` — `APP_ROUTES`, `PROTECTED_ROUTES`, `AUTH_ROUTES`. Must stay icon-free: `proxy.ts` runs in the middleware runtime and can't pull in lucide (which is why this can't live in `dashboard.ts`).
- `src/lib/server/proxy-json.ts` — `forwardJson(req, path, init?)`, encapsulating the four invariants every handler repeats: conditional `Authorization` spread, `searchParams` forwarding, 204 short-circuit, and `isApiError(result) ? result.error : result.data`.

**Modified**
- `src/types/api.ts` — `ApiError.error` gains `details?: unknown[]`. This is where the backend's Zod field errors arrive; Phases 1–2 map them onto form fields.
- `src/lib/api-client.ts` — `ApiClientError` gains `readonly details?: unknown[]`, populated from the parsed body.
- `src/proxy.ts` — import the route lists; **fixes the `/transactions` gap**.
- The 5 existing handlers under `src/app/api/**` — migrate to `forwardJson` so exactly one pattern exists. **Except** `auth/login` and `auth/refresh`, which need `applyRefreshTokenCookie` and stay bespoke.

**Verify:** signed out, `/transactions` redirects to `/login` (today it renders and 401-flails). Signed in, it still loads with the token reaching the layout. `npm test` green.

---

## Phase 1 — Accounts *(unbreaks create — blocking)*

**Goal:** ship accounts end-to-end and thread `accountId` through the transaction contract.

**Why a picker isn't enough:** `AuthService.register()` (`auth.service.ts:55`) inserts *only* a user, and the `'Cash'` seed in `09_create_accounts_table.sql` covers pre-existing users only. **A newly registered user has zero accounts** and therefore cannot create a transaction at all. Account *creation* must ship in the same phase as the picker — that's forced by the backend, not a preference.

**Added**
- `src/features/accounts/` — `types.ts`, `schema.ts`, `constants.ts`, `index.ts`, `hooks/{use-accounts,use-create-account,use-update-account,use-archive-account}.ts`, `components/{index,account-list,account-row,account-form,account-sheet,archive-account-dialog,account-empty}.tsx`. Modelled on `src/features/categories/` for structure and `src/features/transactions/hooks/use-create-transaction.ts` for the mutation shape.
- `src/app/api/accounts/route.ts` (GET, POST), `src/app/api/accounts/[id]/route.ts` (GET, PUT, DELETE→204) — via `forwardJson`; `params: Promise<{id}>` per Next 16.
- `src/app/(dashboard)/accounts/page.tsx`

Key shapes (mirroring `account.types.ts` — note **no `userId`**; `AccountResponse` doesn't expose it):

```ts
export type AccountType = "cash" | "bank" | "ewallet" | "credit_card";

export interface Account {
  id: string; name: string; type: AccountType;
  initialBalance: number;
  /** initial_balance + every movement in or out; derived server-side. */
  balance: number;
  isArchived: boolean; createdAt: string; updatedAt: string;
}
```

`useAccounts` sends `includeArchived` as the **string** `"true"`/`"false"` — the spec's enum is strings, not booleans.

**Modified**
- `src/features/transactions/types.ts` — `Transaction` gains `accountId`, `account`, `toAccountId`, `toAccount` (mirroring `TransactionResponse`); `TransactionListParams` gains `accountId?`.
- `src/features/transactions/schema.ts` — add `accountId: z.uuid("Pick an account")`.
- `src/features/transactions/components/transaction-form.tsx` — account `<Select>`; `emptyTransactionValues` becomes a **factory** (it currently freezes `date: todayISO()` at module load, so a long-lived tab defaults to a stale date).
- `src/features/transactions/components/edit-transaction-sheet.tsx:57` — add `accountId` (the second, easily-missed defaults site).
- `src/features/transactions/components/add-transaction-sheet.tsx` — pass memoized defaults.
- `src/features/transactions/components/transaction-filter-bar.tsx` — account filter.
- `src/features/transactions/hooks/use-{create,update,delete}-transaction.ts` — also invalidate `["accounts"]`; every transaction write changes a balance.
- `src/lib/constants/dashboard.ts` — split nav (below).

**Risks / silent-failure sites**
- **`defaultValues` is `Partial<TransactionPayload>`** — a missing `accountId` type-checks fine and only fails at submit. The `zodResolver` now blocks it with "Pick an account" instead of a backend 400.
- **The factory + `[defaultValues]` reset effect** (`transaction-form.tsx:70-75`) — a fresh object each render would reset the form on every keystroke. Callers must `useMemo`. **Highest-risk line in this phase.**
- **Zero-accounts dead end** — if `useAccounts()` returns `[]`, the picker is empty and create is impossible for every new user. The form needs an inline "Create an account first" state + link, with submit disabled. Non-negotiable: without it this phase fixes create for old users only.
- **Archived account in edit mode** — the transaction's account may since be archived, so it won't appear in a default (active-only) picker; the Select renders blank and a save 409s `ACCOUNT_ARCHIVED`. Edit mode uses `includeArchived: true` and disables archived options except the selected one.
- **`ACCOUNT_ALREADY_EXISTS`** → inline field error on `name`, not a toast. Remember `query-provider.tsx` toasts **queries only** — mutations must handle their own errors.

**Nav.** By Phase 5 there'd be 6 items + FAB ≈ 53px each at 375px. Split rather than cram:
- `NAV_ITEMS` → Overview, Transactions, Budgets, Reports (bottom nav + sidebar; keeps the existing 2/FAB/2 split working)
- `SECONDARY_NAV_ITEMS` → Accounts, Settings (sidebar + header menu)

**Verify:** register a brand-new user → `/accounts` empty state → create "Cash" → transaction create succeeds. *This is the acceptance test for the phase.* Then: archive an account with history (disappears, its transactions still name it, restore works); colliding rename → inline error; create a transaction → balance updates without a refresh.

---

## Phase 2 — Transfers

**Goal:** `TransactionType` gains `"transfer"`. `CategoryType` stays `income | expense` — the backend comments this explicitly (`transaction.types.ts:5-7`): *"transfers carry no category, so the two unions legitimately diverge — don't collapse them into one."*

**Why after Phase 1:** transfers need `toAccountId`, so accounts must exist first.

### The RHF approach

**Do not use `z.discriminatedUnion` as the resolver schema.** `useForm<T>` with a union `T` poisons everything downstream: `name="categoryId"` isn't a valid path on the transfer arm, `setValue`/`useWatch` return unions, `errors` becomes a union. Every workaround is a cast.

**Use a flat form schema + `.superRefine`, and a separate discriminated *wire* type at the mutation boundary.** One field set → RHF path typing works, `errors.toAccountId` works, and `superRefine` reports at exact paths.

```ts
// Base ZodObject kept separate: attaching .superRefine yields a ZodCustom,
// which has no .partial() — transactionUpdateSchema derives from here.
const transactionFields = z.object({ /* type, amount, accountId, categoryId?, toAccountId?, ... */ });

export const transactionFormSchema = transactionFields.superRefine((v, ctx) => {
  if (v.type === "transfer") {
    if (!v.toAccountId) ctx.addIssue({ code: "custom", path: ["toAccountId"], message: "Pick a destination account" });
    // Mirrors TRANSFER_SAME_ACCOUNT (422) — catch it client-side.
    else if (v.toAccountId === v.accountId) ctx.addIssue({ code: "custom", path: ["toAccountId"], message: "Pick a different destination account" });
  } else if (!v.categoryId) {
    ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Pick a category" });
  }
});
```

A `toCreatePayload()` mapper in `utils.ts` strips the arm-irrelevant field so the body matches the `oneOf` exactly; `useCreateTransaction` calls it internally so no caller can forget.

**`TRANSFER_TYPE_IMMUTABLE`** is encoded in the toggle: *add* offers three options; *edit* on a transfer locks to Transfer (static badge); *edit* on anything else doesn't offer Transfer. `TransactionForm` gains `typeOptions` + `readOnlyType`, replacing the hardcoded `(["expense","income"] as const)`.

**Modified:** `types.ts`, `schema.ts`, `constants.ts`, `utils.ts`, `transaction-form.tsx`, `transaction-row.tsx`, `transaction-filters.tsx`, `add-transaction-sheet.tsx`, `transaction-filter-bar.tsx`, `categories/types.ts` (+ a `toCategoryType()` narrowing helper).

**Silent-failure sites this phase must fix** — the compiler catches `TransactionType`, `schema.ts`, the `Record<TransactionType,string>` in `constants.ts`, and both `useCategories(type)` calls. It does **not** catch:
- `utils.ts:37` — `if income … else totalExpense += …` **counts every transfer as an expense**. The backend excludes transfers from aggregates, so day-header totals would visibly disagree with the summary card. Replace the `else` with an exhaustive check. *Don't* add a third total span to the day header — two figures already fill the row at 375px.
- `transaction-row.tsx:53` — the `?"-":"+"` ternary renders **`+` for transfers**. Move to a compiler-enforced `TRANSACTION_TYPE_SIGN: Record<TransactionType,string>` (`→` for transfer).
- `transaction-row.tsx:37` — `{category ?? "Uncategorized"}` makes **every transfer row read "Uncategorized"**. Transfers render `{account} → {toAccount}` instead.
- `add-transaction-sheet.tsx:35` — the toast says "Income" for a transfer. Use a `TRANSACTION_TYPE_LABEL` record.
- `transaction-filters.tsx:7,26` — `["all","income","expense"]` + `grid-cols-3` → 4 options, `grid-cols-4` (~88px per segment at 375px; fine). Type the array off the enum so it can't drift again.

**Verify:** create a transfer → both balances move, row reads `Cash → Bank`, sign `→`. Same source/destination → inline error, **no network request**. A day with 1 income + 1 transfer → header total excludes the transfer and reconciles with the summary card. Edit a transfer → type locked. Toggle Expense→Transfer → category field is replaced by the destination picker, no stale `categoryId` in the body.

---

## Phase 3 — Budgets

**Added:** `src/features/budgets/{types,schema,index}.ts` + hooks + components; `src/app/api/budgets/route.ts`, `budgets/[id]/route.ts`, `budgets/progress/route.ts`, `budgets/[id]/progress/route.ts`; `src/app/(dashboard)/budgets/page.tsx` (month switcher + progress cards).

**Decision:** the list page renders **`/api/budgets/progress`, not `/api/budgets`** — `BudgetProgress extends BudgetResponse`, so progress is a strict superset; a plain list would be a second, weaker source of truth.

`PUT /api/budgets/{id}` accepts **`{ amount }` only** — it is not a partial update of the create shape.

**Risks:** `periodStart` is normalized server-side to the 1st, so what you POST and what you read back differ — key the month query on the **normalized** value or the cache misses. `categoryId: null` is a *meaningful* value (the overall budget), not "absent" — don't let `undefined`-stripping eat it. Only `expense` categories apply. `BUDGET_ALREADY_EXISTS` → inline error on the category picker.

**Verify:** an overall budget + a category budget in one month coexist without a 409. Add an expense → `spent`/`percentUsed` move. Over-spend → `isOverBudget` styling. Month switcher isolates periods.

---

## Phase 4 — Settings (users/me, password, categories)

**Added:** `src/features/users/` (types, schema, `use-me`, `use-update-me`, `use-delete-me`); `src/features/auth/hooks/use-change-password.ts`; `src/features/categories/hooks/{use-create-category,use-delete-category}.ts`; `src/app/api/users/me/route.ts`, `src/app/api/auth/password/route.ts`, `src/app/api/categories/[id]/route.ts`; `src/app/(dashboard)/settings/page.tsx` + `settings/categories/page.tsx`. Fills the dead `/settings` nav item.

**Keep two `User` types.** `src/features/auth/types.ts:7` has `id?: string` because `AuthResponse.user` is only `Pick<UserResponse,"email"|"name">`. Auth's `User` is the *session* shape; `users`' is the *profile* shape. Don't unify them.

**Modified**
- `src/features/auth/schema.ts` — add the backend's real rule (min 8 + lower + upper + digit) as a shared `passwordSchema`, reused by Phase 6's register. **Do not apply it to login** — the backend's login schema is `minLength: 1`, and tightening the client would lock out legacy passwords. The current `min(6)` is already wrong in that direction; relax to `min(1)`.
- `src/features/categories/hooks/use-categories.ts` — its `staleTime: Infinity` is justified by a comment saying nothing mutates categories *yet*. That stops being true here: drop to the 60s default and invalidate `["categories"]` on create/delete.

**Risks:** `AUTH_PASSWORD_NOT_SET` (**400**) for Google-only accounts — **check what `GET /api/users/me` actually returns before building the Security section**; if it doesn't surface the OAuth provider, either add it backend-side or catch the code and render an explanatory state. `DELETE /api/users/me` is terminal: type-to-confirm, then `logout()` + hard redirect. Confirm the FK behaviour for deleting a category that has transactions before wiring that button.

**Verify:** rename → header updates. Change password → old fails on re-login, new works. Create + delete a category → the transaction picker updates (proves the `staleTime` change). Delete account → signed out, can't log back in.

---

## Phase 5 — Reports + the summary-filter fix

**Added:** `use-category-summary.ts`, `use-monthly-trend.ts` (`months` is a **string**, default `"12"`), `use-summary-by-date-range.ts`; the three matching route handlers; `src/app/(dashboard)/reports/page.tsx`. recharts is already a dependency — this is what it's for. Mobile-first: stacked cards, one chart per viewport width, nothing side-by-side below `md`.

**Modified — the silent bug.** `use-transaction-summary.ts` sends filters `getSummary(userId)` ignores. Fixed here because `summary/date-range` is the actual remedy and it lands in this phase: use `/date-range` when **both** ends are set, else fall back to all-time; narrow the prop to the two date fields.

**Document the limitation:** `type` / `categoryId` / `accountId` / `amountMin` / `amountMax` still won't affect the summary card — the backend has no endpoint for it. Today the card *pretends* to be filter-aware; after this it honestly reflects the date range only. Add a caption rather than leaving it looking filter-aware.

**Verify:** set both ends of a date range → the card's numbers change. *They don't today — that's the proof.* One end only → all-time. Create a transfer → the month's trend figures don't move.

---

## Phase 6 — Register + Google

**Last, because it's the only phase with an external dependency** (Google Identity Services + a client ID). Everything before it ships without touching env or third-party SDKs.

**Added:** `registerSchema` (reusing Phase 4's `passwordSchema`); `use-register.ts`, `use-google-login.ts`; `register-form.tsx`, `google-button.tsx`; `src/app/(auth)/register/page.tsx` mirroring `login/page.tsx`; `src/app/api/auth/register/route.ts` (POST→204) and `src/app/api/auth/google/route.ts`.

**Decision — register auto-logs-in.** `POST /api/auth/register` returns **204** and `AuthService.register()` returns no token. So `useRegister` chains register → login with the credentials already in hand. One tap, mobile-appropriate. If the chained login fails, redirect to `/login` with a success toast — never leave the user on a spinner.

**Modified:** `src/lib/env.ts` (`GOOGLE_CLIENT_ID`); `login-form.tsx` (Google button + "Create an account" link). `AUTH_ROUTES` already includes `/register` from Phase 0, so signed-in users get redirected away for free.

**Risks:** `/api/auth/google` needs `applyRefreshTokenCookie` — model it on `auth/login/route.ts`, **not** `forwardJson`. Google login must go through the route handler, never direct-to-backend, or the refresh cookie never lands on the Next origin and the whole `proxy.ts` session model breaks. Guard the GSI script against double-init under React 19 StrictMode. `OAUTH_PROVIDER_MISMATCH` (email registered with a password, now trying Google) needs a distinct inline message.

**Verify:** register → signed in on `/dashboard` → `/accounts` empty state (closes the Phase 1 loop). `password123` → inline rule error, no request. Signed in, visit `/register` → redirected. Google sign-in on a password email → clear message.

---

## Testing

The status quo is 3 test files, all pure logic, **zero `vi.mock`, zero `.tsx`**. That's a deliberate-looking equilibrium and this work shouldn't overturn it: the first component test would mean introducing a `QueryClientProvider` wrapper, a fetch-mocking strategy, and Radix-in-jsdom portal workarounds — a project of its own. Four pure test files, following `auth/schema.test.ts` exactly (`safeParse` + `expect(result.success)`, no mocks, ~60 lines each):

| Phase | File | Covers |
| --- | --- | --- |
| 1 | `src/features/accounts/schema.test.ts` | name bounds, type enum, negative `initialBalance` allowed |
| 2 | `src/features/transactions/schema.test.ts` | **highest value** — transfer without `toAccountId` errors at `["toAccountId"]`; same-account errors; income without `categoryId` errors; transfer without `categoryId` **passes** |
| 2 | `src/features/transactions/utils.test.ts` | `groupTotals` excludes transfers (pins the `utils.ts:37` regression); `toCreatePayload` strips the arm-irrelevant field |
| 4/6 | `src/features/auth/schema.test.ts` *(extend)* | `passwordSchema` rules; `loginSchema` still accepts a short legacy password |

## End-to-end verification

Per phase, above. The one that matters most, after Phase 1: **register a brand-new user, create an account, create a transaction.** That path is impossible today for a new user and broken for an existing one.

Run `npm run lint` and `npm test` per phase. Each phase is independently shippable and leaves the app working — no phase may leave transaction-create broken.
