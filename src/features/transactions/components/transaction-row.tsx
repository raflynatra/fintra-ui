"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import {
  TRANSACTION_TYPE_COLOR,
  TRANSACTION_TYPE_SIGN,
} from "@/features/transactions/constants";
import type { Transaction } from "@/features/transactions/types";

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
}

// The whole row opens the edit sheet; deleting is confirmed from inside it.
export function TransactionRow({ transaction, onEdit }: TransactionRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(transaction)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(transaction);
        }
      }}
      className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {transaction.type === "transfer"
            ? "Transfer"
            : (transaction.category ?? "Uncategorized")}
        </p>
        {transaction.description && (
          <p className="truncate text-xs text-muted-foreground">
            {transaction.description}
          </p>
        )}
      </div>

      <div className="text-end">
        <p
          className={cn(
            "text-sm font-semibold",
            TRANSACTION_TYPE_COLOR[transaction.type],
          )}
        >
          {TRANSACTION_TYPE_SIGN[transaction.type]}
          {formatCurrency(transaction.amount)}
        </p>

        <p className="text-xs text-muted-foreground">
          {transaction.type === "transfer"
            ? `${transaction.account} to ${transaction.toAccount}`
            : transaction.account}
        </p>
      </div>
    </div>
  );
}
