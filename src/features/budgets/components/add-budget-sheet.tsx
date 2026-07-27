"use client";

import * as React from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ApiClientError } from "@/lib/api-client";
import { useCreateBudget } from "@/features/budgets/hooks/use-create-budget";
import { useBudgetStore } from "@/features/budgets/store";
import { toPeriodStart } from "@/features/budgets/utils";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import type { BudgetPayload } from "@/features/budgets/types";

interface AddBudgetSheetProps {
  trigger: React.ReactNode;
}

export function AddBudgetSheet({ trigger }: AddBudgetSheetProps) {
  const [open, setOpen] = React.useState(false);
  const month = useBudgetStore((state) => state.month);
  const createBudget = useCreateBudget();
  const [categoryError, setCategoryError] = React.useState<string>();

  const defaultValues = React.useMemo<Partial<BudgetPayload>>(
    () => ({
      categoryId: null,
      periodStart: toPeriodStart(month),
    }),
    [month],
  );

  const onSubmit = (values: BudgetPayload) => {
    setCategoryError(undefined);

    createBudget.mutate(values, {
      onSuccess: () => {
        toast.success("Budget has been successfully added");
        setOpen(false);
      },
      onError: (error) => {
        if (
          error instanceof ApiClientError &&
          error.code === "BUDGET_ALREADY_EXISTS"
        ) {
          setCategoryError(error.message);
          return;
        }
        toast.error("Couldn't add budget", { description: error.message });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        showClose={false}
        className="top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-b-0 p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-b sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <BudgetForm
          key={month}
          title="Add budget"
          description="Set a spending cap for a category, or for the month as a whole."
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isPending={createBudget.isPending}
          submitLabel="Add budget"
          categoryError={categoryError}
        />
      </DialogContent>
    </Dialog>
  );
}
