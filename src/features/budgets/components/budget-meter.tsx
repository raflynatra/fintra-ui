import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import {
  barWidth,
  monthElapsedPercent,
  paceLabelAlign,
  spendingPace,
} from "@/features/budgets/utils";
import type { BudgetProgress } from "@/features/budgets/types";

interface BudgetBarProps {
  /** Uncapped, so the bar clamps it while the label keeps the true figure. */
  percentUsed: number;
  isOverBudget: boolean;
  /** Where the month has got to, as a percentage. Omit to drop the marker. */
  pacePercent?: number | null;
  /**
   * Names the marker "Today" beneath the bar. Reserved for the whole-month bar,
   * where there is room; the category rows keep the tick unlabelled.
   */
  showPaceLabel?: boolean;
}

/** The filled track on its own, for callers that label it differently. */
export function BudgetBar({
  percentUsed,
  isOverBudget,
  pacePercent,
  showPaceLabel = false,
}: BudgetBarProps) {
  const paceLeft =
    typeof pacePercent === "number" ? barWidth(pacePercent) : null;
  const isLabelled = showPaceLabel && paceLeft !== null;

  return (
    /* Vertical padding is the tick's overhang room; the track can't clip it. */
    <div className={cn("relative py-1", isLabelled && "pb-4")}>
      <div className="h-2 rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            isOverBudget ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${barWidth(percentUsed)}%` }}
        />
      </div>

      {paceLeft !== null && (
        <>
          {/* Decoration: the label below says what it marks, where there is one. */}
          <span
            aria-hidden
            className="absolute top-0 h-4 w-px -translate-x-1/2 bg-muted-foreground"
            style={{ left: `${paceLeft}%` }}
          />

          {isLabelled && (
            <span
              className={cn(
                "absolute bottom-0 text-[10px] leading-none whitespace-nowrap text-muted-foreground",
                paceLabelAlign(paceLeft),
              )}
              style={{ left: `${paceLeft}%` }}
            >
              Today
            </span>
          )}
        </>
      )}
    </div>
  );
}

interface BudgetMeterProps {
  budget: BudgetProgress;
  showPaceLabel?: boolean;
}

/** Bar plus the spend, percentage, what's left and the daily pace. */
export function BudgetMeter({ budget, showPaceLabel }: BudgetMeterProps) {
  const { spent, amount, remaining, percentUsed, isOverBudget } = budget;
  const today = new Date();
  const pace = spendingPace(budget, today);

  return (
    <div className="flex flex-col gap-2">
      <BudgetBar
        percentUsed={percentUsed}
        isOverBudget={isOverBudget}
        pacePercent={monthElapsedPercent(budget.periodStart, today)}
        showPaceLabel={showPaceLabel ?? budget.categoryId === null}
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
