"use client";

import Link from "next/link";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { APP_ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { BudgetMeter } from "@/features/budgets/components/budget-meter";
import { OVERALL_BUDGET_LABEL } from "@/features/budgets/constants";
import type { BudgetProgress } from "@/features/budgets/types";

interface BudgetRowProps {
  budget: BudgetProgress;
  onEdit: (budget: BudgetProgress) => void;
  onDelete: (budget: BudgetProgress) => void;
}

export function BudgetRow({ budget, onEdit, onDelete }: BudgetRowProps) {
  const label = budget.category ?? OVERALL_BUDGET_LABEL;

  return (
    <div className="relative rounded-lg border border-border bg-card">
      <Link
        href={`${APP_ROUTES.budgets}/${budget.id}`}
        className="flex flex-col gap-2 rounded-lg p-3 transition-colors hover:bg-muted/50"
      >
        {/* Right padding keeps the name clear of the action buttons above it. */}
        <p className="truncate pr-20 text-sm font-medium">{label}</p>

        <BudgetMeter
          spent={budget.spent}
          amount={budget.amount}
          remaining={budget.remaining}
          percentUsed={budget.percentUsed}
          isOverBudget={budget.isOverBudget}
        />
      </Link>

      {/* Siblings of the link, never children — an anchor can't nest buttons. */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${label}`}
          onClick={() => onEdit(budget)}
        >
          <PencilIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${label}`}
          onClick={() => onDelete(budget)}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
