import Link from "next/link";
import { AlertTriangleIcon, CircleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { budgetsNeedingAttention } from "@/features/budgets/utils";
import { OVERALL_BUDGET_LABEL } from "@/features/budgets/constants";
import type { BudgetProgress } from "@/features/budgets/types";

interface AttentionRowProps {
  budget: BudgetProgress;
  isOver: boolean;
}

function AttentionRow({ budget, isOver }: AttentionRowProps) {
  const label = budget.category ?? OVERALL_BUDGET_LABEL;
  const Icon = isOver ? AlertTriangleIcon : CircleAlertIcon;

  return (
    <li>
      <Link
        href={`${APP_ROUTES.budgets}/${budget.id}`}
        className="flex items-center gap-2 rounded-md py-1 text-sm transition-colors hover:bg-muted"
      >
        {/* Icon plus label, so the state never rests on colour alone. */}
        <Icon
          className={cn(
            "size-4 shrink-0",
            isOver ? "text-destructive" : "text-muted-foreground",
          )}
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span
          className={cn(
            "shrink-0 text-xs",
            isOver ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {isOver
            ? `${formatCurrency(Math.abs(budget.remaining))} over`
            : `${formatCurrency(budget.remaining)} left`}
        </span>
        <span className="w-10 shrink-0 text-right text-xs font-medium text-muted-foreground tabular-nums">
          {Math.round(budget.percentUsed)}%
        </span>
      </Link>
    </li>
  );
}

interface BudgetAttentionCardProps {
  budgets: BudgetProgress[];
}

/** Budgets past their cap or closing in on it. Absent when nothing is at risk. */
export function BudgetAttentionCard({ budgets }: BudgetAttentionCardProps) {
  const { over, near } = budgetsNeedingAttention(budgets);
  if (!over.length && !near.length) return null;

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Needs attention</h3>

        <ul className="flex flex-col gap-1">
          {over.map((budget) => (
            <AttentionRow key={budget.id} budget={budget} isOver />
          ))}
          {near.map((budget) => (
            <AttentionRow key={budget.id} budget={budget} isOver={false} />
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          {over.length > 0 && `${over.length} over budget`}
          {over.length > 0 && near.length > 0 && " · "}
          {near.length > 0 && `${near.length} close`}
        </p>
      </CardContent>
    </Card>
  );
}
