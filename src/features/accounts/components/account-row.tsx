"use client";

import { ArchiveIcon, ArchiveRestoreIcon, PencilIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  ACCOUNT_TYPE_ICON,
  ACCOUNT_TYPE_LABEL,
} from "@/features/accounts/constants";
import type { Account } from "@/features/accounts/types";

interface AccountRowProps {
  account: Account;
  onEdit: (account: Account) => void;
  onArchive: (account: Account) => void;
  onRestore: (account: Account) => void;
  isRestoring?: boolean;
}

export function AccountRow({
  account,
  onEdit,
  onArchive,
  onRestore,
  isRestoring = false,
}: AccountRowProps) {
  const Icon = ACCOUNT_TYPE_ICON[account.type];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card p-3",
        account.isArchived && "opacity-60",
      )}
    >
      <div className="shrink-0 rounded-full bg-muted p-2">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{account.name}</p>
        <p className="text-xs text-muted-foreground">
          {ACCOUNT_TYPE_LABEL[account.type]}
          {account.isArchived && " · Archived"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span
          title={formatCurrency(account.balance)}
          className={cn(
            "truncate text-sm font-semibold",
            account.balance < 0 && "text-destructive",
          )}
        >
          {formatCurrency(account.balance)}
        </span>

        {account.isArchived ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Restore ${account.name}`}
            disabled={isRestoring}
            onClick={() => onRestore(account)}
          >
            <ArchiveRestoreIcon className="size-4" />
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${account.name}`}
              onClick={() => onEdit(account)}
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Archive ${account.name}`}
              onClick={() => onArchive(account)}
            >
              <ArchiveIcon className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
