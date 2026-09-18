import Link from "next/link";
import { ChartPieIcon, ChevronRightIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";

/** The dashboard's only way into reports; reports takes no navigation slot. */
export function ReportsEntryCard() {
  return (
    <Card className="justify-center transition-colors hover:bg-accent/40">
      <CardContent>
        <Link
          href={APP_ROUTES.reports}
          className="flex items-center gap-3 text-left"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ChartPieIcon className="size-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Reports</span>
            <span className="block text-xs text-muted-foreground">
              Where the money went, and how it&apos;s trending
            </span>
          </span>

          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </CardContent>
    </Card>
  );
}
