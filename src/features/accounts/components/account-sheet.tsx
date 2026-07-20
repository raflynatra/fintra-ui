"use client";

import * as React from "react";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ApiClientError } from "@/lib/api-client";
import { useCreateAccount } from "@/features/accounts/hooks/use-create-account";
import { useUpdateAccount } from "@/features/accounts/hooks/use-update-account";
import { useAccountStore } from "@/features/accounts/store";
import { AccountForm } from "@/features/accounts/components/account-form";
import type { AccountPayload } from "@/features/accounts/types";

export function AccountSheet() {
  const account = useAccountStore((state) => state.editing);
  const open = useAccountStore((state) => state.sheetOpen);
  const setSheetOpen = useAccountStore((state) => state.setSheetOpen);
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const [nameError, setNameError] = React.useState<string>();

  const isEdit = !!account;
  const isPending = createAccount.isPending || updateAccount.isPending;

  const handleError = (error: Error, fallbackTitle: string) => {
    if (
      error instanceof ApiClientError &&
      error.code === "ACCOUNT_ALREADY_EXISTS"
    ) {
      setNameError(error.message);
      return;
    }
    toast.error(fallbackTitle, { description: error.message });
  };

  const onSubmit = (values: AccountPayload) => {
    setNameError(undefined);

    if (account) {
      updateAccount.mutate(
        { id: account.id, payload: values },
        {
          onSuccess: () => {
            toast.success("Account has been successfully updated");
            setSheetOpen(false);
          },
          onError: (error) => handleError(error, "Couldn't update account"),
        },
      );
      return;
    }

    createAccount.mutate(values, {
      onSuccess: (created) => {
        toast.success(`${created.name} has been successfully added`);
        setSheetOpen(false);
      },
      onError: (error) => handleError(error, "Couldn't add account"),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setNameError(undefined);
        setSheetOpen(next);
      }}
    >
      <DialogContent
        showClose={false}
        className="top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-b-0 p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-b sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <AccountForm
          key={account?.id ?? "new"}
          title={isEdit ? "Edit account" : "Add account"}
          description={
            isEdit
              ? "Update this account's name, type or starting balance."
              : "Create an account to record transactions against."
          }
          defaultValues={
            account
              ? {
                  name: account.name,
                  type: account.type,
                  initialBalance: account.initialBalance,
                }
              : { type: "cash" }
          }
          onSubmit={onSubmit}
          isPending={isPending}
          submitLabel={isEdit ? "Save changes" : "Add account"}
          nameError={nameError}
        />
      </DialogContent>
    </Dialog>
  );
}
