import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { spendBreakdown } from "@/features/budgets/utils";
import type { BudgetProgress, SpendSegment } from "@/features/budgets/types";

/**
 * Categorical slots, assigned in fixed order and never cycled — the tail folds
 * into one segment upstream in `spendBreakdown`. Validated against this app's
 * card surfaces in both modes; the light steps sit below 3:1 contrast, which the
 * legend's visible labels relieve. The remainder is deliberately neutral so it
 * reads as "the rest" rather than as another category.
 */
const SEGMENT_CLASS = [
  "bg-viz-1",
  "bg-viz-2",
  "bg-viz-3",
  "bg-viz-4",
  "bg-viz-5",
  "bg-viz-6",
  "bg-viz-7",
];

const REMAINDER_CLASS = "bg-viz-remainder";

function segmentClass(segment: SpendSegment, index: number): string {
  return segment.isRemainder
    ? REMAINDER_CLASS
    : SEGMENT_CLASS[index % SEGMENT_CLASS.length];
}

interface BudgetBreakdownCardProps {
  budgets: BudgetProgress[];
}

/** Where the month's spending went, with anything unbudgeted as the last slice. */
export function BudgetBreakdownCard({ budgets }: BudgetBreakdownCardProps) {
  const segments = spendBreakdown(budgets);
  if (!segments.length) return null;

  const total = segments.reduce((sum, segment) => sum + segment.amount, 0);

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-medium">Where it went</h3>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(total)}
          </p>
        </div>

        {/* 2px surface gaps between segments; 4px rounded ends. */}
        <div className="flex h-4 gap-[2px] overflow-hidden rounded-sm bg-muted">
          {segments.map((segment, index) => (
            <div
              key={segment.label}
              className={segmentClass(segment, index)}
              style={{ width: `${segment.share * 100}%` }}
            />
          ))}
        </div>

        <ul className="flex flex-col gap-2">
          {segments.map((segment, index) => (
            <li key={segment.label} className="flex items-center gap-2 text-sm">
              <span
                className={`size-2.5 shrink-0 rounded-full ${segmentClass(segment, index)}`}
              />
              <span className="min-w-0 flex-1 truncate">{segment.label}</span>
              <span className="font-medium">
                {formatCurrency(segment.amount)}
              </span>
              <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {Math.round(segment.share * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
