"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TRANSACTION_TYPES } from "@/features/transactions/schema";
import type { TransactionType } from "@/features/transactions/types";

const TYPE_FILTER_OPTIONS = ["all", ...TRANSACTION_TYPES] as const;
type TypeFilter = (typeof TYPE_FILTER_OPTIONS)[number];

interface TransactionFiltersProps {
  value: TransactionType | undefined;
  onChange: (type: TransactionType | undefined) => void;
  className?: string;
}

export function TransactionFilters({
  value,
  onChange,
  className,
}: TransactionFiltersProps) {
  const current: TypeFilter = value ?? "all";

  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-1 rounded-lg bg-muted p-1",
        className,
      )}
    >
      {TYPE_FILTER_OPTIONS.map((option) => (
        <Button
          key={option}
          type="button"
          variant="ghost"
          onClick={() => onChange(option === "all" ? undefined : option)}
          aria-pressed={current === option}
          className={cn(
            "h-auto rounded-md px-1 py-1.5 text-sm capitalize hover:bg-transparent",
            current === option
              ? "bg-card text-foreground shadow-sm hover:bg-card"
              : "text-muted-foreground",
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
