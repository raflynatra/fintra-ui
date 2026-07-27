"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { barWidth } from "@/features/budgets/utils";
import { OVERALL_BUDGET_LABEL } from "@/features/budgets/constants";
import type { BudgetProgress } from "@/features/budgets/types";

interface BudgetRowProps {
  budget: BudgetProgress;
  onEdit: (budget: BudgetProgress) => void;
  onDelete: (budget: BudgetProgress) => void;
}

export function BudgetRow({ budget, onEdit, onDelete }: BudgetRowProps) {
  const { category, amount, spent, remaining, percentUsed, isOverBudget } =
    budget;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {category ?? OVERALL_BUDGET_LABEL}
        </p>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${category ?? OVERALL_BUDGET_LABEL}`}
          onClick={() => onEdit(budget)}
        >
          <PencilIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${category ?? OVERALL_BUDGET_LABEL}`}
          onClick={() => onDelete(budget)}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            isOverBudget ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${barWidth(percentUsed)}%` }}
        />
      </div>

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
