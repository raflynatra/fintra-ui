"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import {
  TransactionList,
  TransactionFilters,
  EditTransactionSheet,
  DeleteTransactionDialog,
} from "@/features/transactions/components";
import type {
  Transaction,
  TransactionListParams,
  TransactionType,
} from "@/features/transactions/types";

export default function TransactionsPage() {
  const [params, setParams] = useState<TransactionListParams>({
    page: 1,
    size: 10,
  });
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const { data, isLoading } = useTransactions(params);

  const handleTypeChange = (type: TransactionType | undefined) =>
    setParams((p) => ({ ...p, type, page: 1 }));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Transactions</h2>

      <TransactionFilters value={params.type} onChange={handleTypeChange} />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          <TransactionList
            transactions={data?.transactions ?? []}
            onEdit={setEditing}
            onDelete={setDeleting}
          />

          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data.pagination.hasPreviousPage}
                onClick={() =>
                  setParams((p) => ({
                    ...p,
                    page: Math.max(1, (p.page ?? 1) - 1),
                  }))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data.pagination.hasNextPage}
                onClick={() =>
                  setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <EditTransactionSheet
        transaction={editing}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <DeleteTransactionDialog
        transaction={deleting}
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}
