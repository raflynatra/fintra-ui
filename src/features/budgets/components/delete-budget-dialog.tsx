"use client";

import type * as React from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteBudget } from "@/features/budgets/hooks/use-delete-budget";
import { useBudgetStore } from "@/features/budgets/store";
import { OVERALL_BUDGET_LABEL } from "@/features/budgets/constants";

export function DeleteBudgetDialog() {
  const budget = useBudgetStore((state) => state.deleting);
  const setDeleting = useBudgetStore((state) => state.setDeleting);
  const deleteBudget = useDeleteBudget();

  if (!budget) return null;

  const label = budget.category ?? OVERALL_BUDGET_LABEL;

  const handleConfirm = (event: React.MouseEvent) => {
    event.preventDefault();
    deleteBudget.mutate(budget.id, {
      onSuccess: () => {
        toast.success(`${label} budget has been deleted`);
        setDeleting(null);
      },
      onError: (error) =>
        toast.error("Couldn't delete budget", { description: error.message }),
    });
  };

  return (
    <AlertDialog open onOpenChange={(next) => !next && setDeleting(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete the {label} budget?</AlertDialogTitle>
          <AlertDialogDescription>
            This budget is removed for good — it can&apos;t be restored. Your
            transactions are untouched.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteBudget.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteBudget.isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
