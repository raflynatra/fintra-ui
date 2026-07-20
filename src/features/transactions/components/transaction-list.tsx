"use client";

import { useEffect, useRef } from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { TRANSACTION_TYPE_COLOR } from "@/features/transactions/constants";
import { TransactionEmpty } from "@/features/transactions/components/transaction-empty";
import { TransactionRow } from "@/features/transactions/components/transaction-row";
import { groupByDate } from "@/features/transactions/utils";
import type { Transaction } from "@/features/transactions/types";

interface TransactionListProps {
  transactions: Transaction[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  hasFilters?: boolean;
}

export function TransactionList({
  transactions,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  hasFilters = false,
}: TransactionListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (transactions.length === 0) {
    return <TransactionEmpty hasFilters={hasFilters} />;
  }

  const groups = groupByDate(transactions);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.date} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2 px-2 text-xs">
            <p className="flex items-baseline gap-1.5">
              <span className="font-semibold text-foreground">
                {group.label.weekday}
              </span>
              <span className="text-muted-foreground">{group.label.date}</span>
            </p>
            <p className="flex items-baseline gap-2 font-semibold whitespace-nowrap">
              <span className={TRANSACTION_TYPE_COLOR.income}>
                {formatCurrency(group.totals.totalIncome)}
              </span>
              <span className={TRANSACTION_TYPE_COLOR.expense}>
                {formatCurrency(group.totals.totalExpense)}
              </span>
            </p>
          </div>
          <Card className="gap-0 divide-y divide-border py-0">
            {group.items.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </Card>
        </div>
      ))}

      {hasMore && (
        <div ref={sentinelRef}>
          {isLoadingMore && <Skeleton className="h-16 w-full" />}
        </div>
      )}
    </div>
  );
}
