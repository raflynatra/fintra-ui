"use client";

import { ChartPieIcon } from "lucide-react";

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
import { formatMonth } from "@/lib/format";

interface CategoryBreakdownCardProps {
  month: string;
}

/** Where the month's money went, split by category. */
export function CategoryBreakdownCard({ month }: CategoryBreakdownCardProps) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Where the money went</CardTitle>
        <CardDescription>Spending by category · {formatMonth(month)}</CardDescription>
      </CardHeader>

      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartPieIcon />
            </EmptyMedia>
            <EmptyTitle>Nothing spent this month</EmptyTitle>
            <EmptyDescription>
              Record a transaction and this fills with the categories taking the
              biggest share.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}
