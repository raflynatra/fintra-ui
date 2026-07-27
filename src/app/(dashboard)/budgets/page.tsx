"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthNav } from "@/components/dashboard";
import { useBudgetProgress } from "@/features/budgets/hooks/use-budget-progress";
import { useBudgetStore } from "@/features/budgets/store";
import { hasOverallBudget, toPeriodStart } from "@/features/budgets/utils";
import {
  AddBudgetSheet,
  BudgetAttentionCard,
  BudgetBreakdownCard,
  BudgetEmpty,
  BudgetList,
  BudgetSummary,
} from "@/features/budgets/components";

export default function BudgetsPage() {
  const month = useBudgetStore((state) => state.month);
  const setMonth = useBudgetStore((state) => state.setMonth);

  const { data: budgets, isLoading } = useBudgetProgress(toPeriodStart(month));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Budgets</h2>
        {!!budgets?.length && (
          <AddBudgetSheet
            trigger={
              <Button type="button" size="sm">
                <PlusIcon className="size-4" />
                Add budget
              </Button>
            }
          />
        )}
      </div>

      <MonthNav value={month} onChange={setMonth} />

      {/*
        Column-reverse on mobile puts the budgets themselves above the insight
        cards; the same DOM order keeps the rail on the right at desktop.
      */}
      <div className="flex flex-col-reverse gap-4 lg:flex-row-reverse lg:items-start lg:gap-6">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:w-2/5 lg:shrink-0">
          {!!budgets?.length && !hasOverallBudget(budgets) && (
            <BudgetSummary budgets={budgets} />
          )}
          {!!budgets?.length && (
            <>
              <BudgetAttentionCard budgets={budgets} />
              <BudgetBreakdownCard budgets={budgets} />
            </>
          )}
        </aside>

        <div className="min-w-0 flex-1 lg:w-3/5">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))}
            </div>
          ) : !budgets?.length ? (
            <BudgetEmpty />
          ) : (
            <BudgetList budgets={budgets} />
          )}
        </div>
      </div>
    </div>
  );
}
