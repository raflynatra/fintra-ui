import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { barWidth, budgetTotals } from "@/features/budgets/utils";
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
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                isOverBudget ? "bg-destructive" : "bg-primary",
              )}
              style={{ width: `${barWidth(percentUsed)}%` }}
            />
          </div>

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
