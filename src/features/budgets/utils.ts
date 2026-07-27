import { format, getDate, getDaysInMonth, parseISO } from "date-fns";

import { monthRange } from "@/lib/date";
import {
  FOLDED_SEGMENT_LABEL,
  MAX_BREAKDOWN_SEGMENTS,
  REMAINDER_SEGMENT_LABEL,
} from "@/features/budgets/constants";
import type {
  Budget,
  BudgetProgress,
  SpendSegment,
  SpendingPace,
} from "@/features/budgets/types";
import type { TransactionQueryParams } from "@/features/transactions/types";

/**
 * Turns a "YYYY-MM" period into the wire date. The backend normalizes any day
 * in the month to the first, so sending the first keeps what is written and
 * what is read back identical — and the query cache keyed on it can't miss.
 */
export function toPeriodStart(month: string): string {
  return `${month}-01`;
}

/**
 * The transaction filter that reproduces this budget's `spent`, condition for
 * condition — expenses only, within the budget's month, scoped to its category.
 */
export function toTransactionFilters(budget: Budget): TransactionQueryParams {
  return {
    type: "expense",
    // A null categoryId is the overall budget: every expense counts toward it,
    // so the category filter is omitted rather than sent empty.
    ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
    ...monthRange(budget.periodStart.slice(0, 7)),
  };
}

/** Progress bar width. `percentUsed` is uncapped, but a bar can't overflow. */
export function barWidth(percentUsed: number): number {
  return Math.min(Math.max(percentUsed, 0), 100);
}

/** Overall budget first, then the most-used categories — what's at risk sits on top. */
export function sortBudgets(budgets: BudgetProgress[]): BudgetProgress[] {
  return [...budgets].sort((a, b) => {
    if (a.categoryId === null) return -1;
    if (b.categoryId === null) return 1;
    return b.percentUsed - a.percentUsed;
  });
}

/**
 * Whether the period has a month-wide budget. When it does, that budget already
 * covers every expense, so the category rollup beside it is redundant.
 */
export function hasOverallBudget(budgets: BudgetProgress[]): boolean {
  return budgets.some((budget) => budget.categoryId === null);
}

/** Month-wide totals across every budget except the overall one, which would double-count. */
export function budgetTotals(budgets: BudgetProgress[]) {
  return budgets
    .filter((budget) => budget.categoryId !== null)
    .reduce(
      (totals, budget) => ({
        budgeted: totals.budgeted + budget.amount,
        spent: totals.spent + budget.spent,
      }),
      { budgeted: 0, spent: 0 },
    );
}

/**
 * Spending that fell outside every category budget, or `null` when there is no
 * overall budget — without one the month's total spend is unknowable from this
 * payload. The overall budget covers every expense and each category can hold
 * at most one budget, so the categories are a strict subset and the difference
 * is never truly negative. Rounding to cents absorbs floating-point drift in
 * either direction — left alone, a 5e-17 residue is truthy and would render as
 * an "Everything else" slice of Rp0.
 */
export function unbudgetedSpend(budgets: BudgetProgress[]): number | null {
  const overall = budgets.find((budget) => budget.categoryId === null);
  if (!overall) return null;

  const difference = overall.spent - budgetTotals(budgets).spent;
  return Math.max(Math.round(difference * 100) / 100, 0);
}

/**
 * The month's spending split by category, with anything unbudgeted as a
 * trailing remainder. Shares are of the whole month when an overall budget
 * exists, and of budgeted spending otherwise.
 */
export function spendBreakdown(budgets: BudgetProgress[]): SpendSegment[] {
  const remainder = unbudgetedSpend(budgets);

  const ranked = budgets
    .filter((budget) => budget.categoryId !== null && budget.spent > 0)
    .map((budget) => ({
      label: budget.category ?? "Uncategorized",
      amount: budget.spent,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Hues are assigned in fixed order and never cycled, so the tail folds
  // into one segment rather than repeating a colour already on screen.
  const spends = ranked.slice(0, MAX_BREAKDOWN_SEGMENTS);
  const folded = ranked.slice(MAX_BREAKDOWN_SEGMENTS);

  if (folded.length) {
    spends.push({
      label: FOLDED_SEGMENT_LABEL,
      amount: folded.reduce((sum, segment) => sum + segment.amount, 0),
    });
  }

  if (remainder) {
    spends.push({ label: REMAINDER_SEGMENT_LABEL, amount: remainder });
  }

  const total = spends.reduce((sum, segment) => sum + segment.amount, 0);
  if (total === 0) return [];

  return spends.map((segment) => ({
    ...segment,
    share: segment.amount / total,
    ...(segment.label === REMAINDER_SEGMENT_LABEL && { isRemainder: true }),
  }));
}

/**
 * Budgets worth flagging: those past their cap, and those closing in on it.
 * Each list runs worst first.
 */
export function budgetsNeedingAttention(
  budgets: BudgetProgress[],
  warnAt = 80,
): { over: BudgetProgress[]; near: BudgetProgress[] } {
  const ranked = [...budgets].sort((a, b) => b.percentUsed - a.percentUsed);

  return {
    over: ranked.filter((budget) => budget.percentUsed >= 100),
    near: ranked.filter(
      (budget) => budget.percentUsed >= warnAt && budget.percentUsed < 100,
    ),
  };
}

/**
 * How far through the budget's month `today` sits, as a percentage — the bar's
 * pace marker. `null` for any other period. Unlike `spendingPace` this survives
 * an overspent budget, which is when the comparison matters most. Percent, not
 * a 0–1 fraction, so it shares units with `barWidth` at the call site.
 */
export function monthElapsedPercent(
  periodStart: string,
  today: Date,
): number | null {
  if (periodStart.slice(0, 7) !== format(today, "yyyy-MM")) return null;

  return (getDate(today) / getDaysInMonth(parseISO(periodStart))) * 100;
}

/**
 * What a budget allows per remaining day. `null` for any period other than the
 * one `today` falls in — a burn rate for a finished month says nothing — and
 * `null` once the budget is spent, since there is no allowance left to pace.
 */
export function spendingPace(
  budget: BudgetProgress,
  today: Date,
): SpendingPace | null {
  if (budget.periodStart.slice(0, 7) !== format(today, "yyyy-MM")) return null;
  if (budget.isOverBudget || budget.remaining <= 0) return null;

  const daysInMonth = getDaysInMonth(parseISO(budget.periodStart));
  const dayOfMonth = getDate(today);
  const daysRemaining = daysInMonth - dayOfMonth + 1;
  const expectedByNow = budget.amount * (dayOfMonth / daysInMonth);

  return {
    daysRemaining,
    perDay: budget.remaining / daysRemaining,
    expectedByNow,
    isOnTrack: budget.spent <= expectedByNow,
  };
}
