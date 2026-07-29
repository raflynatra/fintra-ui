"use client";

import { Card } from "@/components/ui/card";
import { useTransactionSummary } from "@/features/transactions/hooks/use-transaction-summary";
import { monthRange } from "@/lib/date";
import { BanknoteArrowDownIcon, BanknoteArrowUpIcon } from "lucide-react";
import { TransactionSummaryStats } from "./transaction-summary-stats";

interface TransactionSummaryProps {
  /** The selected period as "YYYY-MM". */
  month: string;
}

export function TransactionSummary({ month }: TransactionSummaryProps) {
  const { data, isLoading } = useTransactionSummary(monthRange(month));

  return (
    <Card className="@container gap-4 bg-primary px-4 py-3 shadow-lg">
      <TransactionSummaryStats
        label="Net"
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
