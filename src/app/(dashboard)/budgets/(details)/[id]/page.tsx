"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { APP_ROUTES } from "@/lib/constants";
import { formatMonth } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import {
  TransactionList,
  EditTransactionSheet,
} from "@/features/transactions/components";
import { useBudget } from "@/features/budgets/hooks/use-budget";
import { useBudgetStore } from "@/features/budgets/store";
import { toTransactionFilters } from "@/features/budgets/utils";
import { OVERALL_BUDGET_LABEL } from "@/features/budgets/constants";
import {
  BudgetMeter,
  BudgetNotFound,
  BudgetTransactionsEmpty,
  DeleteBudgetDialog,
  EditBudgetSheet,
} from "@/features/budgets/components";

export default function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();

  const setFormPayload = useBudgetStore((state) => state.setFormPayload);
  const setDeleting = useBudgetStore((state) => state.setDeleting);

  const { data: budget, isLoading, isError } = useBudget(id);

  /**
   * Stable across renders — `useTransactions` keys its infinite query on this
   * object, so a fresh one each render would refetch from page one forever.
   */
  const filters = React.useMemo(
    () => (budget ? { ...toTransactionFilters(budget), size: 20 } : null),
    [budget],
  );

  const {
    data,
    isLoading: transactionsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactions(filters ?? {});

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !budget) return <BudgetNotFound />;

  const label = budget.category ?? OVERALL_BUDGET_LABEL;
  const transactions = data?.pages.flatMap((page) => page.transactions) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Card size="sm">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">{label}</h2>
              <p className="text-xs text-muted-foreground">
                {formatMonth(budget.periodStart.slice(0, 7))}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${label}`}
                onClick={() => setFormPayload(budget)}
              >
                <PencilIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${label}`}
                onClick={() => setDeleting(budget)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          </div>

          <BudgetMeter
            spent={budget.spent}
            amount={budget.amount}
            remaining={budget.remaining}
            percentUsed={budget.percentUsed}
            isOverBudget={budget.isOverBudget}
          />
        </CardContent>
      </Card>

      {transactionsLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <BudgetTransactionsEmpty />
      ) : (
        <TransactionList
          transactions={transactions}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}

      <EditBudgetSheet />
      <DeleteBudgetDialog
        onDeleted={() => router.replace(APP_ROUTES.budgets)}
      />
      <EditTransactionSheet />
    </div>
  );
}
