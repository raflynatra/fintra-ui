"use client";

import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
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
          {transaction.category ?? "Uncategorized"}
        </p>
        {transaction.description && (
          <p className="truncate text-xs text-muted-foreground">
            {transaction.description}
          </p>
        )}
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
          aria-label="Delete transaction"
          className="hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(transaction);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
