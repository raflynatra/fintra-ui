"use client";

import * as React from "react";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ApiClientError } from "@/lib/api-client";
import { useUpdateAccount } from "@/features/accounts/hooks/use-update-account";
import { useAccountStore } from "@/features/accounts/store";
import { AccountForm } from "@/features/accounts/components/account-form";
import type { AccountPayload } from "@/features/accounts/types";

export function EditAccountSheet() {
  const formPayload = useAccountStore((state) => state.formPayload);
  const resetFormPayload = useAccountStore((state) => state.resetFormPayload);
  const updateAccount = useUpdateAccount();
  const [nameError, setNameError] = React.useState<string>();

  if (!formPayload) return null;

  const onSubmit = (values: AccountPayload) => {
    setNameError(undefined);

    updateAccount.mutate(
      { id: formPayload.id, payload: values },
      {
        onSuccess: () => {
          toast.success("Account has been successfully updated");
          resetFormPayload();
        },
        onError: (error) => {
          if (
            error instanceof ApiClientError &&
            error.code === "ACCOUNT_ALREADY_EXISTS"
          ) {
            setNameError(error.message);
            return;
          }
          toast.error("Couldn't update account", {
            description: error.message,
          });
        },
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

        <AccountForm
          key={formPayload.id}
          title="Edit account"
          description="Update this account's name, type or starting balance."
          defaultValues={{
            name: formPayload.name,
            type: formPayload.type,
            initialBalance: formPayload.initialBalance,
          }}
          onSubmit={onSubmit}
          isPending={updateAccount.isPending}
          submitLabel="Save changes"
          nameError={nameError}
        />
      </DialogContent>
    </Dialog>
  );
}
