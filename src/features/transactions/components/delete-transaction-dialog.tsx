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
import { formatCurrency } from "@/lib/format";
import { useDeleteTransaction } from "@/features/transactions/hooks/use-delete-transaction";
import type { Transaction } from "@/features/transactions/types";

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Called after a successful delete, once this dialog has closed itself. The
   * edit sheet uses it to close too — the record it was editing is gone.
   */
  onDeleted?: () => void;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTransactionDialogProps) {
  const deleteTransaction = useDeleteTransaction();

  if (!transaction) return null;

  const handleConfirm = (event: React.MouseEvent) => {
    // Radix closes the dialog on click by default; prevent that so it stays
    // open (showing the pending state) until the mutation settles.
    event.preventDefault();
    deleteTransaction.mutate(transaction.id, {
      onSuccess: () => {
        toast.success("Transaction has been successfully deleted");
        onOpenChange(false);
        onDeleted?.();
      },
      onError: (error) =>
        toast.error("Couldn't delete transaction", {
          description: error.message,
        }),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            {formatCurrency(transaction.amount)}
            {transaction.description
              ? ` — ${transaction.description}`
              : ""}{" "}
            will be permanently removed. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTransaction.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteTransaction.isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
