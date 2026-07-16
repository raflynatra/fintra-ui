"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import {
  TransactionList,
  TransactionFilterBar,
  TransactionSummary,
  EditTransactionSheet,
  DeleteTransactionDialog,
} from "@/features/transactions/components";
import type {
  Transaction,
  TransactionListParams,
} from "@/features/transactions/types";

export default function TransactionsPage() {
  const [params, setParams] = useState<Omit<TransactionListParams, "page">>({
    size: 10,
  });
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTransactions(params);

  const transactions = data?.pages.flatMap((page) => page.transactions) ?? [];

  const handleFilterChange = (
    next: Pick<
      TransactionListParams,
      "type" | "categoryId" | "dateFrom" | "dateTo"
    >,
  ) => setParams((params) => ({ ...params, ...next }));

  const hasFilters = !!(
    params.type ||
    params.categoryId ||
    params.dateFrom ||
    params.dateTo
  );

  const handleClearFilters = () =>
    setParams((params) => ({
      ...params,
      type: undefined,
      categoryId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <h2 className="text-2xl font-bold">Transactions</h2>

      <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:w-96 lg:shrink-0">
          <TransactionSummary params={params} />

          <TransactionFilterBar
            type={params.type}
            categoryId={params.categoryId}
            dateFrom={params.dateFrom}
            dateTo={params.dateTo}
            onChange={handleFilterChange}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <TransactionList
              transactions={transactions}
              onEdit={setEditing}
              onDelete={setDeleting}
              hasMore={hasNextPage}
              isLoadingMore={isFetchingNextPage}
              onLoadMore={fetchNextPage}
              hasFilters={hasFilters}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>
      </div>

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
