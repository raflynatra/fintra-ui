"use client";

import { Card } from "@/components/ui/card";
import { TransactionRow } from "@/features/transactions/components/transaction-row";
import type { Transaction } from "@/features/transactions/types";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No transactions yet. Tap the + button to add one.
      </p>
    );
  }

  return (
    <Card className="gap-0 divide-y divide-border px-4 py-0">
      {transactions.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Card>
  );
}
