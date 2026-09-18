# Context

The shared vocabulary for Fintra. Each entry states a distinction the code already
depends on — the ones that have caused real confusion, not every noun in the app.

This is a glossary. It holds no implementation detail, no specification and no
decisions; decisions live in `docs/adr/`.

## Account

A place money sits: cash, a bank account, an e-wallet, a credit card. Every
transaction names one.

Not to be confused with **User**. In conversation "my account" means either, and the
two are unrelated: a User has many Accounts, and deleting one is nothing like
deleting the other.

An Account's **balance** is derived, not stored by the client: its opening balance
plus every movement in or out. It is never computed in the UI.

## User

A person who signs in. Has a name, an email and a way to authenticate.

The app deliberately holds two shapes of a User and does not unify them: the
**session** shape, which is what authentication hands back, and the **profile**
shape, which is what the profile screen reads and edits. They carry different
fields, and collapsing them would invent data that one side does not have.

## Archive

How an Account is removed. Archiving hides it from pickers and from the balance
total, but its history is never lost: transactions that name an archived Account
still name it, and the Account can be restored.

**There is no hard delete for an Account.** Any language about "deleting" one means
archiving it.

One consequence to remember: name uniqueness applies to active Accounts only, so
restoring an archived Account can collide with one created since.

## Transaction

A single movement of money, of one of three types: **income**, **expense** or
**transfer**.

## Transfer

A movement between two of your own Accounts. It is the awkward member of the
Transaction family because two rules apply to it and nothing else:

- **A transfer carries no category.** It is not spending and not earning, so
  categories — which are only ever income or expense — do not apply.
- **A transfer is excluded from every aggregate**: summaries, category breakdowns,
  trends, budget progress. Money moved between your own pockets is not money spent.

A transaction also cannot be converted into or out of a transfer after the fact.

## Category

A label for what an income or expense *was*. Every Category is itself either income
or expense, and a picker only offers the ones matching the transaction's type.

Categories never apply to transfers — see above. The set of Category types and the
set of Transaction types therefore differ on purpose, and must not be collapsed into
one.

## Budget period

The window a Budget covers. A Budget is one cap, on one Category or on the month as
a whole, for one period — and there is **one Budget per Category per period**, so a
second one collides rather than adding to the first.

A Budget with no Category is the **overall** budget for that period. That is a
meaningful value, not a missing one, and must survive any code that strips empty
fields.

The period's start is normalised server-side to the first of the month, so what is
sent and what is read back can differ.

## Overview, Reports and Insights

Three surfaces that must not restate each other's numbers:

- **Overview** — the dashboard. Where you are right now: balances, the month's
  summary, and the way into everything else.
- **Reports** — where the money went, and how it is trending. Only what no other
  surface shows: the month's split by category, and income against expense over the
  last twelve months.
- **Insights** — the reading of a Budget against its pace, shown on the budgets
  page. Belongs to Budgets, not to Reports.

If a number appears on two of these, one of them is wrong.
