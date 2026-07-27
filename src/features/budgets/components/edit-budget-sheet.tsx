"use client";

import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUpdateBudget } from "@/features/budgets/hooks/use-update-budget";
import { useBudgetStore } from "@/features/budgets/store";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { OVERALL_BUDGET_LABEL } from "@/features/budgets/constants";
import type { BudgetPayload } from "@/features/budgets/types";

export function EditBudgetSheet() {
  const formPayload = useBudgetStore((state) => state.formPayload);
  const resetFormPayload = useBudgetStore((state) => state.resetFormPayload);
  const updateBudget = useUpdateBudget();

  if (!formPayload) return null;

  /** `PUT /api/budgets/{id}` takes an amount and nothing else. */
  const onSubmit = ({ amount }: BudgetPayload) => {
    updateBudget.mutate(
      { id: formPayload.id, payload: { amount } },
      {
        onSuccess: () => {
          toast.success("Budget has been successfully updated");
          resetFormPayload();
        },
        onError: (error) =>
          toast.error("Couldn't update budget", { description: error.message }),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(next) => !next && resetFormPayload()}>
      <DialogContent
        showClose={false}
        className="top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-b-0 p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-b sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <BudgetForm
          key={formPayload.id}
          title="Edit budget"
          description="Change how much this budget allows for the month."
          defaultValues={{
            categoryId: formPayload.categoryId,
            amount: formPayload.amount,
            periodStart: formPayload.periodStart,
          }}
          onSubmit={onSubmit}
          isPending={updateBudget.isPending}
          submitLabel="Save changes"
          lockedCategoryLabel={formPayload.category ?? OVERALL_BUDGET_LABEL}
        />
      </DialogContent>
    </Dialog>
  );
}
