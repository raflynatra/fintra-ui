"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useCreateTransaction } from "@/features/transactions/hooks/use-create-transaction";
import {
  TransactionForm,
  emptyTransactionValues,
} from "@/features/transactions/components/transaction-form";
import type { TransactionPayload } from "@/features/transactions/types";

export function AddTransactionSheet() {
  const [open, setOpen] = React.useState(false);
  const createTransaction = useCreateTransaction();

  const onSubmit = (values: TransactionPayload) => {
    createTransaction.mutate(values, {
      onSuccess: () => {
        toast.success(
          `${values.type === "expense" ? "Expense" : "Income"} added`,
        );
        setOpen(false);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          aria-label="Add transaction"
          size="icon-lg"
          className="size-14 -translate-y-4 rounded-full ring-4 ring-background active:scale-95"
        >
          <PlusIcon className="size-6" strokeWidth={2.5} />
        </Button>
      </DialogTrigger>

      <DialogContent
        showClose={false}
        className="top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-b-0 p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-b sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <TransactionForm
          title="Add transaction"
          description="Record a new expense or income entry."
          defaultValues={emptyTransactionValues}
          onSubmit={onSubmit}
          isPending={createTransaction.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
