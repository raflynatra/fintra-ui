"use client";

import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUpdateTransaction } from "@/features/transactions/hooks/use-update-transaction";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import type {
  Transaction,
  TransactionPayload,
} from "@/features/transactions/types";

interface EditTransactionSheetProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionSheet({
  transaction,
  open,
  onOpenChange,
}: EditTransactionSheetProps) {
  const updateTransaction = useUpdateTransaction();

  if (!transaction) return null;

  const onSubmit = (values: TransactionPayload) => {
    updateTransaction.mutate(
      { id: transaction.id, payload: values },
      {
        onSuccess: () => {
          toast.success("Transaction has been successfully updated");
          onOpenChange(false);
        },
        onError: (error) =>
          toast.error("Couldn't update transaction", {
            description: error.message,
          }),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-b-0 p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-b sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <TransactionForm
          key={transaction.id}
          title="Edit transaction"
          description="Update this expense or income entry."
          defaultValues={{
            type: transaction.type,
            amount: transaction.amount,
            categoryId: transaction.categoryId ?? "",
            date: transaction.date,
            description: transaction.description ?? "",
          }}
          onSubmit={onSubmit}
          isPending={updateTransaction.isPending}
          submitLabel="Save changes"
        />
      </DialogContent>
    </Dialog>
  );
}
