# 1. Registration ships before Reports, and Google is split out

Date: 2026-09-18

## Status

Accepted

## Context

The backend contract catch-up plan sequenced Reports as Phase 5 and Register plus
Google sign-in together as Phase 6, on the reasoning that Phase 6 was the only work
with an external dependency and should therefore come last.

That reasoning held while Fintra had exactly one user. It stopped holding when the
app was expected to take real signups: the UI has a login page and nothing else, no
registration route and no link offering one, so a new person reaches a form they
cannot satisfy. Everything the plan called polish sits behind a door nobody can open.

Three questions came out of that:

1. Does Reports or Register go first?
2. Does Google sign-in belong in the same slice as registration?
3. Should the login form enforce the password rules that registration enforces?

The third question mattered because the login schema had deliberately been left at
"any non-empty password", with a comment explaining that anything stricter would
lock out a password predating the current rules. The backend's own login rule is
`minLength: 1`, so the client was the only thing that could tighten it.

## Decision

**Registration ships first.** Reports is polish for a user who cannot get in the
door.

**Google sign-in is its own slice, after Reports.** It costs an environment
variable, a third-party script, a double-initialisation guard under React 19's
development double-render, and a distinct provider-mismatch error path — none of
which stand between a new person and an account. Email and password alone open the
door.

**Login enforces the full password rules**, the same ones registration and
change-password use. The app states one password standard rather than two.

## Consequences

Registration is the first slice, and its acceptance test is the end-to-end walk the
plan already named: register a brand-new user, land on the dashboard, hit the
accounts empty state, create an account, create a transaction. That path was
impossible before.

Because registration issues no session — the backend answers 204 with no token — the
registration hook owns a register-then-login chain, and raises a distinct error when
the account was created but the follow-up sign-in failed, so the form routes to
login with a success note instead of reporting a failed signup.

The login decision has a real cost, accepted knowingly: **any existing account whose
password is short or missing a character class can no longer submit the login form**
and must be reset out of band. The failure is silent in the sense that it happens at
the form rather than at the API, so "my password stopped working" traces back here.
A schema test pins the strictness, so a later well-meaning relaxation fails the suite
and forces this conversation again rather than quietly reverting the decision.

Deferring Google means the login page is built twice: once without it, once with.
That was judged cheaper than blocking every signup on a third-party integration.

## Alternatives considered

**Reports first anyway** — treat signups as a someday concern and seed accounts by
hand. Rejected once real signups became the expectation; hand-seeding does not scale
past the people you can text.

**Register and Google in one slice** — the login page reaches its final shape once
instead of twice. Rejected: it couples the only thing blocking signups to the only
thing needing third-party configuration.

**Keep login at `min(1)`** — no existing account is ever locked out, at the cost of
the app enforcing two different password standards. Rejected in favour of a single
stated standard, with the lockout accepted as a known consequence.
