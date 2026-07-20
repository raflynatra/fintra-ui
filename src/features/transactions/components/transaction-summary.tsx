"use client";

import { Card } from "@/components/ui/card";
import { useTransactionSummary } from "@/features/transactions/hooks/use-transaction-summary";
import type {
  TransactionListParams,
  TransactionSummary,
} from "@/features/transactions/types";
import { BanknoteArrowDownIcon, BanknoteArrowUpIcon } from "lucide-react";
import { TransactionSummaryStats } from "./transaction-summary-stats";

interface TransactionSummaryProps {
  params: TransactionListParams;
}

export function TransactionSummary({ params }: TransactionSummaryProps) {
  const { data, isLoading } = useTransactionSummary(params);

  return (
    <Card className="@container gap-4 bg-primary px-4 py-3 shadow-lg">
      <TransactionSummaryStats
        label="Balance"
        value={data?.balance}
        isLoading={isLoading}
        valueClassName="text-2xl"
      />
      <div className="grid grid-cols-2">
        <TransactionSummaryStats
          label="Income"
          value={data?.totalIncome}
          isLoading={isLoading}
          icon={BanknoteArrowUpIcon}
          compact
        />
        <TransactionSummaryStats
          label="Expense"
          value={data?.totalExpense}
          isLoading={isLoading}
          icon={BanknoteArrowDownIcon}
          compact
        />
      </div>
    </Card>
  );
}
