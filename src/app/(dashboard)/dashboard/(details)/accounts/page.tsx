"use client";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { useUpdateAccount } from "@/features/accounts/hooks/use-update-account";
import { useAccountStore } from "@/features/accounts/store";
import {
  AccountList,
  AddAccountSheet,
  EditAccountSheet,
  AccountEmpty,
  AccountsSummary,
  ArchiveAccountDialog,
} from "@/features/accounts/components";
import type { Account } from "@/features/accounts/types";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts({ includeArchived: true });
  const updateAccount = useUpdateAccount();

  const setFormPayload = useAccountStore((state) => state.setFormPayload);
  const setArchiving = useAccountStore((state) => state.setArchiving);

  const handleRestore = (account: Account) => {
    updateAccount.mutate(
      { id: account.id, payload: { isArchived: false } },
      {
        onSuccess: () => toast.success(`${account.name} has been restored`),
        onError: (error) =>
          toast.error("Couldn't restore account", {
            description: error.message,
          }),
      },
    );
  };

  const restoringId = updateAccount.isPending
    ? updateAccount.variables?.id
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Accounts</h2>
        {!!accounts?.length && (
          <AddAccountSheet
            trigger={
              <Button type="button" size="sm">
                <PlusIcon className="size-4" />
                Add account
              </Button>
            }
          />
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : !accounts?.length ? (
        <AccountEmpty />
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-6">
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:w-2/5 lg:shrink-0">
            <AccountsSummary accounts={accounts} />
          </aside>
          <div className="min-w-0 flex-1 lg:w-3/5">
            <AccountList
              accounts={accounts}
              onEdit={setFormPayload}
              onArchive={setArchiving}
              onRestore={handleRestore}
              restoringId={restoringId}
            />
          </div>
        </div>
      )}

      <EditAccountSheet />
      <ArchiveAccountDialog />
    </div>
  );
}
