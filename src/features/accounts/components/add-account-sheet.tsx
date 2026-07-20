"use client";

import * as React from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ApiClientError } from "@/lib/api-client";
import { useCreateAccount } from "@/features/accounts/hooks/use-create-account";
import { AccountForm } from "@/features/accounts/components/account-form";
import type { AccountPayload } from "@/features/accounts/types";

interface AddAccountSheetProps {
  trigger: React.ReactNode;
}

export function AddAccountSheet({ trigger }: AddAccountSheetProps) {
  const [open, setOpen] = React.useState(false);
  const createAccount = useCreateAccount();
  const [nameError, setNameError] = React.useState<string>();

  const onSubmit = (values: AccountPayload) => {
    setNameError(undefined);

    createAccount.mutate(values, {
      onSuccess: (created) => {
        toast.success(`${created.name} has been successfully added`);
        setOpen(false);
      },
      onError: (error) => {
        if (
          error instanceof ApiClientError &&
          error.code === "ACCOUNT_ALREADY_EXISTS"
        ) {
          setNameError(error.message);
          return;
        }
        toast.error("Couldn't add account", { description: error.message });
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setNameError(undefined);
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        showClose={false}
        className="top-auto bottom-0 left-0 max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-b-0 p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border-b sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <AccountForm
          title="Add account"
          description="Create an account to record transactions against."
          defaultValues={{ type: "cash" }}
          onSubmit={onSubmit}
          isPending={createAccount.isPending}
          submitLabel="Add account"
          nameError={nameError}
        />
      </DialogContent>
    </Dialog>
  );
}
