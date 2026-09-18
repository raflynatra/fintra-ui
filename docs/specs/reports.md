# Spec — Reports

## Problem Statement

Fintra can tell you what happened, one row at a time, and whether a budget is on
pace. It cannot tell you two things people actually open a finance app to learn:
**where the money went this month**, and **whether the trend is going the wrong
way**.

The transaction list answers "what did I spend on the 14th". The summary card
answers "what is the month's total". Neither answers "which category ate the
month", and nothing in the app looks further back than the selected month.

## Solution

A `/reports` page holding exactly two views and nothing else:

1. **Where the money went** — spend by category for the selected month, as a
   donut with the legend below it.
2. **How it is trending** — the last 12 months of income against expense, as
   grouped bars.

It is scoped to the same month state the rest of the app uses, so switching months
on transactions and switching months on reports mean the same thing.

The page is reached from its own card on the dashboard. It does **not** take a
bottom-nav slot: the bar stays at four items and Settings keeps its place.

## User Stories

1. As a user, I want to see which categories I spent the most on this month, so that I know where my money actually goes.
2. As a user, I want each category's share of the month shown proportionally, so that I can see at a glance which one dominates.
3. As a user, I want the exact amount for each category, not just a slice, so that I can act on a real number.
4. As a user, I want income and expense categories kept apart, so that a large salary does not sit in the same ranking as groceries.
5. As a user, I want transfers excluded from the category view, so that moving money between my own accounts does not read as spending.
6. As a user, I want uncategorised spending shown as its own entry, so that I can see how much is unaccounted for.
7. As a user, I want to see the last 12 months of income against expense, so that I can tell whether this month was typical.
8. As a user, I want months where I recorded nothing to still appear in the trend, so that a gap reads as a gap rather than being silently skipped.
9. As a user, I want to see at a glance in which months I spent more than I earned, so that I can spot trouble before it compounds.
10. As a user, I want transfers excluded from the trend, so that the figures reconcile with the summary card.
11. As a user, I want the reports page to follow the month I already picked elsewhere, so that I do not maintain two ideas of "this month".
12. As a user, I want to change the month from the reports page, so that I can compare without going back.
13. As a user on a phone, I want each chart to fit a 375px viewport, so that I am not pinching or scrolling sideways to read a label.
14. As a user, I want to reach reports from a card on the dashboard, so that it is discoverable without crowding the bottom bar.
15. As a user, I want the bottom nav unchanged, so that the destinations I reach daily stay where my thumb expects them.
16. As a new user with no transactions, I want each chart to say so in its own words, so that the page does not look broken.
17. As a user whose current month is empty but whose history is not, I want the trend to still render, so that an empty month does not hide a year of data.
18. As a user, I want a loading state per card, so that the page does not jump as data arrives.
19. As a user whose backend is unreachable, I want to be told, so that I do not read a blank chart as "zero".
20. As a user, I want amounts formatted the way they are everywhere else in the app, so that I can compare figures across pages.
21. As a user, I want the charts legible in dark mode, so that the page matches the rest of the app.
22. As a maintainer, I want the chart data shaping to be a pure function, so that it can be tested without rendering anything.
23. As a maintainer, I want the reports page to restate nothing already shown on Overview or Budgets, so that there is one place per number.

## Implementation Decisions

**Order.** This slice ships *after* register. Reports is polish for a user who
cannot currently sign up.

**Scope discipline.** The page carries the two views nothing else has, and nothing
more: no totals cards, no restating the month summary, no budget pace. If it
cannot fill two charts' worth of unique content, it should be folded into Overview
instead — that is the fallback, not an expansion.

**Placement.** Its own route in the dashboard route group, linked from a dedicated
card on Overview. No bottom-nav entry, no sidebar entry, no change to the nav
constants — which also means the back-link label logic that reads from the nav list
is untouched.

**Time scope.** Reuses the shared month state that transactions and budgets already
use. No date-range picker: a second time model on mobile is not worth the power.

**Trend contract** (`GET /api/transactions/trend/monthly`):

- `months` is a **string** query param, default `"12"`, valid 1–24.
- Returns `{ month: "YYYY-MM", income, expense, balance }` rows, where `balance`
  is income minus expense.
- Transfers are already excluded server-side.
- **The query groups by month, so months with no transactions are absent from the
  response.** Zero-filling the gap is the UI's job, and it is the main reason the
  shaping logic is a pure, tested function rather than inline JSX.
- The window is relative to the current month, not to the selected month. The trend
  card is therefore "the last 12 months", independent of the month switcher — and
  should be labelled that way, not as if the switcher moved it.

**Category contract — the one real obstacle.** `GET /api/transactions/summary/categories`
returns `{ categoryId, category, type, total, count }` with transfers excluded and
uncategorised rows preserved as a null category. But the underlying query takes
**only a user id: it has no date filter and is all-time**. It cannot answer "this
month" and never could.

Decision: **derive the month's category breakdown client-side** from a single
month-scoped transaction fetch — the list endpoint already accepts `dateFrom` /
`dateTo`, and the aggregation is a pure function that is exactly what the test seam
wants. The endpoint's own all-time numbers are not used.

The known ceiling: the list endpoint paginates with a `size` param, so the fetch
asks for a page large enough to cover a month and the aggregate is wrong for anyone
who exceeds it. Mark that ceiling in the code rather than pretending it does not
exist; the upgrade path is a date-filtered category endpoint backend-side, at which
point the client aggregation is deleted.

Alternatives considered and rejected: shipping the donut as all-time (silently
disagrees with every other number on the page, the same class of bug the summary
card had); and blocking this slice on a backend change (makes a UI slice
cross-repo).

**Chart choices.** Category breakdown is a donut with the legend below — chosen
over ranked horizontal bars, accepting that the legend costs vertical space on a
phone. The trend is grouped bars, income against expense, two bars per month: it
answers "am I spending more than I earn" directly, which a single net line hides.

**Charting library.** recharts is already a dependency and unused; this is what it
was installed for. No new chart dependency.

**Empty states.** Per card, not per page. Each chart card renders its own "nothing
this month" copy, so an empty current month still leaves the 12-month trend visible
— which is precisely when the trend is most useful.

**Category typing.** Income and expense categories are separate concerns and the
donut shows expense; the type field on each row is what separates them. Transfers
carry no category and are excluded upstream, so the union of category types stays
income-or-expense and must not be widened.

## Testing Decisions

A good test here asserts on the *shape the charts receive*, given raw API rows —
external behaviour of a pure transform — and never on rendered SVG, chart internals
or component structure. The repo tests pure logic only: schema, utils and store,
with no mocks and no `.tsx`. This slice keeps that.

**Seam:** a single feature `utils.ts` holding both transforms, tested the way the
budget utils are tested — a small row factory at the top of the file, then plain
input/output assertions.

Cases:

- Zero-filling: a trend response missing the middle months yields a continuous 12-month series with zeros in the gaps, in ascending order.
- A trend response that is entirely empty still yields 12 zeroed months, so the chart renders axes rather than nothing.
- Month aggregation: transactions for a month collapse into per-category totals, sorted largest first.
- Transfers never contribute to a category total.
- Uncategorised transactions collapse into a single labelled bucket rather than many null-keyed ones.
- Income and expense do not mix in one breakdown.
- Percentage shares sum to 100 for a non-empty month, and the empty-month case returns an empty result rather than dividing by zero.

Prior art: the budget and transaction utils tests — a typed factory function for
fixtures, `describe` per exported function, no mocks.

## Out of Scope

- Any bottom-nav or sidebar change. The nav stays exactly as it is.
- A date-range picker, custom periods, or year-to-date views.
- Comparing two arbitrary months side by side.
- Exporting or sharing a report.
- Account-level or budget-level breakdowns — Accounts and Budgets own those.
- Drill-down from a donut slice into the filtered transaction list.
- Changing the summary card, the budgets insights, or anything on Overview beyond adding the entry-point card.
- A backend endpoint for date-filtered category summaries. Noted as the upgrade path, not built here.
- Component or end-to-end tests for the charts.

## Further Notes

The acceptance test: with a month of mixed transactions including at least one
transfer, the donut's category totals reconcile with the month summary card, and
the transfer appears in neither. Then switch to a month with no transactions — the
donut card says so and the trend keeps rendering.

The client-side aggregation is the part of this spec most likely to be wrong later.
It is a deliberate trade to keep the slice inside one repo, and it is the first
thing to delete when the backend grows a date-filtered category endpoint.
