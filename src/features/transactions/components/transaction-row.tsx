"use client";

import { Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatTransactionDate } from "@/lib/format";
import { TRANSACTION_TYPE_COLOR } from "@/features/transactions/constants";
import type { Transaction } from "@/features/transactions/types";

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionRow({
  transaction,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {transaction.category ?? "Uncategorized"}
        </p>
        {transaction.description && (
          <p className="truncate text-xs text-muted-foreground">
            {transaction.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatTransactionDate(transaction.date)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span
          className={cn(
            "text-sm font-semibold",
            TRANSACTION_TYPE_COLOR[transaction.type],
          )}
        >
          {transaction.type === "expense" ? "-" : "+"}
          {formatCurrency(transaction.amount)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Edit transaction"
          onClick={() => onEdit(transaction)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Delete transaction"
          onClick={() => onDelete(transaction)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
