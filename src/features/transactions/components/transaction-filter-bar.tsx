"use client";

import { useState } from "react";
import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionFilters } from "@/features/transactions/components/transaction-filters";
import { TransactionMonthNav } from "@/features/transactions/components/transaction-month-nav";
import { useTransactionStore } from "@/features/transactions/store";
import { activeFilterCount } from "@/features/transactions/utils";
import { useCategories, toCategoryType } from "@/features/categories";
import { useAccounts } from "@/features/accounts";

export function TransactionFilterBar() {
  const [open, setOpen] = useState(false);

  const params = useTransactionStore((state) => state.params);
  const month = useTransactionStore((state) => state.month);
  const onChange = useTransactionStore((state) => state.setFilters);
  const setMonth = useTransactionStore((state) => state.setMonth);
  const clearFilters = useTransactionStore((state) => state.clearFilters);

  const { type, categoryId, accountId } = params;

  const { data: categories, isLoading: categoriesLoading } = useCategories(
    toCategoryType(type),
  );
  const { data: accounts, isLoading: accountsLoading } = useAccounts({
    includeArchived: true,
  });

  const isTransfer = type === "transfer";
  const filterCount = activeFilterCount(params);

  return (
    <div className="flex flex-col gap-2">
      <TransactionMonthNav value={month} onChange={setMonth} />

      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="flex flex-col gap-2"
      >
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="justify-between bg-white font-normal"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontalIcon className="size-4" />
              Filters
              {filterCount > 0 && (
                <Badge variant="secondary">{filterCount}</Badge>
              )}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform",
                open && "rotate-180",
              )}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="flex flex-col gap-2">
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

          {filterCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-end"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
