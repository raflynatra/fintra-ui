import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import {
  barWidth,
  monthElapsedPercent,
  spendingPace,
} from "@/features/budgets/utils";
import type { BudgetProgress } from "@/features/budgets/types";

interface BudgetBarProps {
  /** Uncapped, so the bar clamps it while the label keeps the true figure. */
  percentUsed: number;
  isOverBudget: boolean;
  /** Where the month has got to, as a percentage. Omit to drop the marker. */
  pacePercent?: number | null;
}

/** The filled track on its own, for callers that label it differently. */
export function BudgetBar({
  percentUsed,
  isOverBudget,
  pacePercent,
}: BudgetBarProps) {
  const pace =
    typeof pacePercent === "number"
      ? {
          left: barWidth(pacePercent),
          label: `${Math.round(pacePercent)}% through the month`,
        }
      : null;

  return (
    /* Vertical padding is the tick's overhang room; the track can't clip it. */
    <div className="relative py-1">
      <div className="h-2 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            isOverBudget ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${barWidth(percentUsed)}%` }}
        />
      </div>

      {pace && (
        <span
          role="img"
          aria-label={pace.label}
          title={pace.label}
          className="absolute inset-y-0 w-px -translate-x-1/2 bg-muted-foreground"
          style={{ left: `${pace.left}%` }}
        />
      )}
    </div>
  );
}

interface BudgetMeterProps {
  budget: BudgetProgress;
}

/** Bar plus the spend, percentage, what's left and the daily pace. */
export function BudgetMeter({ budget }: BudgetMeterProps) {
  const { spent, amount, remaining, percentUsed, isOverBudget } = budget;
  const today = new Date();
  const pace = spendingPace(budget, today);

  return (
    <div className="flex flex-col gap-2">
      <BudgetBar
        percentUsed={percentUsed}
        isOverBudget={isOverBudget}
        pacePercent={monthElapsedPercent(budget.periodStart, today)}
      />

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

      <div className="flex items-baseline justify-between gap-2 text-xs">
        <p
          className={
            isOverBudget ? "text-destructive" : "text-muted-foreground"
          }
        >
          {isOverBudget
            ? `${formatCurrency(Math.abs(remaining))} over budget`
            : `${formatCurrency(remaining)} left`}
        </p>

        {pace && (
          <p
            className={cn(
              "shrink-0 text-right",
              pace.isOnTrack ? "text-muted-foreground" : "text-destructive",
            )}
          >
            {formatCurrency(pace.perDay)}/day for {pace.daysRemaining}{" "}
            {pace.daysRemaining === 1 ? "day" : "days"}
          </p>
        )}
      </div>
    </div>
  );
}
