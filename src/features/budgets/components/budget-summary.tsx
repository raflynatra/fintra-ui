import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { budgetTotals, monthElapsedPercent } from "@/features/budgets/utils";
import { BudgetBar } from "@/features/budgets/components/budget-meter";
import type { BudgetProgress } from "@/features/budgets/types";

interface BudgetSummaryProps {
  budgets: BudgetProgress[];
}

/**
 * Month totals across the category budgets. The overall budget is excluded —
 * it spans the same expenses, so including it would double-count them.
 */
export function BudgetSummary({ budgets }: BudgetSummaryProps) {
  const { budgeted, spent } = budgetTotals(budgets);
  const remaining = budgeted - spent;
  const percentUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const isOverBudget = spent > budgeted;

  // The rollup has no period of its own; every budget it sums shares one.
  const pacePercent = budgets.length
    ? monthElapsedPercent(budgets[0].periodStart, new Date())
    : null;

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Spent this month</p>
            <p
              className={cn(
                "text-xl font-bold",
                isOverBudget && "text-destructive",
              )}
            >
              {formatCurrency(spent)}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-0.5 text-right">
            <p className="text-xs text-muted-foreground">Budgeted</p>
            <p className="text-sm font-semibold">{formatCurrency(budgeted)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t pt-4">
          <BudgetBar
            percentUsed={percentUsed}
            isOverBudget={isOverBudget}
            pacePercent={pacePercent}
          />

          <p
            className={cn(
              "text-xs",
              isOverBudget ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {isOverBudget
              ? `${formatCurrency(Math.abs(remaining))} over budget`
              : `${formatCurrency(remaining)} left to spend`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
