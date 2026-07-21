"use client";

import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useTransactionStore } from "@/features/transactions/store";
import { hasActiveFilters, toQueryParams } from "@/features/transactions/utils";
import {
  TransactionList,
  TransactionFilterBar,
  TransactionSummary,
  EditTransactionSheet,
} from "@/features/transactions/components";

export default function TransactionsPage() {
  const params = useTransactionStore((state) => state.params);
  const month = useTransactionStore((state) => state.month);

  const queryParams = useMemo(
    () => toQueryParams(params, month),
    [params, month],
  );

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTransactions(queryParams);

  const transactions = data?.pages.flatMap((page) => page.transactions) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <h2 className="text-2xl font-bold">Transactions</h2>

      <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-6">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:w-2/5 lg:shrink-0">
          <TransactionSummary params={queryParams} />
          <TransactionFilterBar />
        </aside>

        <div className="min-w-0 flex-1 lg:w-3/5">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <TransactionList
              transactions={transactions}
              hasMore={hasNextPage}
              isLoadingMore={isFetchingNextPage}
              onLoadMore={fetchNextPage}
              hasFilters={hasActiveFilters(params)}
            />
          )}
        </div>
      </div>

      <EditTransactionSheet />
    </div>
  );
}
