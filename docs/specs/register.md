# Spec — Register (email + password)

## Problem Statement

Nobody but an already-provisioned user can get into Fintra. The app has a `/login`
page and nothing else: no way to create an account, and no link offering one. A
person handed the URL reaches a form they cannot satisfy and has no path forward.

The backend has supported registration all along — the UI simply never wired it
up. This is the last thing standing between Fintra and a second user.

## Solution

A `/register` page in the `(auth)` route group, mirroring `/login`: name, email,
password, with the password rules shown as a live checklist so they can be ticked
off as the user types rather than failing on submit.

On success the user is signed in automatically and lands on the dashboard — one
tap, no "now go and log in" detour. Signed-in visitors to `/register` are
redirected away, the same as `/login` already does.

Registration is open: no invite code, no terms checkbox, no email verification.

## User Stories

1. As a prospective user, I want a Create account link on the login page, so that I can sign up without being told the URL.
2. As a prospective user, I want a register form asking only for name, email and password, so that signing up takes seconds.
3. As a prospective user, I want the password rules shown up front as a checklist, so that I do not discover them by being rejected.
4. As a prospective user, I want each rule to tick off as I type, so that I can see when my password is acceptable.
5. As a prospective user, I want my email validated client-side, so that a typo is caught before a round trip.
6. As a prospective user, I want to be told when the email is already registered, in that field, so that I know to sign in instead of retrying the form.
7. As a prospective user registered via Google, I want a clear message when I try to register that email with a password, so that I understand which sign-in method my account uses.
8. As a new user, I want to be signed in the moment registration succeeds, so that I do not type my credentials twice.
9. As a new user, I want to land on the dashboard after registering, so that I see the app rather than a blank confirmation.
10. As a new user whose auto sign-in fails, I want to be sent to the login page with a message saying my account was created, so that I am never stranded on a spinner.
11. As a new user, I want to be prompted to create an account (the financial kind) before I can record a transaction, so that I am not stuck at an empty picker.
12. As a user on a phone, I want the register form to fit a 375px viewport with touch-sized inputs, so that I can sign up on the device I actually use.
13. As a user, I want the submit button disabled and showing progress while the request is in flight, so that I do not double-submit.
14. As a user, I want a link back to Sign in from the register page, so that I can correct a wrong turn.
15. As an already-signed-in user, I want `/register` to redirect me to the dashboard, so that I cannot create a second account by accident.
16. As a user, I want my password field to offer a show/hide toggle, so that I can check what I typed on a phone keyboard.
17. As a user whose backend is unreachable, I want an error that says so and keeps my form filled in, so that I can retry without retyping.
18. As a returning user with an old, short password, I want to know at the login form that my password no longer meets the rules, so that the failure is explained rather than silent.
19. As a maintainer, I want the register request body to match the backend contract exactly, so that registration cannot fail on a field name.
20. As a maintainer, I want one password rule definition shared by register and change-password, so that the two can never disagree.

## Implementation Decisions

**Order.** This slice ships before the Reports page. Reports is polish for a user
who currently cannot get in the door.

**Scope split.** Google sign-in is deliberately *not* in this slice. It costs an
env var, the Google Identity Services script, a double-init guard under React 19
StrictMode, and its own `OAUTH_PROVIDER_MISMATCH` path — none of which block a
signup. It becomes its own slice after Reports.

**Feature placement.** Everything lives in the existing `auth` feature: the schema
alongside `loginSchema`, a register hook beside the login hook, and a register form
component beside the login form. No new feature module.

**Backend contract** (`POST /api/auth/register`):

- Body `{ email, name, password }`, all required. `name` 1–100 chars, `email` ≤255
  and format-checked, `password` 8–100 with at least one lowercase, one uppercase
  and one digit.
- Returns **204 No Content** with no token. Registration alone does not create a
  session.
- 400 carries the standard error envelope, including `details` for field errors.

**Auto sign-in.** Because register returns no token, the register hook chains
register → login using the credentials already in hand, then routes to the
dashboard. The chain lives inside the hook so no call site can ship a
half-signed-in user. If the chained login fails, redirect to `/login` with a
success toast — the account exists, and saying nothing would read as a failed
signup.

**Route handler.** A new Next route handler proxies register through the app origin
using the shared JSON-forwarding helper, returning 204. It does *not* need the
refresh-cookie treatment — no token is issued here. The subsequent login goes
through the existing login handler, which already applies the refresh cookie, so
the session model is untouched.

**Route protection.** `/register` joins the auth route list so a signed-in visitor
is redirected away by the proxy, exactly as `/login` is today.

**Password rules — a deliberate reversal.** The login schema currently allows any
non-empty password, with a comment explaining that anything stricter would lock out
passwords predating the rules. This spec **applies the full rule set to login as
well**, at the developer's explicit instruction after that consequence was stated.
The comment is replaced by one recording the trade-off rather than deleted: any
account whose password is short or missing a character class can no longer submit
the login form and must be reset out of band.

**Error mapping.** A duplicate email renders as an inline error on the email field,
not a toast — mutations own their error handling here, since the query provider's
toast covers queries only. An OAuth-provider mismatch gets its own message naming
the sign-in method.

**Zero-accounts follow-through.** A newly registered user has no financial
accounts, so transaction creation is impossible until they make one. The existing
"create an account first" state in the transaction form is the safety net; this
spec's acceptance test walks through it rather than adding new UI.

## Testing Decisions

A good test here exercises external behaviour — what a schema accepts and rejects —
and never reaches into how the form is wired. The repo's existing equilibrium is
pure-logic tests only: schema, utils and store files, no `vi.mock`, no `.tsx`, no
React rendering. This slice keeps that equilibrium; a component test would mean
introducing a query-provider wrapper, a fetch-mocking strategy and Radix-in-jsdom
workarounds, which is a project of its own and not this one.

**Seam:** the existing auth schema test file. No new seam kind is introduced.

Cases:

- The register schema rejects a missing name, a name over 100 chars, a malformed email, and an email over 255 chars.
- The register schema rejects passwords failing each rule independently — too short, no lowercase, no uppercase, no digit — and accepts one satisfying all four.
- Errors land at the exact field path, so the form can render them inline.
- The login schema now enforces the same rules, pinning the reversal above so that a later well-meaning relaxation fails the test and forces the conversation.

Prior art: the existing auth and budget schema tests — `safeParse`, assert on
`success` and on the issue path, no mocks, one file per feature.

## Out of Scope

- Google sign-in, the client ID env var, the GSI script and provider-mismatch flows — a separate slice after Reports.
- Email verification, rate limiting and abuse protection. Both are backend concerns and the backend has neither; a client-side gate would be theatre.
- Terms and privacy pages, and any checkbox linking to them.
- Password reset / forgot-password. Not in the backend contract.
- Migrating users whose existing password fails the new login rules. Accepted consequence, handled out of band.
- Any component, integration or end-to-end test infrastructure.

## Further Notes

The acceptance test for this slice is the one the backend contract plan already
named, end to end: **register a brand-new user, land on the dashboard, hit the
accounts empty state, create an account, create a transaction.** That path is
impossible today.

Worth watching: the login-strictness change is the one edit here that can break an
existing user, and it does so silently at the form rather than at the API. If
anyone reports that their password stopped working, this is why.
