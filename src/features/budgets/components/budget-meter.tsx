import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { barWidth } from "@/features/budgets/utils";

interface BudgetBarProps {
  /** Uncapped, so the bar clamps it while the label keeps the true figure. */
  percentUsed: number;
  isOverBudget: boolean;
}

/** The filled track on its own, for callers that label it differently. */
export function BudgetBar({ percentUsed, isOverBudget }: BudgetBarProps) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full",
          isOverBudget ? "bg-destructive" : "bg-primary",
        )}
        style={{ width: `${barWidth(percentUsed)}%` }}
      />
    </div>
  );
}

interface BudgetMeterProps extends BudgetBarProps {
  spent: number;
  amount: number;
  remaining: number;
}

/** Bar plus the spend, percentage and what's left — the budget read-out. */
export function BudgetMeter({
  spent,
  amount,
  remaining,
  percentUsed,
  isOverBudget,
}: BudgetMeterProps) {
  return (
    <div className="flex flex-col gap-2">
      <BudgetBar percentUsed={percentUsed} isOverBudget={isOverBudget} />

      <div className="flex items-baseline gap-2 text-xs">
        <p className="min-w-0 flex-1 truncate text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatCurrency(spent)}
          </span>{" "}
          of {formatCurrency(amount)}
        </p>

        <p
          className={cn(
            "shrink-0 font-medium tabular-nums",
            isOverBudget ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {Math.round(percentUsed)}%
        </p>
      </div>

      <p
        className={cn(
          "text-xs",
          isOverBudget ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {isOverBudget
          ? `${formatCurrency(Math.abs(remaining))} over budget`
          : `${formatCurrency(remaining)} left`}
      </p>
    </div>
  );
}
