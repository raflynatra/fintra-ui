"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUpdateTransaction } from "@/features/transactions/hooks/use-update-transaction";
import { useTransactionStore } from "@/features/transactions/store";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { DeleteTransactionDialog } from "@/features/transactions/components/delete-transaction-dialog";
import type { TransactionFormValues } from "@/features/transactions/types";

/**
 * The backend rejects converting a transaction into or out of a transfer
 * (TRANSFER_TYPE_IMMUTABLE, 409). So a transfer's type is shown read-only, and
 * everything else may only move between income and expense.
 */
const EDITABLE_TYPES = ["expense", "income"] as const;

/**
 * Opens on whatever `editing` holds in the store. Delete is confirmed from in
 * here and acts on that same record, so the caller doesn't track a separate
 * "deleting" selection.
 */
export function EditTransactionSheet() {
  const transaction = useTransactionStore((state) => state.editing);
  const closeEdit = useTransactionStore((state) => state.closeEdit);
  const updateTransaction = useUpdateTransaction();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  if (!transaction) return null;

  const isTransfer = transaction.type === "transfer";

  const onSubmit = (values: TransactionFormValues) => {
    updateTransaction.mutate(
      { id: transaction.id, values },
      {
        onSuccess: () => {
          toast.success("Transaction has been successfully updated");
          closeEdit();
        },
        onError: (error) =>
          toast.error("Couldn't update transaction", {
            description: error.message,
          }),
      },
    );
  };

  return (
    <>
      <Dialog open onOpenChange={(next) => !next && closeEdit()}>
        <DialogContent
          showClose={false}
          className="top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-b-0 p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-b sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

          <TransactionForm
            key={transaction.id}
            title="Edit transaction"
            description="Update this transaction."
            defaultValues={{
              type: transaction.type,
              amount: transaction.amount,
              accountId: transaction.accountId,
              categoryId: transaction.categoryId ?? "",
              toAccountId: transaction.toAccountId ?? "",
              date: transaction.date,
              description: transaction.description ?? "",
            }}
            onSubmit={onSubmit}
            isPending={updateTransaction.isPending}
            submitLabel="Save changes"
            includeArchivedAccounts
            typeOptions={EDITABLE_TYPES}
            readOnlyType={isTransfer}
            headerAction={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Delete transaction"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            }
          />
        </DialogContent>
      </Dialog>

      <DeleteTransactionDialog
        transaction={transaction}
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        // The record is gone, so the sheet behind this has nothing left to edit.
        onDeleted={closeEdit}
      />
    </>
  );
}
