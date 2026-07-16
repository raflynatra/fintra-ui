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

interface TransactionEmptyProps {
  /** Active filters mean the list is empty by choice, not because there's no data. */
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function TransactionEmpty({
  hasFilters = false,
  onClearFilters,
}: TransactionEmptyProps) {
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
          <Button variant="outline" size="sm" onClick={onClearFilters}>
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
        {/* Its own trigger, so the copy stays true on both mobile and desktop. */}
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
