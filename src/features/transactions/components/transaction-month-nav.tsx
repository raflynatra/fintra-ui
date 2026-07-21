"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatMonth } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { currentMonth, shiftMonth } from "@/features/transactions/utils";

interface TransactionMonthNavProps {
  /** The selected period as "YYYY-MM". */
  value: string;
  onChange: (month: string) => void;
  className?: string;
}

export function TransactionMonthNav({
  value,
  onChange,
  className,
}: TransactionMonthNavProps) {
  const isCurrentMonth = value === currentMonth();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Previous month"
        onClick={() => onChange(shiftMonth(value, -1))}
      >
        <ChevronLeftIcon className="size-5" />
      </Button>

      <p className="flex-1 text-center text-base font-semibold">
        {formatMonth(value)}
      </p>

      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Next month"
        disabled={isCurrentMonth}
        onClick={() => onChange(shiftMonth(value, 1))}
      >
        <ChevronRightIcon className="size-5" />
      </Button>
    </div>
  );
}
