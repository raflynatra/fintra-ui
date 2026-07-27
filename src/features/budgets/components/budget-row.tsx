"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { APP_ROUTES } from "@/lib/constants";
import { BudgetMeter } from "@/features/budgets/components/budget-meter";
import { OVERALL_BUDGET_LABEL } from "@/features/budgets/constants";
import type { BudgetProgress } from "@/features/budgets/types";

interface BudgetRowProps {
  budget: BudgetProgress;
}

/** A budget at a glance. Editing and deleting live on the detail page. */
export function BudgetRow({ budget }: BudgetRowProps) {
  const label = budget.category ?? OVERALL_BUDGET_LABEL;

  return (
    <Link
      href={`${APP_ROUTES.budgets}/${budget.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{label}</p>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </div>

      <BudgetMeter budget={budget} />
    </Link>
  );
}
