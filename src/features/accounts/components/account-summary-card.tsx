"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { APP_ROUTES } from "@/lib/constants";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ACCOUNT_TYPE_ICON,
  ACCOUNT_TYPE_LABEL,
} from "@/features/accounts/constants";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import type { Account } from "@/features/accounts/types";

/** Number of accounts previewed on the Overview card; the rest sit behind "View all". */
const PREVIEW_COUNT = 3;

/**
 * Overview-page entry point into the accounts feature: previews the top few
 * account balances and links to the full `/accounts` management page.
 */
export function AccountSummaryCard() {
  const { data: accounts, isPending, isError } = useAccounts();

  const sorted = accounts
    ? [...accounts].sort((a, b) => b.balance - a.balance)
    : [];
  const preview = sorted.slice(0, PREVIEW_COUNT);
  const remaining = sorted.length - preview.length;

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Accounts</CardTitle>
        <CardAction>
          <Link
            href={APP_ROUTES.accounts}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRightIcon className="size-4" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {isPending ? (
          Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))
        ) : isError ? (
          <p className="py-2 text-sm text-muted-foreground">
            Couldn&apos;t load accounts.
          </p>
        ) : preview.length === 0 ? (
          <div className="flex flex-col items-start gap-2 py-2">
            <p className="text-sm text-muted-foreground">
              No accounts yet. Add one to start recording transactions.
            </p>
            <Link
              href={APP_ROUTES.accounts}
              className="text-sm font-medium text-primary hover:underline"
            >
              Add an account
            </Link>
          </div>
        ) : (
          <>
            {preview.map((account) => (
              <AccountSummaryRow key={account.id} account={account} />
            ))}
            {remaining > 0 && (
              <p className="pt-1 text-xs text-muted-foreground">
                +{remaining} more {remaining === 1 ? "account" : "accounts"}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface AccountSummaryRowProps {
  account: Account;
}

function AccountSummaryRow({ account }: AccountSummaryRowProps) {
  const Icon = ACCOUNT_TYPE_ICON[account.type];

  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 rounded-full bg-muted p-2">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{account.name}</p>
        <p className="text-xs text-muted-foreground">
          {ACCOUNT_TYPE_LABEL[account.type]}
        </p>
      </div>

      <span
        title={formatCurrency(account.balance)}
        className={cn(
          "shrink-0 truncate text-sm font-semibold",
          account.balance < 0 && "text-destructive",
        )}
      >
        {formatCurrency(account.balance)}
      </span>
    </div>
  );
}
