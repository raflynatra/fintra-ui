"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import { useTransactionSummary } from "@/features/transactions/hooks/use-transaction-summary";
import type {
  TransactionListParams,
  TransactionSummary,
} from "@/features/transactions/types";
import {
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  LucideIcon,
} from "lucide-react";

interface TransactionSummaryProps {
  params: TransactionListParams;
}

function Stats({
  label,
  value,
  valueClassName,
  isLoading,
  icon: Icon,
  compact = false,
}: {
  label: string;
  value: number | undefined;
  isLoading: boolean;
  valueClassName?: string;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  const exact = formatCurrency(value ?? 0);
  return (
    <div className="flex min-w-0 items-center gap-2">
      {Icon ? (
        <div className="shrink-0 rounded-full border border-primary-foreground/30 bg-primary-foreground/20 p-1.5 shadow-xl backdrop-blur-md">
          <Icon className="size-4 shrink-0 text-primary-foreground" />
        </div>
      ) : null}
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs text-primary-foreground/70">{label}</p>
        {isLoading ? (
          <Skeleton
            className={cn(label === "Balance" ? "h-7 w-64" : "h-4 w-28")}
          />
        ) : (
          <p
            title={exact}
            className={cn(
              "truncate font-semibold text-primary-foreground",
              valueClassName,
            )}
          >
            {compact ? (
              <>
                {/* Abbreviate only when the card itself is too narrow for the
                    exact figure  */}
                <span className="@sm:hidden">
                  {formatCurrencyCompact(value ?? 0)}
                </span>
                <span className="hidden @sm:inline">{exact}</span>
              </>
            ) : (
              exact
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export function TransactionSummary({ params }: TransactionSummaryProps) {
  const { data, isLoading } = useTransactionSummary(params);

  return (
    <Card className="@container gap-4 bg-primary px-4 py-3 shadow-lg">
      <Stats
        label="Balance"
        value={data?.balance}
        isLoading={isLoading}
        valueClassName="text-2xl"
      />
      <div className="grid grid-cols-2">
        <Stats
          label="Income"
          value={data?.totalIncome}
          isLoading={isLoading}
          icon={BanknoteArrowUpIcon}
          compact
        />
        <Stats
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
