"use client";

import { AccountRow } from "@/features/accounts/components/account-row";
import type { Account } from "@/features/accounts/types";

interface AccountListProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onArchive: (account: Account) => void;
  onRestore: (account: Account) => void;
  /** Id of the account currently being restored, if any. */
  restoringId?: string;
}

export function AccountList({
  accounts,
  onEdit,
  onArchive,
  onRestore,
  restoringId,
}: AccountListProps) {
  const active = accounts.filter((account) => !account.isArchived);
  const archived = accounts.filter((account) => account.isArchived);

  const renderRow = (account: Account) => (
    <AccountRow
      key={account.id}
      account={account}
      onEdit={onEdit}
      onArchive={onArchive}
      onRestore={onRestore}
      isRestoring={restoringId === account.id}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">{active.map(renderRow)}</div>

      {archived.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="px-1 text-xs font-medium text-muted-foreground">
            Archived
          </h3>
          {archived.map(renderRow)}
        </div>
      )}
    </div>
  );
}
