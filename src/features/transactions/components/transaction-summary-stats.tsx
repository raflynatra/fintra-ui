"use client";

import { useState } from "react";
import { LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";

interface TransactionSummaryStats {
  label: string;
  value: number | undefined;
  isLoading: boolean;
  valueClassName?: string;
  icon?: LucideIcon;
  compact?: boolean;
}

export function TransactionSummaryStats({
  label,
  value,
  valueClassName,
  isLoading,
  icon: Icon,
  compact = false,
}: TransactionSummaryStats) {
  const [open, setOpen] = useState(false);
  const exact = formatCurrency(value ?? 0);

  const valueClasses = cn(
    "truncate font-semibold text-primary-foreground",
    valueClassName,
  );

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
            className={cn(
              "bg-muted/20",
              label === "Net" ? "h-7 w-64" : "h-4 w-28",
            )}
          />
        ) : compact ? (
          <Tooltip
            open={open}
            onOpenChange={(next) => !next && setOpen(false)}
            disableHoverableContent
          >
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(valueClasses, "block max-w-full text-left")}
                onPointerDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.preventDefault();
                  setOpen((previous) => !previous);
                }}
              >
                <span className="@sm:hidden">
                  {formatCurrencyCompact(value ?? 0)}
                </span>
                <span className="hidden @sm:inline">{exact}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{exact}</TooltipContent>
          </Tooltip>
        ) : (
          <p title={exact} className={valueClasses}>
            {exact}
          </p>
        )}
      </div>
    </div>
  );
}
