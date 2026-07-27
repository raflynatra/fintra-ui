"use client";

import { sortBudgets } from "@/features/budgets/utils";
import { BudgetRow } from "@/features/budgets/components/budget-row";
import type { BudgetProgress } from "@/features/budgets/types";

interface BudgetListProps {
  budgets: BudgetProgress[];
  onEdit: (budget: BudgetProgress) => void;
  onDelete: (budget: BudgetProgress) => void;
}

export function BudgetList({ budgets, onEdit, onDelete }: BudgetListProps) {
  return (
    <div className="flex flex-col gap-2">
      {sortBudgets(budgets).map((budget) => (
        <BudgetRow
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
