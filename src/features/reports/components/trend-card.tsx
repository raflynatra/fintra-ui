"use client";

import { ChartColumnIcon } from "lucide-react";

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

/**
 * Income against expense over the last twelve months. The window is relative to
 * today, not to the selected month, so the card says so rather than appearing to
 * follow the switcher.
 */
export function TrendCard() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>How it&apos;s trending</CardTitle>
        <CardDescription>
          Income against expense · last 12 months
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartColumnIcon />
            </EmptyMedia>
            <EmptyTitle>No history yet</EmptyTitle>
            <EmptyDescription>
              Once you have a month or two of transactions, the trend shows
              whether you&apos;re spending more than you earn.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}
