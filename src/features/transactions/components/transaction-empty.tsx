"use client";

import { PlusIcon, ReceiptTextIcon, SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AddTransactionSheet } from "@/features/transactions/components/add-transaction-sheet";
import { useTransactionStore } from "../store";

interface TransactionEmptyProps {
  hasFilters?: boolean;
}

export function TransactionEmpty({
  hasFilters = false,
}: TransactionEmptyProps) {
  const clearFilters = useTransactionStore((state) => state.clearFilters);

  if (hasFilters) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>No matching transactions</EmptyTitle>
          <EmptyDescription>
            Nothing matches your current filters. Try adjusting or clearing
            them.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ReceiptTextIcon />
        </EmptyMedia>
        <EmptyTitle>No transactions yet</EmptyTitle>
        <EmptyDescription>
          Add your first transaction to start tracking your income and expenses.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddTransactionSheet
          trigger={
            <Button type="button" size="sm">
              <PlusIcon className="size-4" />
              Add transaction
            </Button>
          }
        />
      </EmptyContent>
    </Empty>
  );
}
