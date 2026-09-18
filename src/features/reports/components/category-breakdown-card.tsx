"use client";

import { ChartPieIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatMonth } from "@/lib/format";
import { useCategoryBreakdown } from "@/features/reports/hooks/use-category-breakdown";
import { REMAINDER_LABEL } from "@/features/reports/utils";
import type { CategorySlice } from "@/features/reports/types";

/**
 * The categorical slots from `globals.css`, in fixed order and never cycled.
 * Anything past them has already been folded into one remainder slice.
 */
const SLICE_COLORS = [
  "var(--viz-1)",
  "var(--viz-2)",
  "var(--viz-3)",
  "var(--viz-4)",
  "var(--viz-5)",
  "var(--viz-6)",
  "var(--viz-7)",
];

function sliceColor(slice: CategorySlice, index: number): string {
  return slice.key === REMAINDER_LABEL
    ? "var(--viz-remainder)"
    : SLICE_COLORS[index % SLICE_COLORS.length];
}

interface CategoryBreakdownCardProps {
  month: string;
}

/** Where the month's money went, split by category. */
export function CategoryBreakdownCard({ month }: CategoryBreakdownCardProps) {
  const { data, isPending, isError } = useCategoryBreakdown(month);
  const slices = data?.slices ?? [];

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Where the money went</CardTitle>
        <CardDescription>
          Spending by category · {formatMonth(month)}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="size-44 rounded-full" />
            <div className="flex w-full flex-col gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-full" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Couldn&apos;t load this month&apos;s spending.
          </p>
        ) : slices.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ChartPieIcon />
              </EmptyMedia>
              <EmptyTitle>Nothing spent this month</EmptyTitle>
              <EmptyDescription>
                Record a transaction and this fills with the categories taking
                the biggest share.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative mx-auto h-48 w-full max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="total"
                    nameKey="label"
                    innerRadius="62%"
                    outerRadius="100%"
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {slices.map((slice, index) => (
                      <Cell key={slice.key} fill={sliceColor(slice, index)} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* The hole carries the figure the slices are shares of. */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Spent</span>
                <span className="text-lg font-bold">
                  {formatCurrency(data?.total ?? 0)}
                </span>
              </div>
            </div>

            {/* Identity never rests on colour alone: every slice is named here. */}
            <ul className="flex flex-col gap-1.5">
              {slices.map((slice, index) => (
                <li
                  key={slice.key}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: sliceColor(slice, index) }}
                  />
                  <span className="min-w-0 flex-1 truncate">{slice.label}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {slice.share}%
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatCurrency(slice.total)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
