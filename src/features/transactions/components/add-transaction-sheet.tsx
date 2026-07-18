"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import { useCreateTransaction } from "@/features/transactions/hooks/use-create-transaction";
import { TRANSACTION_TYPE_LABEL } from "@/features/transactions/constants";
import {
  TransactionForm,
  emptyTransactionValues,
} from "@/features/transactions/components/transaction-form";
import type { TransactionFormValues } from "@/features/transactions/types";

interface AddTransactionSheetProps {
  /**
   * Custom element to open the sheet. Defaults to the raised circular FAB,
   * which is styled for the mobile bottom nav; desktop callers pass their own.
   */
  trigger?: React.ReactNode;
}

export function AddTransactionSheet({ trigger }: AddTransactionSheetProps) {
  const [open, setOpen] = React.useState(false);
  const createTransaction = useCreateTransaction();

  // Recomputed per open so `date` is today's, not the date the tab was loaded.
  // Must be stable across renders — the form resets whenever this identity
  // changes, which would wipe the user's input on every keystroke.
  const defaultValues = React.useMemo(
    () => emptyTransactionValues(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  const onSubmit = (values: TransactionFormValues) => {
    createTransaction.mutate(values, {
      // The created record comes back with its category and account names
      // resolved, so the description can confirm exactly what was recorded.
      onSuccess: (created) => {
        toast.success(
          `${TRANSACTION_TYPE_LABEL[created.type]} has been successfully added`,
          {
            description:
              created.type === "transfer"
                ? `${formatCurrency(created.amount)} · ${created.account} → ${created.toAccount}`
                : created.category
                  ? `${formatCurrency(created.amount)} · ${created.category}`
                  : formatCurrency(created.amount),
          },
        );
        setOpen(false);
      },
      onError: (error) =>
        toast.error("Couldn't add transaction", { description: error.message }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            aria-label="Add transaction"
            size="icon-lg"
            className="size-14 -translate-y-4 rounded-full ring-4 ring-background active:scale-95"
          >
            <PlusIcon className="size-6" strokeWidth={2.5} />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        showClose={false}
        className="top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-b-0 p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-b sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <TransactionForm
          title="Add transaction"
          description="Record a new expense, income or transfer."
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isPending={createTransaction.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
