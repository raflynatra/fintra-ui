import type { BudgetProgress } from "@/features/budgets/types";

/**
 * Turns a "YYYY-MM" period into the wire date. The backend normalizes any day
 * in the month to the first, so sending the first keeps what is written and
 * what is read back identical — and the query cache keyed on it can't miss.
 */
export function toPeriodStart(month: string): string {
  return `${month}-01`;
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
