"use client";

import { PiggyBankIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AddBudgetSheet } from "@/features/budgets/components/add-budget-sheet";

export function BudgetEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PiggyBankIcon />
        </EmptyMedia>
        <EmptyTitle>No budgets this month</EmptyTitle>
        <EmptyDescription>
          Set a cap on what a category can take, or one for the month as a
          whole, and watch it fill as you spend.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddBudgetSheet
          trigger={
            <Button type="button" size="sm">
              <PlusIcon className="size-4" />
              Add budget
            </Button>
          }
        />
      </EmptyContent>
    </Empty>
  );
}
