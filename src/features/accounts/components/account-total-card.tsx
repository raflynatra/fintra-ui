"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { getBalanceSummary } from "@/features/accounts/utils";

/** Overview tile showing the combined balance across active accounts. */
export function AccountTotalCard() {
  const {
    data: accounts,
    isPending,
    isError,
  } = useAccounts({
    includeArchived: true,
  });

  const { total, activeCount, archivedCount } = getBalanceSummary(
    accounts ?? [],
  );

  return (
    <Card className="justify-center">
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Total balance</p>

        {isPending ? (
          <Skeleton className="h-8 w-40" />
        ) : isError ? (
          <p className="text-2xl font-bold text-muted-foreground">—</p>
        ) : (
          <p
            className={cn(
              "text-2xl font-bold",
              total < 0 && "text-destructive",
            )}
          >
            {formatCurrency(total)}
          </p>
        )}

        {!isPending && !isError && (
          <p className="text-xs text-muted-foreground">
            {activeCount} active
            {archivedCount > 0 && ` · ${archivedCount} archived`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
