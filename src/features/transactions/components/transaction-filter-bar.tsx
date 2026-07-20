"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionFilters } from "@/features/transactions/components/transaction-filters";
import { useTransactionStore } from "@/features/transactions/store";
import { useCategories, toCategoryType } from "@/features/categories";
import { useAccounts } from "@/features/accounts";

function toDateRange(
  dateFrom: string | undefined,
  dateTo: string | undefined,
): DateRange | undefined {
  if (!dateFrom && !dateTo) return undefined;
  return {
    from: dateFrom ? parseISO(dateFrom) : undefined,
    to: dateTo ? parseISO(dateTo) : undefined,
  };
}

export function TransactionFilterBar() {
  const { type, categoryId, accountId, dateFrom, dateTo } = useTransactionStore(
    (state) => state.params,
  );
  const onChange = useTransactionStore((state) => state.setFilters);

  const { data: categories, isLoading: categoriesLoading } = useCategories(
    toCategoryType(type),
  );
  const { data: accounts, isLoading: accountsLoading } = useAccounts({
    includeArchived: true,
  });

  const isTransfer = type === "transfer";

  const dateRange = toDateRange(dateFrom, dateTo);
  const hasDateRange = !!dateFrom || !!dateTo;

  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
      : format(dateRange.from, "MMM d, yyyy")
    : "Date range";

  return (
    <div className="flex flex-col gap-2">
      <TransactionFilters
        value={type}
        onChange={(nextType) =>
          onChange({ type: nextType, categoryId: undefined })
        }
      />

      <div className="flex gap-2">
        <Select
          value={accountId ?? "all"}
          onValueChange={(value) =>
            onChange({ accountId: value === "all" ? undefined : value })
          }
          disabled={accountsLoading}
        >
          <SelectTrigger className="flex-1 bg-white">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts?.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!isTransfer && (
          <Select
            value={categoryId ?? "all"}
            onValueChange={(value) =>
              onChange({ categoryId: value === "all" ? undefined : value })
            }
            disabled={categoriesLoading}
          >
            <SelectTrigger className="flex-1 bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 justify-between bg-white font-normal",
                !hasDateRange && "text-muted-foreground",
              )}
            >
              {dateLabel}
              <CalendarIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) =>
                onChange({
                  dateFrom: range?.from
                    ? format(range.from, "yyyy-MM-dd")
                    : undefined,
                  dateTo: range?.to
                    ? format(range.to, "yyyy-MM-dd")
                    : undefined,
                })
              }
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {hasDateRange && (
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Clear date range"
            onClick={() => onChange({ dateFrom: undefined, dateTo: undefined })}
          >
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
