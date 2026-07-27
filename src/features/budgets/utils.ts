import { monthRange } from "@/lib/date";
import type { Budget, BudgetProgress } from "@/features/budgets/types";
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
